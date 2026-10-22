import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../core/i18n.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../shell/link_router.dart';

/// Oda davetlerini ve paylaşım bağlantılarını QR koddan okur.
class QrScanScreen extends StatefulWidget {
  const QrScanScreen({super.key});

  @override
  State<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends State<QrScanScreen> {
  final _controller = MobileScannerController(detectionSpeed: DetectionSpeed.noDuplicates);
  bool _handled = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_handled) return;
    final value = capture.barcodes.map((b) => b.rawValue).whereType<String>().firstOrNull;
    if (value == null) return;
    _handled = true;
    HapticFeedback.mediumImpact();
    final nav = Navigator.of(context);
    final rootContext = nav.context;
    nav.pop();
    if (!LinkRouter.handleText(rootContext, value)) {
      showToast(rootContext, t('Bu QR kod bir NearDrop bağlantısı değil.', 'This QR code is not a NearDrop link.'), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(t('QR tara', 'Scan QR')),
        actions: [
          IconButton(icon: const Icon(LucideIcons.flashlight), onPressed: () => _controller.toggleTorch()),
          IconButton(icon: const Icon(LucideIcons.switchCamera), onPressed: () => _controller.switchCamera()),
        ],
      ),
      body: Stack(children: [
        MobileScanner(
          controller: _controller,
          onDetect: _onDetect,
          errorBuilder: (context, error) => Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Text(
                t('Kameraya erişilemedi. Ayarlardan kamera iznini açın.', 'Camera unavailable. Allow camera access in settings.'),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ),
        IgnorePointer(
          child: Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: AppColors.accentText, width: 3),
                boxShadow: [BoxShadow(color: AppColors.accentText.withValues(alpha: 0.35), blurRadius: 30)],
              ),
            ),
          ),
        ),
        Positioned(
          left: 24,
          right: 24,
          bottom: 60,
          child: FrostedPanel(
            padding: const EdgeInsets.all(16),
            child: Text(
              t('Oda davetini veya paylaşım bağlantısının QR kodunu çerçeveye getir.',
                  'Point at a room invite or a share link QR code.'),
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ]),
    );
  }
}
