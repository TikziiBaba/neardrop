import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/i18n.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../dashboard/dashboard_screen.dart';
import '../files/files_screen.dart';
import '../more/account_screen.dart';
import '../shares/shares_screen.dart';
import '../transfer/transfer_screen.dart';
import '../uploads/transfers_sheet.dart';
import 'guest_home.dart';

/// Alt menüden sekmeye geçmek için (ör. panodan "Dosyalar"a)
class ShellController extends ChangeNotifier {
  static final instance = ShellController();
  int index = 0;
  String? pendingRoom;

  void go(int i) {
    index = i;
    notifyListeners();
  }

  void openRoom(String room) {
    pendingRoom = room;
    go(2);
  }
}

class HomeShell extends StatefulWidget {
  final bool guest;
  const HomeShell({super.key, this.guest = false});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  final _controller = ShellController.instance;

  @override
  void initState() {
    super.initState();
    // Yeni oturumda panodan başla; bekleyen oda daveti varsa Aktar sekmesinden
    _controller.index = _controller.pendingRoom != null && !widget.guest ? 2 : 0;
    _controller.addListener(_onChange);
  }

  @override
  void dispose() {
    _controller.removeListener(_onChange);
    super.dispose();
  }

  void _onChange() => setState(() {});

  @override
  Widget build(BuildContext context) {
    context.isTr;
    if (widget.guest) return const GuestHome();

    final tabs = [
      (LucideIcons.house, t('Ana sayfa', 'Home')),
      (LucideIcons.folderOpen, t('Dosyalar', 'Files')),
      (LucideIcons.radar, t('Aktar', 'Transfer')),
      (LucideIcons.link2, t('Paylaşımlar', 'Shares')),
      (LucideIcons.circleUser, t('Hesap', 'Account')),
    ];
    final index = _controller.index.clamp(0, tabs.length - 1);

    return PopScope(
      canPop: index == 0,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _controller.go(0);
      },
      child: Scaffold(
        extendBody: true,
        body: AuroraBackground(
          child: IncomingRequestListener(
            child: IndexedStack(
              index: index,
              children: const [
                DashboardScreen(),
                FilesScreen(),
                TransferScreen(),
                SharesScreen(),
                AccountScreen(),
              ],
            ),
          ),
        ),
        bottomNavigationBar: _BottomBar(
          tabs: tabs,
          index: index,
          onTap: (i) {
            HapticFeedback.selectionClick();
            _controller.go(i);
          },
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  final List<(IconData, String)> tabs;
  final int index;
  final ValueChanged<int> onTap;
  const _BottomBar({required this.tabs, required this.index, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).padding.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(14, 0, 14, bottom > 0 ? bottom : 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const ActiveTransfersChip(),
          FrostedPanel(
            radius: BorderRadius.circular(30),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
            child: Row(
              children: List.generate(tabs.length, (i) {
                final (icon, label) = tabs[i];
                final selected = i == index;
                final center = i == 2;
                return Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => onTap(i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 260),
                      curve: Curves.easeOutCubic,
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      decoration: BoxDecoration(
                        gradient: selected && center ? AppColors.buttonGradient : null,
                        color: selected && !center ? AppColors.accent.withValues(alpha: 0.16) : null,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: selected && center
                            ? [BoxShadow(color: AppColors.accent.withValues(alpha: 0.5), blurRadius: 18)]
                            : null,
                      ),
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        Icon(
                          icon,
                          size: center ? 23 : 21,
                          color: selected ? (center ? Colors.white : AppColors.accentText) : AppColors.subtle,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          label,
                          maxLines: 1,
                          overflow: TextOverflow.fade,
                          softWrap: false,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                            color: selected ? (center ? Colors.white : AppColors.foreground) : AppColors.subtle,
                          ),
                        ),
                      ]),
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

/// Devam eden yükleme/indirme varken alt menünün üstünde görünen küçük ilerleme çubuğu.
class ActiveTransfersChip extends StatelessWidget {
  const ActiveTransfersChip({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<FilesStore>();
    final active = store.transfers.where((t) => t.isActive).toList();
    final visible = active.isNotEmpty && context.watch<AuthStore>().isSignedIn;
    final total = active.fold<int>(0, (a, t) => a + t.size);
    final done = active.fold<int>(0, (a, t) => a + t.transferred);
    final progress = total == 0 ? 0.0 : done / total;

    return AnimatedSize(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
      child: !visible
          ? const SizedBox(width: double.infinity)
          : Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: GestureDetector(
                onTap: () => showTransfersSheet(context),
                child: FrostedPanel(
                  radius: BorderRadius.circular(20),
                  padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
                  child: Row(children: [
                    SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(value: progress, strokeWidth: 2.6),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        t('${active.length} aktarım sürüyor · %${(progress * 100).round()}',
                            '${active.length} transfer(s) running · ${(progress * 100).round()}%'),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                    Icon(LucideIcons.chevronUp, size: 18, color: AppColors.muted),
                  ]),
                ),
              ),
            ),
    );
  }
}
