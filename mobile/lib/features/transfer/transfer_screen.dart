import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:open_filex/open_filex.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/config.dart';
import '../../core/device.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/picker.dart';
import '../../theme/app_theme.dart';
import '../../widgets/allay.dart';
import '../../widgets/ui.dart';
import '../scanner/qr_scan_screen.dart';
import '../shell/home_shell.dart';
import 'p2p_engine.dart';

const kNavPadding = 128.0;

IconData deviceIcon(String type, String platform) {
  if (type == 'mobile') return LucideIcons.smartphone;
  if (type == 'tablet') return LucideIcons.tablet;
  if (type == 'laptop' || platform == 'macos') return LucideIcons.laptop;
  return LucideIcons.monitor;
}

class TransferScreen extends StatefulWidget {
  final Widget? header;
  const TransferScreen({super.key, this.header});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> with WidgetsBindingObserver {
  bool _radar = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    ShellController.instance.addListener(_checkRoom);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final pending = ShellController.instance.pendingRoom;
      ShellController.instance.pendingRoom = null;
      context.read<P2PEngine>().join(pending ?? context.read<P2PEngine>().room);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    ShellController.instance.removeListener(_checkRoom);
    super.dispose();
  }

  void _checkRoom() {
    final pending = ShellController.instance.pendingRoom;
    if (pending != null && mounted) {
      ShellController.instance.pendingRoom = null;
      context.read<P2PEngine>().join(pending);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Arka plandan dönünce kopan Realtime bağlantısını yenile
    if (state == AppLifecycleState.resumed) {
      final engine = context.read<P2PEngine>();
      if (!engine.connected && !engine.joining) engine.join(engine.room);
    }
  }

  Future<void> _sendTo(Peer peer) async {
    final engine = context.read<P2PEngine>();
    var files = engine.staged;
    if (files.isEmpty) files = await pickLocalFiles();
    if (files.isEmpty || !mounted) return;
    engine.sendFiles(peer, files);
    engine.clearStaged();
    showToast(context, t('${peer.shortName} cihazına istek gönderildi.', 'Request sent to ${peer.shortName}.'), success: true);
  }

  @override
  Widget build(BuildContext context) {
    context.isTr;
    final engine = context.watch<P2PEngine>();
    final me = DeviceIdentity.current;

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        slivers: [
          if (widget.header != null) SliverToBoxAdapter(child: widget.header),
          SliverToBoxAdapter(
            child: PageTitle(
              title: t('Yakındakiler', 'Nearby'),
              subtitle: t('Aynı odadaki cihazlara doğrudan gönder', 'Send directly to devices in the same room'),
              actions: [
                CircleIconButton(
                  icon: LucideIcons.scanLine,
                  tooltip: t('QR tara', 'Scan QR'),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QrScanScreen())),
                ),
                CircleIconButton(icon: LucideIcons.qrCode, tooltip: t('Odayı paylaş', 'Share room'), onTap: () => _showRoomQr(context)),
              ],
            ),
          ),
          SliverToBoxAdapter(child: _RoomBar(engine: engine)),
          if (engine.staged.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: GlassCard(
                  glow: true,
                  borderColor: AppColors.accent.withValues(alpha: 0.5),
                  padding: const EdgeInsets.all(14),
                  child: Row(children: [
                    Icon(LucideIcons.package, color: AppColors.accentText),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        t('${engine.staged.length} dosya hazır — göndermek için bir cihaza dokun',
                            '${engine.staged.length} file(s) ready — tap a device to send'),
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                    IconButton(icon: const Icon(LucideIcons.x, size: 18), onPressed: engine.clearStaged),
                  ]),
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
              child: Row(children: [
                Text(
                  engine.peers.isEmpty
                      ? t('Cihaz aranıyor…', 'Looking for devices…')
                      : t('${engine.peers.length} cihaz bulundu', '${engine.peers.length} device(s) found'),
                  style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                _ViewToggle(radar: _radar, onChanged: (v) => setState(() => _radar = v)),
              ]),
            ),
          ),
          SliverToBoxAdapter(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 350),
              child: _radar
                  ? _Radar(key: const ValueKey('radar'), peers: engine.peers, me: me, onTap: _sendTo)
                  : _PeerGrid(key: const ValueKey('grid'), peers: engine.peers, onTap: _sendTo),
            ),
          ),
          if (engine.transfers.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: SectionHeader(
                  title: t('Bu oturumdaki aktarımlar', 'Transfers this session'),
                  action: t('Temizle', 'Clear'),
                  onAction: engine.clearFinished,
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList.separated(
                itemCount: engine.transfers.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (_, i) => _TransferTile(transfer: engine.transfers[i]),
              ),
            ),
          ],
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 0),
              child: _HowItWorks(),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: kNavPadding)),
        ],
      ),
    );
  }
}

