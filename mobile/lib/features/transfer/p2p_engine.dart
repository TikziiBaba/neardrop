import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:background_downloader/background_downloader.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:mime/mime.dart';
import 'package:path_provider/path_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/device.dart';
import '../../core/i18n.dart';
import '../../state/files_store.dart';

/// Web'deki DirectTransferEngine (lib/transfer/p2p-client.ts) ile aynı protokol:
/// Supabase Realtime kanalı `neardrop_room_<oda>` üzerinde presence + broadcast ile sinyal,
/// WebRTC DataChannel "neardrop-data" üzerinden 64 KB'lık parçalar; kanal açılamazsa base64 broadcast yedeği.
const _chunkSize = 64 * 1024;
const _iceServers = [
  {'urls': 'stun:stun.l.google.com:19302'},
  {'urls': 'stun:stun1.l.google.com:19302'},
  {'urls': 'stun:stun2.l.google.com:19302'},
];

class Peer {
  final String deviceId;
  final String deviceName;
  final String deviceType;
  final String platform;
  final String browser;
  final bool isApp;

  const Peer({
    required this.deviceId,
    required this.deviceName,
    required this.deviceType,
    required this.platform,
    required this.browser,
    required this.isApp,
  });

  factory Peer.fromPayload(Map<String, dynamic> p) => Peer(
        deviceId: '${p['deviceId']}',
        deviceName: '${p['deviceName'] ?? 'Device'}',
        deviceType: '${p['deviceType'] ?? 'desktop'}',
        platform: '${p['platform'] ?? 'web'}',
        browser: '${p['browser'] ?? ''}',
        isApp: p['app'] == 'neardrop-mobile',
      );

  String get shortName => deviceName.replaceAll(RegExp(r'\s*\((NearDrop App|[^)]*)\)$'), '');
}

enum P2PStatus { requesting, accepted, transferring, completed, declined, cancelled, failed }

class P2PTransfer {
  final String transferId;
  final String filename;
  final int size;
  final bool outgoing;
  final String peerName;
  P2PStatus status;
  int transferred = 0;
  int speed = 0;
  int? eta;
  String? savedPath;
  String? error;
  DateTime startedAt = DateTime.now();

  P2PTransfer({
    required this.transferId,
    required this.filename,
    required this.size,
    required this.outgoing,
    required this.peerName,
    required this.status,
  });

  double get progress => size <= 0 ? (status == P2PStatus.completed ? 1 : 0) : (transferred / size).clamp(0.0, 1.0);
  bool get isActive => status == P2PStatus.requesting || status == P2PStatus.accepted || status == P2PStatus.transferring;
}

class IncomingRequest {
  final String transferId;
  final String senderId;
  final String senderName;
  final String filename;
  final int size;
  final String mimeType;

  IncomingRequest.fromJson(Map<String, dynamic> j)
      : transferId = '${j['transferId']}',
        senderId = '${j['senderId']}',
        senderName = '${j['senderName'] ?? 'Device'}',
        filename = '${j['filename'] ?? 'file'}',
        size = (j['size'] as num?)?.toInt() ?? 0,
        mimeType = '${j['mimeType'] ?? 'application/octet-stream'}';
}

class _Incoming {
  final IncomingRequest meta;
  final RandomAccessFile file;
  final String path;
  int received = 0;
  final DateTime startedAt = DateTime.now();
  _Incoming(this.meta, this.file, this.path);
}

class P2PEngine extends ChangeNotifier {
  final _supabase = Supabase.instance.client;
  RealtimeChannel? _channel;

  String room = 'lobby';
  bool connected = false;
  bool joining = false;
  List<Peer> peers = [];
  final List<P2PTransfer> transfers = [];
  final List<IncomingRequest> incoming = [];

  /// Android "Paylaş" menüsünden gelip alıcı seçilmeyi bekleyen dosyalar
  List<LocalFile> staged = [];

  final _pcs = <String, RTCPeerConnection>{};
  final _dcs = <String, RTCDataChannel>{};
  final _pendingCandidates = <String, List<RTCIceCandidate>>{};
  final _outgoing = <String, (LocalFile, Peer, P2PTransfer)>{};
  final _sessions = <String, _Incoming>{};
  DateTime _lastNotify = DateTime.fromMillisecondsSinceEpoch(0);

