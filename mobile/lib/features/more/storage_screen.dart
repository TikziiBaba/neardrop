import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/tiers.dart';
import '../../state/auth_store.dart';
import '../../state/files_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/thumbnail.dart';
import '../../widgets/ui.dart';
import '../files/file_actions.dart';
import 'plans_screen.dart';
import 'trash_screen.dart';

/// Web'deki /storage: kota, kategori dağılımı ve en büyük dosyalar.
class StorageScreen extends StatelessWidget {
  const StorageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<FilesStore>();
    final p = context.watch<AuthStore>().profile;
    if (p == null) return const Scaffold();
    final cats = store.categories;
    final used = store.usedBytes;
    final free = (p.quotaBytes - used).clamp(0, p.quotaBytes);
    final largest = [...store.files]..sort((a, b) => b.size.compareTo(a.size));

    return Scaffold(
      appBar: AppBar(title: Text(t('Depolama', 'Storage'))),
      body: AuroraBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
            children: [
              GlassCard(
                glow: true,
                child: Column(children: [
                  SizedBox(
                    height: 210,
                    child: Stack(alignment: Alignment.center, children: [
                      PieChart(PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 72,
                        startDegreeOffset: -90,
                        sections: [
                          ...cats.map((c) => PieChartSectionData(value: c.bytes.toDouble(), color: c.category.color, radius: 22, showTitle: false)),
                          PieChartSectionData(value: free.toDouble().clamp(1, double.infinity), color: AppColors.surface3, radius: 18, showTitle: false),
                        ],
                      )),
                      Column(mainAxisSize: MainAxisSize.min, children: [
                        Text(formatBytes(used), style: AppTheme.display(26)),
                        Text(t('${formatBytes(p.quotaBytes)} içinden', 'of ${formatBytes(p.quotaBytes)}'),
                            style: TextStyle(color: AppColors.muted, fontSize: 12.5)),
                      ]),
                    ]),
                  ),
                  const SizedBox(height: 12),
                  Row(children: [
                    Pill(tierName(p.subscriptionTier), color: p.isPaid ? AppColors.warning : AppColors.accentText),
                    const Spacer(),
                    Text(t('${formatBytes(free)} boş', '${formatBytes(free)} free'), style: TextStyle(color: AppColors.muted)),
                  ]),
                ]),
              ),
              const SizedBox(height: 14),
              if (cats.isNotEmpty)
                GlassCard(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Column(
                    children: cats
                        .map((c) => ListTile(
                              leading: FileTypeIcon(category: c.category, size: 40),
                              title: Text(c.category.label, style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text(t('${c.count} dosya', '${c.count} files'), style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                              trailing: Text(formatBytes(c.bytes), style: const TextStyle(fontWeight: FontWeight.w700)),
                            ))
                        .toList(),
                  ),
                ),
              const SizedBox(height: 14),
              Row(children: [
                Expanded(
                  child: SecondaryButton(
                    label: t('Çöp kutusu', 'Trash'),
                    icon: LucideIcons.trash2,
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TrashScreen())),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: PrimaryButton(
                    label: t('Alan yükselt', 'Get more'),
                    icon: LucideIcons.crown,
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlansScreen())),
                  ),
                ),
              ]),
              if (largest.isNotEmpty) ...[
                const SizedBox(height: 10),
                SectionHeader(title: t('En büyük dosyalar', 'Largest files')),
                GlassCard(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Column(
                    children: largest
                        .take(8)
                        .map((f) => ListTile(
                              onTap: () => showFileActions(context, f),
                              leading: FileThumb(file: f, size: 40),
                              title: Text(f.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text(f.folder.isEmpty ? f.category.label : f.folder,
                                  maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                              trailing: Text(formatBytes(f.size), style: const TextStyle(fontWeight: FontWeight.w700)),
                            ))
                        .toList(),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