class _RoomBar extends StatelessWidget {
  final P2PEngine engine;
  const _RoomBar({required this.engine});

  @override
  Widget build(BuildContext context) {
    final status = engine.connected
        ? (t('Bağlı', 'Connected'), AppColors.success)
        : engine.joining
            ? (t('Bağlanıyor', 'Connecting'), AppColors.warning)
            : (t('Bağlantı yok', 'Offline'), AppColors.danger);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GlassCard(
        padding: const EdgeInsets.fromLTRB(16, 12, 10, 12),
        onTap: () => showRoomSheet(context),
        child: Row(children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(color: AppColors.accent.withValues(alpha: 0.16), borderRadius: BorderRadius.circular(13)),
            child: Icon(LucideIcons.doorOpen, color: AppColors.accentText, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(t('Oda', 'Room'), style: TextStyle(color: AppColors.subtle, fontSize: 12)),
              Text(engine.room, style: AppTheme.display(19)),
            ]),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: status.$2.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
            child: Row(children: [
              Container(width: 7, height: 7, decoration: BoxDecoration(color: status.$2, shape: BoxShape.circle))
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .fade(begin: 0.4, end: 1, duration: 900.ms),
              const SizedBox(width: 6),
              Text(status.$1, style: TextStyle(color: status.$2, fontSize: 12, fontWeight: FontWeight.w700)),
            ]),
          ),
          const SizedBox(width: 4),
          Icon(LucideIcons.chevronRight, size: 18, color: AppColors.subtle),
        ]),
      ),
    );
  }
}

class _ViewToggle extends StatelessWidget {
  final bool radar;
  final ValueChanged<bool> onChanged;
  const _ViewToggle({required this.radar, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    Widget item(bool value, IconData icon) => GestureDetector(
          onTap: () => onChanged(value),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: radar == value ? AppColors.accent.withValues(alpha: 0.25) : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 16, color: radar == value ? AppColors.accentText : AppColors.subtle),
          ),
        );
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(13), border: Border.all(color: AppColors.border)),
      child: Row(children: [item(true, LucideIcons.radar), item(false, LucideIcons.layoutGrid)]),
    );
  }
}

class _Radar extends StatefulWidget {
  final List<Peer> peers;
  final DeviceIdentity me;
  final ValueChanged<Peer> onTap;
  const _Radar({super.key, required this.peers, required this.me, required this.onTap});

  @override
  State<_Radar> createState() => _RadarState();
}

class _RadarState extends State<_Radar> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, box) {
      final size = math.min(box.maxWidth, 360.0);
      final center = size / 2;
      final peers = widget.peers;
      return SizedBox(
        height: size,
        child: Center(
          child: SizedBox(
            width: size,
            height: size,
            child: Stack(clipBehavior: Clip.none, children: [
              Positioned.fill(
                child: RepaintBoundary(
                  child: AnimatedBuilder(
                    animation: _c,
                    builder: (_, _) => CustomPaint(painter: _RadarPainter(_c.value)),
                  ),
                ),
              ),
              // Ortada bu cihaz
              Positioned(
                left: center - 38,
                top: center - 38,
                child: Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    gradient: AppColors.brandGradient,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: AppColors.accent.withValues(alpha: 0.6), blurRadius: 30)],
                    border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 2),
                  ),
                  child: Icon(deviceIcon(widget.me.deviceType, widget.me.platform), color: Colors.white, size: 30),
                ),
              ),
              Positioned(
                left: 0,
                right: 0,
                top: center + 44,
                child: Text(t('Bu cihaz', 'This device'),
                    textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
              ),
              if (peers.isEmpty)
                Positioned(
                  right: 18,
                  top: 18,
                  child: const AllayMascot(size: 64),
                ),
              ...List.generate(peers.length, (i) {
                final peer = peers[i];
                final ring = i < 6 ? 0.36 : 0.46;
                final angle = -math.pi / 2 + (i % 6) * (2 * math.pi / math.max(1, math.min(6, peers.length))) + (i >= 6 ? 0.5 : 0);
                final r = size * ring;
                final x = center + r * math.cos(angle);
                final y = center + r * math.sin(angle);
                return Positioned(
                  left: x - 44,
                  top: y - 34,
                  width: 88,
                  child: Pressable(
                    onTap: () => widget.onTap(peer),
                    child: Column(children: [
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          color: AppColors.surface2,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.accentText.withValues(alpha: 0.6), width: 1.5),
                          boxShadow: [BoxShadow(color: AppColors.accentText.withValues(alpha: 0.3), blurRadius: 16)],
                        ),
                        child: Icon(deviceIcon(peer.deviceType, peer.platform), color: AppColors.accentText, size: 24),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        peer.shortName,
                        maxLines: 2,
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, height: 1.2),
                      ),
                    ]),
                  ).animate().scale(begin: const Offset(0.4, 0.4), curve: Curves.easeOutBack, duration: 500.ms).fadeIn(),
                );
              }),
            ]),
          ),
        ),
      );
    });
  }
}

