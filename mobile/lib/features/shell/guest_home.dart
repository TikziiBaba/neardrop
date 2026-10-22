import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/i18n.dart';
import '../../state/auth_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../share/open_link_sheet.dart';
import '../transfer/transfer_screen.dart';

/// Hesapsız mod: yalnızca doğrudan aktarım ve bağlantı açma.
class GuestHome extends StatelessWidget {
  const GuestHome({super.key});

  @override
  Widget build(BuildContext context) {
    context.isTr;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.read<AuthStore>().leaveGuest();
      },
      child: Scaffold(
        body: AuroraBackground(
          child: IncomingRequestListener(
            child: TransferScreen(
              header: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: GlassCard(
                  padding: const EdgeInsets.fromLTRB(14, 10, 10, 10),
                  child: Row(children: [
                    const LogoMark(size: 32),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(t('Misafir modu', 'Guest mode'), style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text(t('Bulut için giriş yap', 'Sign in for cloud storage'),
                            style: TextStyle(color: AppColors.subtle, fontSize: 12)),
                      ]),
                    ),
                    CircleIconButton(icon: LucideIcons.link, size: 40, onTap: () => showOpenLinkSheet(context)),
                    const SizedBox(width: 8),
                    SecondaryButton(
                      label: t('Giriş', 'Sign in'),
                      icon: LucideIcons.logIn,
                      expand: false,
                      height: 40,
                      onPressed: () => context.read<AuthStore>().leaveGuest(),
                    ),
                  ]),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