  String get _myId => DeviceIdentity.current.deviceId;

  void _notifyThrottled() {
    final now = DateTime.now();
    if (now.difference(_lastNotify).inMilliseconds >= 120) {
      _lastNotify = now;
      notifyListeners();
    }
  }

  // ───────────── Oda ─────────────

  Future<void> join(String roomCode) async {
    final code = roomCode.trim().toLowerCase().isEmpty ? 'lobby' : roomCode.trim().toLowerCase();
    if (_channel != null && code == room && connected) return;
    await leave(notify: false);
    room = code;
    joining = true;
    notifyListeners();

    final channel = _supabase.channel('neardrop_room_$code', opts: RealtimeChannelConfig(key: _myId));
    _channel = channel;

    channel
      ..onPresenceSync((_) => _syncPeers())
      ..onPresenceJoin((payload) {
        for (final p in payload.newPresences) {
          final id = '${p.payload['deviceId']}';
          if (id != _myId && _shouldInitiate(p.payload)) _initiate(id);
        }
      })
      ..onPresenceLeave((payload) {
        for (final p in payload.leftPresences) {
          _closePeer('${p.payload['deviceId']}');
        }
      })
      ..onBroadcast(event: 'signal', callback: (msg) {
        final data = _inner(msg);
        if (data['targetId'] == _myId) _handleSignal(data);
      })
      ..onBroadcast(event: 'transfer_request', callback: (msg) {
        final data = _inner(msg);
        if (data['receiverId'] == _myId) {
          incoming.add(IncomingRequest.fromJson(data));
          notifyListeners();
        }
      })
      ..onBroadcast(event: 'transfer_response', callback: (msg) {
        final data = _inner(msg);
        if (data['senderId'] == _myId) _handleResponse(data);
      })
      ..onBroadcast(event: 'transfer_chunk', callback: (msg) {
        final data = _inner(msg);
        if (data['receiverId'] == _myId) {
          _handleBroadcastChunk(
            '${data['transferId']}',
            (data['chunkIndex'] as num?)?.toInt() ?? 0,
            '${data['chunkData'] ?? ''}',
            data['isLast'] == true,
          );
        }
      })
      ..subscribe((status, error) async {
        if (status == RealtimeSubscribeStatus.subscribed) {
          connected = true;
          joining = false;
          notifyListeners();
          await channel.track(DeviceIdentity.current.toPresence());
        } else if (status == RealtimeSubscribeStatus.channelError ||
            status == RealtimeSubscribeStatus.timedOut ||
            status == RealtimeSubscribeStatus.closed) {
          connected = false;
          joining = false;
          notifyListeners();
        }
      });
  }

  Future<void> leave({bool notify = true}) async {
    final channel = _channel;
    _channel = null;
    for (final pc in _pcs.values) {
      await pc.close();
    }
    _pcs.clear();
    _dcs.clear();
    _pendingCandidates.clear();
    peers = [];
    connected = false;
    if (channel != null) {
      try {
        await channel.untrack();
      } catch (_) {}
      await _supabase.removeChannel(channel);
    }
    if (notify) notifyListeners();
  }

  /// Supabase Dart istemcisi broadcast mesajının tamamını verir; asıl veri `payload` içindedir.
  Map<String, dynamic> _inner(Map<String, dynamic> msg) {
    final p = msg['payload'];
    return p is Map ? p.cast<String, dynamic>() : msg;
  }

  void _syncPeers() {
    final channel = _channel;
    if (channel == null) return;
    final list = <Peer>[];
    for (final state in channel.presenceState()) {
      if (state.key == _myId || state.presences.isEmpty) continue;
      final peer = Peer.fromPayload(state.presences.first.payload);
      list.add(peer);
      if (_shouldInitiate(state.presences.first.payload) && !_pcs.containsKey(peer.deviceId)) _initiate(peer.deviceId);
    }
    peers = list;
    notifyListeners();
  }

  /// Web istemcileri her yeni katılana kendileri teklif gönderir; uygulamalar arasında
  /// çakışma olmasın diye yalnızca kimliği küçük olan taraf başlatır.
  bool _shouldInitiate(Map<String, dynamic> payload) {
    final id = '${payload['deviceId']}';
    return payload['app'] == 'neardrop-mobile' && id != _myId && _myId.compareTo(id) < 0;
  }