class _RadarPainter extends CustomPainter {
  final double v;
  _RadarPainter(this.v);

  @override
  void paint(Canvas canvas, Size size) {
    final c = size.center(Offset.zero);
    final maxR = size.width / 2;
    final ring = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    for (final f in [0.24, 0.36, 0.48]) {
      ring.color = AppColors.border.withValues(alpha: 0.9);
      canvas.drawCircle(c, maxR * f * 2 * 0.98, ring);
    }
    // Dışa yayılan dalgalar
    for (var k = 0; k < 3; k++) {
      final p = (v + k / 3) % 1;
      ring
        ..color = AppColors.accentText.withValues(alpha: (1 - p) * 0.45)
        ..strokeWidth = 2;
      canvas.drawCircle(c, 40 + p * (maxR - 40), ring);
    }
    // Dönen tarama ışını
    final sweep = Paint()
      ..shader = SweepGradient(
        startAngle: 0,
        endAngle: math.pi / 2,
        colors: [AppColors.accentText.withValues(alpha: 0), AppColors.accentText.withValues(alpha: 0.22)],
        transform: GradientRotation(v * 2 * math.pi),
      ).createShader(Rect.fromCircle(center: c, radius: maxR));
    canvas.drawCircle(c, maxR * 0.96, sweep);
  }

  @override
  bool shouldRepaint(_RadarPainter old) => old.v != v;
}

class _PeerGrid extends StatelessWidget {
  final List<Peer> peers;
  final ValueChanged<Peer> onTap;
  const _PeerGrid({super.key, required this.peers, required this.onTap});

  @override
  Widget build(BuildContext context) {
    if (peers.isEmpty) {
      return EmptyState(
        title: t('Henüz kimse yok', 'Nobody here yet'),
        message: t('Diğer cihazda neardrop.bekirr.dev/transfers sayfasını ya da NearDrop uygulamasını aynı oda koduyla aç.',
            'Open neardrop.bekirr.dev/transfers or the NearDrop app on the other device with the same room code.'),
      );
    }
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: peers.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.25),
        itemBuilder: (_, i) {
          final p = peers[i];
          return GlassCard(
            onTap: () => onTap(p),
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(deviceIcon(p.deviceType, p.platform), color: AppColors.accentText, size: 26),
              const Spacer(),
              Text(p.shortName, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(p.isApp ? 'NearDrop App' : p.browser, style: TextStyle(color: AppColors.subtle, fontSize: 12)),
            ]),
          );
        },
      ),
    );
  }
}

class _TransferTile extends StatelessWidget {
  final P2PTransfer transfer;
  const _TransferTile({required this.transfer});

