import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';

/// Web'deki /shared/[id]/analytics: son 30 günün indirme istatistikleri.
class ShareAnalyticsScreen extends StatefulWidget {
  final ShareLink share;
  const ShareAnalyticsScreen({super.key, required this.share});

  @override
  State<ShareAnalyticsScreen> createState() => _ShareAnalyticsScreenState();
}

class _ShareAnalyticsScreenState extends State<ShareAnalyticsScreen> {
  Map<String, dynamic>? _data;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await Api.get('/api/analytics', query: {'shareId': widget.share.id, 'days': '30'});
      if (mounted) setState(() => _data = data);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(t('Analiz', 'Analytics'))),
      body: AuroraBackground(
        child: SafeArea(
          child: _error != null
              ? ErrorRetry(message: _error!, onRetry: () {
                  setState(() => _error = null);
                  _load();
                })
              : _data == null
                  ? const Loader()
                  : _content(),
        ),
      ),
    );
  }

  List<(String, int)> _pairs(String key) =>
      ((_data![key] as List?) ?? []).map((e) => ('${(e as Map)['name']}', (e['count'] as num?)?.toInt() ?? 0)).toList();

  Widget _content() {
    final d = _data!;
    final daily = ((d['dailyDownloads'] as List?) ?? []).map((e) => ('${(e as Map)['date']}', (e['count'] as num?)?.toInt() ?? 0)).toList();
    // Son 30 günü boş günlerle doldur
    final today = DateTime.now();
    final byDate = {for (final (date, c) in daily) date: c};
    final days = List.generate(30, (i) {
      final day = DateTime(today.year, today.month, today.day).subtract(Duration(days: 29 - i));
      final key = '${day.year}-${day.month.toString().padLeft(2, '0')}-${day.day.toString().padLeft(2, '0')}';
      return byDate[key] ?? 0;
    });
    final maxY = math.max(1, days.fold<int>(0, math.max)).toDouble();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      children: [
        Text(widget.share.displayName, style: AppTheme.display(24)),
        const SizedBox(height: 4),
        Text(t('Son 30 gün', 'Last 30 days'), style: TextStyle(color: AppColors.muted)),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: _Big(label: t('İndirme', 'Downloads'), value: '${d['totalDownloads'] ?? 0}', icon: LucideIcons.download)),
          const SizedBox(width: 10),
          Expanded(child: _Big(label: t('Aktarılan veri', 'Bandwidth'), value: formatBytes((d['totalBandwidth'] as num?) ?? 0), icon: LucideIcons.activity)),
        ]),
        const SizedBox(height: 14),
        GlassCard(
          padding: const EdgeInsets.fromLTRB(12, 18, 18, 12),
          child: SizedBox(
            height: 180,
            child: LineChart(LineChartData(
              minY: 0,
              maxY: maxY * 1.2,
              gridData: FlGridData(
                drawVerticalLine: false,
                horizontalInterval: math.max(1, (maxY / 4).ceilToDouble()),
                getDrawingHorizontalLine: (_) => FlLine(color: AppColors.border, strokeWidth: 1),
              ),
              borderData: FlBorderData(show: false),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(),
                rightTitles: const AxisTitles(),
                bottomTitles: const AxisTitles(),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 28,
                    interval: math.max(1, (maxY / 4).ceilToDouble()),
                    getTitlesWidget: (v, _) => Text('${v.toInt()}', style: TextStyle(color: AppColors.subtle, fontSize: 11)),
                  ),
                ),
              ),
              lineBarsData: [
                LineChartBarData(
                  spots: [for (var i = 0; i < days.length; i++) FlSpot(i.toDouble(), days[i].toDouble())],
                  isCurved: true,
                  preventCurveOverShooting: true,
                  color: AppColors.accentText,
                  barWidth: 3,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                    show: true,
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [AppColors.accentText.withValues(alpha: 0.35), AppColors.accentText.withValues(alpha: 0)],
                    ),
                  ),
                ),
              ],
            )),
          ),
        ),
        const SizedBox(height: 14),
        _Breakdown(title: t('Ülkeler', 'Countries'), icon: LucideIcons.globe, items: _pairs('byCountry')),
        _Breakdown(title: t('İşletim sistemleri', 'Operating systems'), icon: LucideIcons.monitorSmartphone, items: _pairs('byOS')),
        _Breakdown(title: t('Tarayıcılar', 'Browsers'), icon: LucideIcons.appWindow, items: _pairs('byBrowser')),
        _Breakdown(title: t('Kaynaklar', 'Referrers'), icon: LucideIcons.externalLink, items: _pairs('byReferrer')),
      ],
    );
  }
}

class _Big extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _Big({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) => GlassCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, size: 18, color: AppColors.accentText),
          const SizedBox(height: 10),
          Text(value, style: AppTheme.display(26)),
          Text(label, style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
        ]),
      );
}

class _Breakdown extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<(String, int)> items;
  const _Breakdown({required this.title, required this.icon, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    final total = items.fold<int>(0, (a, e) => a + e.$2);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(icon, size: 17, color: AppColors.accentText),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          ]),
          const SizedBox(height: 12),
          ...items.take(6).map((e) {
            final ratio = total == 0 ? 0.0 : e.$2 / total;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(child: Text(e.$1, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13))),
                  Text('${e.$2}', style: TextStyle(color: AppColors.muted, fontSize: 13, fontWeight: FontWeight.w700)),
                ]),
                const SizedBox(height: 5),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(value: ratio, minHeight: 5),
                ),
              ]),
            );
          }),
        ]),
      ),
    );
  }
}