  // ───────────── WebRTC ─────────────

  Future<RTCPeerConnection> _createPc(String targetId) async {
    final pc = await createPeerConnection({'iceServers': _iceServers});
    pc.onIceCandidate = (c) {
      if (c.candidate == null || c.candidate!.isEmpty) return;
      _send('signal', {
        'targetId': targetId,
        'senderId': _myId,
        'type': 'candidate',
        'candidate': {'candidate': c.candidate, 'sdpMid': c.sdpMid, 'sdpMLineIndex': c.sdpMLineIndex},
      });
    };
    pc.onDataChannel = (dc) => _setupDataChannel(targetId, dc);
    pc.onConnectionState = (state) {
      if (state == RTCPeerConnectionState.RTCPeerConnectionStateFailed) _closePeer(targetId);
    };
    _pcs[targetId] = pc;
    return pc;
  }

  Future<void> _initiate(String targetId) async {
    try {
      final pc = await _createPc(targetId);
      final dc = await pc.createDataChannel('neardrop-data', RTCDataChannelInit()..ordered = true);
      _setupDataChannel(targetId, dc);
      final offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      _send('signal', {
        'targetId': targetId,
        'senderId': _myId,
        'type': 'offer',
        'sdp': {'type': offer.type, 'sdp': offer.sdp},
      });
    } catch (e) {
      debugPrint('P2P offer failed: $e');
    }
  }

  void _setupDataChannel(String peerId, RTCDataChannel dc) {
    if (dc.state == RTCDataChannelState.RTCDataChannelOpen) _dcs[peerId] = dc;
    dc.onDataChannelState = (state) {
      if (state == RTCDataChannelState.RTCDataChannelOpen) {
        _dcs[peerId] = dc;
      } else if (state == RTCDataChannelState.RTCDataChannelClosed) {
        if (_dcs[peerId] == dc) _dcs.remove(peerId);
      }
    };
    dc.onMessage = (msg) {
      if (msg.isBinary) _handleBinaryChunk(msg.binary);
    };
  }

  Future<void> _handleSignal(Map<String, dynamic> p) async {
    final senderId = '${p['senderId']}';
    final type = p['type'];
    try {
      if (type == 'offer') {
        // Yeni teklif = karşı taraf bağlantıyı baştan kuruyor
        final old = _pcs.remove(senderId);
        await old?.close();
        final pc = await _createPc(senderId);
        final sdp = (p['sdp'] as Map).cast<String, dynamic>();
        await pc.setRemoteDescription(RTCSessionDescription(sdp['sdp'] as String?, sdp['type'] as String?));
        await _flushCandidates(senderId);
        final answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        _send('signal', {
          'targetId': senderId,
          'senderId': _myId,
          'type': 'answer',
          'sdp': {'type': answer.type, 'sdp': answer.sdp},
        });
      } else if (type == 'answer') {
        final pc = _pcs[senderId];
        final sdp = (p['sdp'] as Map).cast<String, dynamic>();
        if (pc != null) {
          await pc.setRemoteDescription(RTCSessionDescription(sdp['sdp'] as String?, sdp['type'] as String?));
          await _flushCandidates(senderId);
        }
      } else if (type == 'candidate' && p['candidate'] is Map) {
        final c = (p['candidate'] as Map).cast<String, dynamic>();
        final candidate = RTCIceCandidate(c['candidate'] as String?, c['sdpMid'] as String?, (c['sdpMLineIndex'] as num?)?.toInt());
        final pc = _pcs[senderId];
        if (pc != null && await pc.getRemoteDescription() != null) {
          await pc.addCandidate(candidate);
        } else {
          _pendingCandidates.putIfAbsent(senderId, () => []).add(candidate);
        }
      }
    } catch (e) {
      debugPrint('P2P signal error: $e');
    }
  }

  Future<void> _flushCandidates(String peerId) async {
    final list = _pendingCandidates.remove(peerId);
    final pc = _pcs[peerId];
    if (list == null || pc == null) return;
    for (final c in list) {
      try {
        await pc.addCandidate(c);
      } catch (_) {}
    }
  }

  void _closePeer(String id) {
    _pcs.remove(id)?.close();
    _dcs.remove(id);
  }