  @override
  Widget build(BuildContext context) {
    final tr = transfer;
    final (label, color) = switch (tr.status) {
      P2PStatus.requesting => (t('Onay bekleniyor', 'Waiting for approval'), AppColors.warning),
      P2PStatus.accepted => (t('Kabul edildi', 'Accepted'), AppColors.accentText),
      P2PStatus.transferring => ('${formatSpeed(tr.speed)} · ${formatEta(tr.eta)}', AppColors.accentText),
      P2PStatus.completed => (tr.outgoing ? t('Gönderildi', 'Sent') : t('Alındı · İndirilenler/NearDrop', 'Received · Downloads/NearDrop'), AppColors.success),
      P2PStatus.declined => (t('Reddedildi', 'Declined'), AppColors.danger),
      P2PStatus.cancelled => (t('İptal edildi', 'Cancelled'), AppColors.subtle),
      P2PStatus.failed => (tr.error ?? t('Başarısız', 'Failed'), AppColors.danger),
    };
    return GlassCard(
      padding: const EdgeInsets.all(14),
      onTap: tr.status == P2PStatus.completed && tr.savedPath != null && !tr.outgoing ? () => OpenFilex.open(tr.savedPath!) : null,
      child: Column(children: [
        Row(children: [
          FileTypeIcon(category: fileCategory('', tr.filename), size: 42),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(tr.filename, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Row(children: [
                Icon(tr.outgoing ? LucideIcons.arrowUpRight : LucideIcons.arrowDownLeft, size: 13, color: AppColors.subtle),
                const SizedBox(width: 3),
                Flexible(
                  child: Text('${tr.peerName} · ${formatBytes(tr.size)}',
                      maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                ),
              ]),
            ]),
          ),
          if (tr.isActive)
            IconButton(
              icon: Icon(LucideIcons.x, size: 18, color: AppColors.subtle),
              onPressed: () => context.read<P2PEngine>().cancel(tr),
            )
          else if (tr.status == P2PStatus.completed)
            Icon(LucideIcons.circleCheck, color: AppColors.success, size: 22),
        ]),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(value: tr.progress, minHeight: 6, color: color),
        ),
        const SizedBox(height: 6),
        Row(children: [
          Expanded(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600))),
          Text('%${(tr.progress * 100).round()}', style: TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w700)),
        ]),
      ]),
    );
  }
}

class _HowItWorks extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final steps = [
      (LucideIcons.doorOpen, t('Aynı odaya gir', 'Join the same room'), t('Varsayılan oda "lobby". Özel bir kodla sadece tanıdıklarınla buluş.', 'Default room is "lobby". Use a private code to meet only your people.')),
      (LucideIcons.mousePointerClick, t('Cihaza dokun', 'Tap a device'), t('Dosyaları seç; karşı taraf onaylayınca aktarım başlar.', 'Pick files; the transfer starts once they accept.')),
      (LucideIcons.shieldCheck, t('Doğrudan ve özel', 'Direct & private'), t('Dosyalar WebRTC ile cihazdan cihaza gider, buluta kaydedilmez.', 'Files go device-to-device over WebRTC and are never stored in the cloud.')),
    ];
    return GlassCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(t('Nasıl çalışır?', 'How it works'), style: AppTheme.display(18)),
        const SizedBox(height: 12),
        ...steps.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Icon(s.$1, size: 18, color: AppColors.accentText),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(s.$2, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(s.$3, style: TextStyle(color: AppColors.muted, fontSize: 13, height: 1.35)),
                  ]),
                ),
              ]),
            )),
      ]),
    );
  }
}

// ───────────── Oda seçimi ve QR ─────────────

void showRoomSheet(BuildContext context) {
  final engine = context.read<P2PEngine>();
  final controller = TextEditingController();
  String randomRoom() {
    const words = ['allay', 'nova', 'aurora', 'lumen', 'echo', 'pixel', 'orbit', 'drift'];
    final r = math.Random();
    return '${words[r.nextInt(words.length)]}-${1000 + r.nextInt(9000)}';
  }

  showSheet(context, builder: (ctx) {
    void join(String code) {
      Navigator.pop(ctx);
      engine.join(code);
      HapticFeedback.mediumImpact();
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(t('Oda değiştir', 'Change room'), style: AppTheme.display(22)),
        const SizedBox(height: 6),
        Text(t('Aynı oda kodunu giren cihazlar birbirini görür.', 'Devices that enter the same code can see each other.'),
            style: TextStyle(color: AppColors.muted)),
        const SizedBox(height: 18),
        TextField(
          controller: controller,
          autofocus: true,
          textInputAction: TextInputAction.go,
          onSubmitted: (v) => join(v),
          decoration: InputDecoration(labelText: t('Oda kodu', 'Room code'), prefixIcon: const Icon(LucideIcons.hash, size: 18)),
        ),
        const SizedBox(height: 14),
        PrimaryButton(label: t('Odaya katıl', 'Join room'), icon: LucideIcons.logIn, onPressed: () => join(controller.text)),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(
            child: SecondaryButton(label: t('Özel oda oluştur', 'New private room'), icon: LucideIcons.dices, onPressed: () => join(randomRoom())),
          ),
          const SizedBox(width: 10),
          Expanded(child: SecondaryButton(label: 'lobby', icon: LucideIcons.users, onPressed: () => join('lobby'))),
        ]),
      ]),
    );
  });
}

