import 'dart:async';
import 'dart:io';

import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';

import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../share/public_share_screen.dart';
import '../transfer/p2p_engine.dart';
import 'home_shell.dart';

/// neardrop.bekirr.dev bağlantılarını (/s/:token, /transfers?room=) ve
/// Android "Paylaş" menüsünden gelen dosyaları karşılar.
class LinkRouter extends StatefulWidget {
  final GlobalKey<NavigatorState> navigatorKey;
  final Widget child;
  const LinkRouter({super.key, required this.navigatorKey, required this.child});

  /// Uygulama içinde yapıştırılan / taranan metni yorumlar. Tanınırsa true döner.
  static bool handleText(BuildContext context, String text) {
    final state = context.findAncestorStateOfType<_LinkRouterState>();
    return state?._handleText(text) ?? false;
  }

  @override
  State<LinkRouter> createState() => _LinkRouterState();
}

class _LinkRouterState extends State<LinkRouter> {
  final _appLinks = AppLinks();
  StreamSubscription<Uri>? _linkSub;
  StreamSubscription<List<SharedMediaFile>>? _shareSub;

  @override
  void initState() {
    super.initState();
    _linkSub = _appLinks.uriLinkStream.listen(_handleUri);
    _shareSub = ReceiveSharingIntent.instance.getMediaStream().listen(_handleShared);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final initial = await ReceiveSharingIntent.instance.getInitialMedia();
      if (initial.isNotEmpty) {
        _handleShared(initial);
        ReceiveSharingIntent.instance.reset();
      }
    });
  }

  @override
  void dispose() {
    _linkSub?.cancel();
    _shareSub?.cancel();
    super.dispose();
  }

  NavigatorState? get _nav => widget.navigatorKey.currentState;
  BuildContext? get _ctx => widget.navigatorKey.currentContext;

  bool _handleText(String text) {
    final trimmed = text.trim();
    final match = RegExp(r'https?://\S+').firstMatch(trimmed);
    final uri = Uri.tryParse(match?.group(0) ?? trimmed);
    if (uri != null && uri.hasScheme && _handleUri(uri)) return true;
    // Yalnızca token yapıştırıldıysa (12 karakterlik paylaşım kodu)
    if (RegExp(r'^[A-Za-z0-9]{8,32}$').hasMatch(trimmed)) {
      _openShare(trimmed);
      return true;
    }
    return false;
  }

  bool _handleUri(Uri uri) {
    // OAuth dönüşü supabase_flutter tarafından işlenir
    if (uri.scheme == 'dev.bekirr.neardrop') return false;
    final segments = uri.pathSegments;
    if (segments.length >= 2 && segments[0] == 's') {
      _openShare(segments[1]);
      return true;
    }
    if (segments.isNotEmpty && segments[0] == 'transfers') {
      final room = uri.queryParameters['room'];
      final ctx = _ctx;
      if (ctx != null) {
        final auth = ctx.read<AuthStore>();
        if (!auth.isSignedIn && !auth.guest) auth.continueAsGuest();
      }
      _nav?.popUntil((r) => r.isFirst);
      ShellController.instance.openRoom(room == null || room.isEmpty ? 'lobby' : room);
      return true;
    }
    return false;
  }

  void _openShare(String token) {
    _nav?.push(MaterialPageRoute(builder: (_) => PublicShareScreen(token: token)));
  }

  void _handleShared(List<SharedMediaFile> items) {
    if (items.isEmpty) return;
    // Metin/bağlantı paylaşıldıysa NearDrop bağlantısı olabilir
    final texts = items.where((m) => m.type == SharedMediaType.text || m.type == SharedMediaType.url);
    for (final m in texts) {
      if (_handleText(m.path)) return;
    }
    final files = items
        .where((m) => m.type != SharedMediaType.text && m.type != SharedMediaType.url)
        .map((m) => File(m.path))
        .where((f) => f.existsSync())
        .map((f) => LocalFile(f.path, f.uri.pathSegments.last, f.lengthSync()))
        .toList();
    if (files.isEmpty) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final ctx = _ctx;
      if (ctx != null) _showIncomingSheet(ctx, files);
    });
  }

  void _showIncomingSheet(BuildContext context, List<LocalFile> files) {
    final auth = context.read<AuthStore>();
    final total = files.fold<int>(0, (a, f) => a + f.size);
    showSheet(context, builder: (ctx) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(t('NearDrop ile paylaş', 'Share with NearDrop'), style: AppTheme.display(22)),
          const SizedBox(height: 6),
          Text(
            t('${files.length} dosya · ${formatBytes(total)}', '${files.length} file(s) · ${formatBytes(total)}'),
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 14),
          ...files.take(4).map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(children: [
                  FileTypeIcon(category: fileCategory('', f.name), size: 36),
                  const SizedBox(width: 12),
                  Expanded(child: Text(f.name, maxLines: 1, overflow: TextOverflow.ellipsis)),
                  Text(formatBytes(f.size), style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                ]),
              )),
          if (files.length > 4)
            Text(t('+${files.length - 4} dosya daha', '+${files.length - 4} more'), style: TextStyle(color: AppColors.subtle)),
          const SizedBox(height: 16),
          SheetAction(
            icon: LucideIcons.cloudUpload,
            label: t('Buluta yükle', 'Upload to cloud'),
            subtitle: auth.isSignedIn
                ? t('Dosyalarım\'a eklenir, sonra bağlantıyla paylaşabilirsin', 'Added to My Files, share with a link later')
                : t('Önce giriş yapman gerekiyor', 'You need to sign in first'),
            onTap: () {
              Navigator.pop(ctx);
              if (!auth.isSignedIn) {
                showToast(context, t('Buluta yüklemek için giriş yap.', 'Sign in to upload to the cloud.'), error: true);
                return;
              }
              context.read<FilesStore>().upload(files);
              ShellController.instance.go(1);
              showToast(context, t('Yükleme başladı.', 'Upload started.'), success: true);
            },
          ),
          SheetAction(
            icon: LucideIcons.radar,
            label: t('Yakındaki cihaza gönder', 'Send to a nearby device'),
            subtitle: t('Aynı odadaki cihaza doğrudan aktarım', 'Direct transfer to a device in the same room'),
            onTap: () {
              Navigator.pop(ctx);
              if (!auth.isSignedIn && !auth.guest) auth.continueAsGuest();
              context.read<P2PEngine>().stageFiles(files);
              _nav?.popUntil((r) => r.isFirst);
              ShellController.instance.go(auth.isSignedIn ? 2 : 0);
            },
          ),
        ]),
      );
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