  Future<void> _send(String event, Map<String, dynamic> payload) async {
    await _channel?.sendBroadcastMessage(event: event, payload: payload);
  }

  // ───────────── Gönderme ─────────────

  void stageFiles(List<LocalFile> files) {
    staged = files;
    notifyListeners();
  }

  void clearStaged() {
    staged = [];
    notifyListeners();
  }

  void sendFiles(Peer peer, List<LocalFile> files) {
    for (final f in files) {
      _requestSend(peer, f);
    }
  }

  void _requestSend(Peer peer, LocalFile file) {
    final rand = Random();
    final id = 'dt_${DateTime.now().millisecondsSinceEpoch}_${List.generate(5, (_) => 'abcdefghijklmnopqrstuvwxyz0123456789'[rand.nextInt(36)]).join()}';
    final transfer = P2PTransfer(
      transferId: id,
      filename: file.name,
      size: file.size,
      outgoing: true,
      peerName: peer.shortName,
      status: P2PStatus.requesting,
    );
    transfers.insert(0, transfer);
    _outgoing[id] = (file, peer, transfer);
    notifyListeners();
    _send('transfer_request', {
      'transferId': id,
      'senderId': _myId,
      'senderName': DeviceIdentity.current.deviceName,
      'receiverId': peer.deviceId,
      'filename': file.name,
      'size': file.size,
      'mimeType': lookupMimeType(file.name) ?? 'application/octet-stream',
    });
    // Karşı taraf hiç yanıt vermezse sonsuza kadar beklemesin
    Timer(const Duration(seconds: 90), () {
      if (transfer.status == P2PStatus.requesting) {
        transfer
          ..status = P2PStatus.failed
          ..error = t('Karşı cihaz yanıt vermedi', 'The other device did not respond');
        _outgoing.remove(id);
        notifyListeners();
      }
    });
  }

  Future<void> _handleResponse(Map<String, dynamic> p) async {
    final id = '${p['transferId']}';
    final entry = _outgoing[id];
    if (entry == null) return;
    final (file, peer, transfer) = entry;
    if (p['accepted'] != true) {
      transfer.status = P2PStatus.declined;
      _outgoing.remove(id);
      notifyListeners();
      return;
    }
    transfer
      ..status = P2PStatus.transferring
      ..startedAt = DateTime.now();
    notifyListeners();
    await _stream(id, '${p['receiverId'] ?? peer.deviceId}', file, transfer);
    _outgoing.remove(id);
  }

  Future<void> _stream(String transferId, String receiverId, LocalFile file, P2PTransfer transfer) async {
    RandomAccessFile? raf;
    try {
      raf = await File(file.path).open();
      final total = file.size;
      var offset = 0;
      var sentSinceCheck = 0;
      if (total == 0) {
        await _send('transfer_chunk', {'transferId': transferId, 'receiverId': receiverId, 'chunkIndex': 0, 'chunkData': '', 'isLast': true});
      }
      while (offset < total) {
        if (transfer.status == P2PStatus.cancelled) return;
        final bytes = await raf.read(_chunkSize);
        if (bytes.isEmpty) break;
        final isLast = offset + bytes.length >= total;
        final dc = _dcs[receiverId];
        if (dc != null && dc.state == RTCDataChannelState.RTCDataChannelOpen) {
          // Akış kontrolü: tampon 4 MB'ı aşınca boşalmasını bekle
          if (sentSinceCheck >= 1024 * 1024) {
            sentSinceCheck = 0;
            var buffered = await dc.getBufferedAmount();
            while (buffered > 4 * 1024 * 1024 && transfer.status != P2PStatus.cancelled) {
              await Future.delayed(const Duration(milliseconds: 25));
              buffered = await dc.getBufferedAmount();
            }
          }
          await dc.send(RTCDataChannelMessage.fromBinary(bytes));
          sentSinceCheck += bytes.length;
        } else {
          // Yedek: Realtime broadcast üzerinden base64 parça
          await _send('transfer_chunk', {
            'transferId': transferId,
            'receiverId': receiverId,
            'chunkIndex': offset,
            'chunkData': base64Encode(bytes),
            'isLast': isLast,
          });
          await Future.delayed(const Duration(milliseconds: 10));
        }
        offset += bytes.length;
        _progress(transfer, offset);
      }
      transfer.status = P2PStatus.completed;
      transfer.transferred = total;
      notifyListeners();
    } catch (e) {
      transfer
        ..status = P2PStatus.failed
        ..error = e.toString();
      notifyListeners();
    } finally {
      await raf?.close();
    }
  }

