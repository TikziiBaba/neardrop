import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/i18n.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../scanner/qr_scan_screen.dart';
import '../shell/link_router.dart';

/// Paylaşım bağlantısı veya oda bağlantısı yapıştır / tara.
void showOpenLinkSheet(BuildContext context) {
  final controller = TextEditingController();
  showSheet(context, builder: (ctx) {
    void open() {
      final text = controller.text.trim();
      if (text.isEmpty) return;
      Navigator.pop(ctx);
      if (!LinkRouter.handleText(context, text)) {
        showToast(context, t('Bu bir NearDrop bağlantısı değil.', 'This is not a NearDrop link.'), error: true);
      }
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(t('Bağlantı aç', 'Open a link'), style: AppTheme.display(22)),
        const SizedBox(height: 6),
        Text(
          t('neardrop.bekirr.dev/s/… paylaşım bağlantısını ya da oda bağlantısını yapıştır.',
              'Paste a neardrop.bekirr.dev/s/… share link or a room link.'),
          style: TextStyle(color: AppColors.muted),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: controller,
          autofocus: true,
          onSubmitted: (_) => open(),
          decoration: InputDecoration(
            hintText: 'https://neardrop.bekirr.dev/s/…',
            prefixIcon: const Icon(LucideIcons.link, size: 18),
            suffixIcon: IconButton(
              icon: const Icon(LucideIcons.clipboardPaste, size: 18),
              onPressed: () async {
                final data = await Clipboard.getData('text/plain');
                if (data?.text != null) controller.text = data!.text!;
              },
            ),
          ),
        ),
        const SizedBox(height: 14),
        Row(children: [
          Expanded(
            child: SecondaryButton(
              label: t('QR tara', 'Scan QR'),
              icon: LucideIcons.scanLine,
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const QrScanScreen()));
              },
            ),
          ),
          const SizedBox(width: 10),
          Expanded(child: PrimaryButton(label: t('Aç', 'Open'), icon: LucideIcons.arrowRight, onPressed: open)),
        ]),
      ]),
    );
  });
}