void _showRoomQr(BuildContext context) {
  final room = context.read<P2PEngine>().room;
  final url = AppConfig.roomUrl(room);
  showSheet(context, builder: (ctx) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
      child: Column(children: [
        Text(t('Odaya davet et', 'Invite to room'), style: AppTheme.display(22)),
        const SizedBox(height: 6),
        Text(t('Diğer cihazın kamerasıyla okut ya da bağlantıyı gönder.', "Scan with the other device's camera or send the link."),
            textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
          child: QrImageView(
            data: url,
            size: 210,
            eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.circle, color: AppColors.deepBlue),
            dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.circle, color: AppColors.deepBlue),
          ),
        ),
        const SizedBox(height: 14),
        Text(room, style: AppTheme.display(24, color: AppColors.accentText)),
        const SizedBox(height: 18),
        Row(children: [
          Expanded(
            child: SecondaryButton(
              label: t('Kopyala', 'Copy'),
              icon: LucideIcons.copy,
              onPressed: () {
                Clipboard.setData(ClipboardData(text: url));
                showToast(context, t('Bağlantı kopyalandı', 'Link copied'), success: true);
              },
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: PrimaryButton(
              label: t('Paylaş', 'Share'),
              icon: LucideIcons.share2,
              onPressed: () => SharePlus.instance.share(ShareParams(text: url, subject: 'NearDrop')),
            ),
          ),
        ]),
      ]),
    );
  });
}

/// Hangi sekmede olunursa olsun gelen aktarım isteğini gösterir.
class IncomingRequestListener extends StatefulWidget {
  final Widget child;
  const IncomingRequestListener({super.key, required this.child});

  @override
  State<IncomingRequestListener> createState() => _IncomingRequestListenerState();
}

class _IncomingRequestListenerState extends State<IncomingRequestListener> {
  IncomingRequest? _showing;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final engine = context.watch<P2PEngine>();
    if (_showing == null && engine.incoming.isNotEmpty) {
      final req = engine.incoming.first;
      _showing = req;
      WidgetsBinding.instance.addPostFrameCallback((_) => _show(req));
    }
  }

  Future<void> _show(IncomingRequest req) async {
    HapticFeedback.heavyImpact();
    final engine = context.read<P2PEngine>();
    final accepted = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const AllayMascot(size: 90, excited: true),
          const SizedBox(height: 8),
          Text(t('Gelen dosya', 'Incoming file'), style: AppTheme.display(22)),
          const SizedBox(height: 6),
          Text(
            t('${req.senderName} sana bir dosya göndermek istiyor', '${req.senderName} wants to send you a file'),
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
            child: Row(children: [
              FileTypeIcon(category: fileCategory(req.mimeType, req.filename), size: 40),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(req.filename, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text(formatBytes(req.size), style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                ]),
              ),
            ]),
          ),
        ]),
        actionsPadding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        actions: [
          Row(children: [
            Expanded(child: SecondaryButton(label: t('Reddet', 'Decline'), height: 48, onPressed: () => Navigator.pop(ctx, false))),
            const SizedBox(width: 10),
            Expanded(child: PrimaryButton(label: t('Kabul et', 'Accept'), icon: LucideIcons.download, height: 48, onPressed: () => Navigator.pop(ctx, true))),
          ]),
        ],
      ),
    );
    if (accepted == true) {
      await engine.accept(req);
    } else {
      await engine.decline(req);
    }
    if (!mounted) return;
    setState(() => _showing = null);
    // Kuyrukta başka istek varsa sıradakini göster
    if (engine.incoming.isNotEmpty) {
      final next = engine.incoming.first;
      _showing = next;
      _show(next);
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