  void _progress(P2PTransfer t, int done) {
    t.transferred = done;
    final elapsed = DateTime.now().difference(t.startedAt).inMilliseconds / 1000;
    t.speed = elapsed > 0 ? (done / elapsed).round() : 0;
    t.eta = t.speed > 0 ? ((t.size - done) / t.speed).round() : null;
    _notifyThrottled();
  }

  void cancel(P2PTransfer transfer) {
    transfer.status = P2PStatus.cancelled;
    final session = _sessions.remove(transfer.transferId);
    if (session != null) {
      session.file.closeSync();
      try {
        File(session.path).deleteSync();
      } catch (_) {}
    }
    notifyListeners();
  }

  // ───────────── Alma ─────────────

  Future<void> accept(IncomingRequest req) async {
    incoming.remove(req);
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/p2p_${req.transferId}_${req.filename.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_')}';
    final raf = File(path).openSync(mode: FileMode.write);
    _sessions[req.transferId] = _Incoming(req, raf, path);
    transfers.insert(
      0,
      P2PTransfer(
        transferId: req.transferId,
        filename: req.filename,
        size: req.size,
        outgoing: false,
        peerName: req.senderName.replaceAll(RegExp(r'\s*\([^)]*\)$'), ''),
        status: P2PStatus.accepted,
      ),
    );
    notifyListeners();
    await _send('transfer_response', {
      'transferId': req.transferId,
      'senderId': req.senderId,
      'receiverId': _myId,
      'accepted': true,
    });
    if (req.size == 0) _finalize(req.transferId);
  }

  Future<void> decline(IncomingRequest req) async {
    incoming.remove(req);
    notifyListeners();
    await _send('transfer_response', {
      'transferId': req.transferId,
      'senderId': req.senderId,
      'receiverId': _myId,
      'accepted': false,
    });
  }

  P2PTransfer? _transfer(String id) => transfers.where((t) => t.transferId == id).firstOrNull;

  /// DataChannel'dan gelen ikili parça — web gibi ilk etkin alım oturumuna yazılır.
  void _handleBinaryChunk(Uint8List bytes) {
    if (_sessions.isEmpty) return;
    final id = _sessions.keys.first;
    final s = _sessions[id]!;
    s.file.writeFromSync(bytes);
    s.received += bytes.length;
    _afterChunk(id, s, s.received >= s.meta.size);
  }

  void _handleBroadcastChunk(String id, int offset, String base64Data, bool isLast) {
    final s = _sessions[id];
    if (s == null) return;
    final bytes = base64Data.isEmpty ? Uint8List(0) : base64Decode(base64Data);
    s.file
      ..setPositionSync(offset)
      ..writeFromSync(bytes);
    s.received += bytes.length;
    _afterChunk(id, s, isLast || s.received >= s.meta.size);
  }

  void _afterChunk(String id, _Incoming s, bool done) {
    final t = _transfer(id);
    if (t != null) {
      t.status = P2PStatus.transferring;
      t.startedAt = s.startedAt;
      _progress(t, s.received.clamp(0, s.meta.size));
    }
    if (done) _finalize(id);
  }

  Future<void> _finalize(String id) async {
    final s = _sessions.remove(id);
    if (s == null) return;
    await s.file.close();
    final t = _transfer(id);
    try {
      await ensureSharedStoragePermission();
      final saved = await FileDownloader().moveFileToSharedStorage(s.path, SharedStorage.downloads, directory: 'NearDrop');
      t
        ?..status = P2PStatus.completed
        ..transferred = s.meta.size
        ..savedPath = saved ?? s.path;
    } catch (e) {
      t
        ?..status = P2PStatus.completed
        ..savedPath = s.path;
    }
    notifyListeners();
  }

  void clearFinished() {
    transfers.removeWhere((t) => !t.isActive);
    notifyListeners();
  }

  @override
  void dispose() {
    leave(notify: false);
    super.dispose();
  }
}
