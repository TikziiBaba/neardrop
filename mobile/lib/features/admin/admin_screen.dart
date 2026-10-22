import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/tiers.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';
import '../support/support_screens.dart';

/// Web'deki /admin bölümü: genel bakış, kullanıcılar, dosyalar, paylaşımlar, talepler ve kayıtlar.
/// Yalnızca admin/moderatör rolündeki hesaplara gösterilir.
class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tabs = [
      (LucideIcons.chartPie, t('Genel', 'Overview')),
      (LucideIcons.users, t('Kullanıcılar', 'Users')),
      (LucideIcons.files, t('Dosyalar', 'Files')),
      (LucideIcons.link2, t('Paylaşımlar', 'Shares')),
      (LucideIcons.lifeBuoy, t('Talepler', 'Tickets')),
      (LucideIcons.scrollText, t('Kayıtlar', 'Logs')),
    ];
    return DefaultTabController(
      length: tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: Text(t('Yönetim', 'Admin')),
          bottom: TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            indicatorColor: AppColors.accentText,
            labelColor: AppColors.foreground,
            unselectedLabelColor: AppColors.subtle,
            dividerColor: AppColors.border,
            tabs: [for (final (icon, label) in tabs) Tab(icon: Icon(icon, size: 18), text: label, iconMargin: const EdgeInsets.only(bottom: 4))],
          ),
        ),
        body: AuroraBackground(
          child: TabBarView(children: const [
            _Overview(),
            _UsersTab(),
            _FilesTab(),
            _SharesTab(),
            _TicketsTab(),
            _LogsTab(),
          ]),
        ),
      ),
    );
  }
}

/// Bir admin ucundan veri çekip gösteren ortak iskelet.
class _Loader<T> extends StatefulWidget {
  final Future<T> Function() load;
  final Widget Function(BuildContext, T, Future<void> Function() reload) builder;
  const _Loader({required this.load, required this.builder});

  @override
  State<_Loader<T>> createState() => _LoaderState<T>();
}

class _LoaderState<T> extends State<_Loader<T>> with AutomaticKeepAliveClientMixin {
  T? _data;
  String? _error;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    try {
      final d = await widget.load();
      if (mounted) {
        setState(() {
          _data = d;
          _error = null;
        });
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    if (_error != null) return ErrorRetry(message: _error!, onRetry: _reload);
    if (_data == null) return const Loader();
    return RefreshIndicator(onRefresh: _reload, child: widget.builder(context, _data as T, _reload));
  }
}

List<Map<String, dynamic>> _list(Map<String, dynamic> res, String key) =>
    ((res[key] as List?) ?? []).map((e) => (e as Map).cast<String, dynamic>()).toList();

int _n(dynamic v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;

// ───────────── Genel bakış ─────────────

class _Overview extends StatelessWidget {
  const _Overview();

  Future<void> _maintenance(BuildContext context, String action) async {
    try {
      final res = await Api.post('/api/admin/maintenance', {'action': action});
      if (context.mounted) showToast(context, '${res['message'] ?? t('Tamamlandı', 'Done')}', success: true);
    } on ApiException catch (e) {
      if (context.mounted) showToast(context, e.message, error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _Loader<(Map<String, dynamic>, Map<String, dynamic>?)>(
      load: () async {
        final stats = await Api.get('/api/admin/stats');
        Map<String, dynamic>? health;
        try {
          health = ((await Api.get('/api/admin/system'))['health'] as Map?)?.cast<String, dynamic>();
        } catch (_) {}
        return ((stats['stats'] as Map).cast<String, dynamic>(), health);
      },
      builder: (context, data, _) {
        final (s, health) = data;
        final daily = _list(s, 'dailyActivity');
        Widget stat(IconData icon, String label, String value) => GlassCard(
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Icon(icon, size: 17, color: AppColors.accentText),
                const SizedBox(height: 8),
                Text(value, style: AppTheme.display(22)),
                Text(label, style: TextStyle(color: AppColors.subtle, fontSize: 12)),
              ]),
            );
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: [
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.45,
              children: [
                stat(LucideIcons.users, t('Kullanıcı', 'Users'), '${_n(s['totalUsers'])}'),
                stat(LucideIcons.files, t('Dosya', 'Files'), '${_n(s['totalFiles'])}'),
                stat(LucideIcons.hardDrive, t('Kullanılan alan', 'Storage used'), formatBytes(_n(s['totalStorageBytes']))),
                stat(LucideIcons.link2, t('Aktif paylaşım', 'Active shares'), '${_n(s['activeShares'])}/${_n(s['totalShares'])}'),
                stat(LucideIcons.download, t('İndirme', 'Downloads'), '${_n(s['totalDownloads'])}'),
                stat(LucideIcons.activity, t('Bant genişliği', 'Bandwidth'), formatBytes(_n(s['totalBandwidthBytes']))),
              ],
            ),
            if (daily.isNotEmpty) ...[
              const SizedBox(height: 14),
              GlassCard(
                padding: const EdgeInsets.fromLTRB(10, 16, 16, 10),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Padding(
                    padding: const EdgeInsets.only(left: 8, bottom: 12),
                    child: Text(t('Günlük etkinlik', 'Daily activity'), style: const TextStyle(fontWeight: FontWeight.w700)),
                  ),
                  SizedBox(
                    height: 170,
                    child: BarChart(BarChartData(
                      gridData: const FlGridData(show: false),
                      borderData: FlBorderData(show: false),
                      titlesData: const FlTitlesData(
                        topTitles: AxisTitles(),
                        rightTitles: AxisTitles(),
                        bottomTitles: AxisTitles(),
                        leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28)),
                      ),
                      barGroups: [
                        for (var i = 0; i < daily.length; i++)
                          BarChartGroupData(x: i, barRods: [
                            BarChartRodData(toY: _n(daily[i]['uploads']).toDouble(), color: AppColors.accentText, width: 5),
                            BarChartRodData(toY: _n(daily[i]['downloads']).toDouble(), color: AppColors.fileVideo, width: 5),
                          ]),
                      ],
                    )),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 8, top: 8),
                    child: Row(children: [
                      Container(width: 8, height: 8, color: AppColors.accentText),
                      Text('  ${t('Yükleme', 'Uploads')}    ', style: TextStyle(color: AppColors.muted, fontSize: 12)),
                      Container(width: 8, height: 8, color: AppColors.fileVideo),
                      Text('  ${t('İndirme', 'Downloads')}', style: TextStyle(color: AppColors.muted, fontSize: 12)),
                    ]),
                  ),
                ]),
              ),
            ],
            if (health != null) ...[
              const SizedBox(height: 14),
              GlassCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t('Sistem durumu', 'System health'), style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  for (final (key, label) in [('r2', 'Cloudflare R2'), ('supabase', 'Supabase')])
                    if (health[key] is Map)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Icon(
                          (health[key] as Map)['status'] == 'connected' ? LucideIcons.circleCheck : LucideIcons.circleAlert,
                          color: (health[key] as Map)['status'] == 'connected' ? AppColors.success : AppColors.danger,
                        ),
                        title: Text(label),
                        trailing: Text('${(health[key] as Map)['latencyMs'] ?? '?'} ms', style: TextStyle(color: AppColors.muted)),
                      ),
                ]),
              ),
            ],
            const SizedBox(height: 14),
            GlassCard(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(t('Bakım', 'Maintenance'), style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                SheetAction(
                  icon: LucideIcons.link2Off,
                  label: t('Süresi dolan paylaşımları temizle', 'Purge expired shares'),
                  onTap: () => _maintenance(context, 'purge_expired_shares'),
                ),
                SheetAction(
                  icon: LucideIcons.calculator,
                  label: t('Kotaları yeniden hesapla', 'Recalculate quotas'),
                  onTap: () => _maintenance(context, 'recalculate_quotas'),
                ),
              ]),
            ),
          ],
        );
      },
    );
  }
}

// ───────────── Kullanıcılar ─────────────

class _UsersTab extends StatefulWidget {
  const _UsersTab();

  @override
  State<_UsersTab> createState() => _UsersTabState();
}

class _UsersTabState extends State<_UsersTab> {
  String _q = '';

  void _edit(BuildContext context, Map<String, dynamic> u, Future<void> Function() reload) {
    var role = '${u['role'] ?? 'member'}';
    var tier = '${u['subscriptionTier'] ?? 'free'}';
    var status = '${u['status'] ?? 'active'}';
    final quotaGb = TextEditingController(text: (_n(u['quotaBytes']) / 1073741824).toStringAsFixed(0));
    final notes = TextEditingController(text: '${u['notes'] ?? ''}');
    showSheet(context, builder: (ctx) {
      return StatefulBuilder(builder: (ctx, setSheet) {
        Widget chips(String title, List<String> values, String sel, ValueChanged<String> on) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Wrap(spacing: 8, runSpacing: 8, children: [
                  for (final v in values) ChoiceChip(label: Text(v), selected: sel == v, showCheckmark: false, onSelected: (_) => setSheet(() => on(v))),
                ]),
                const SizedBox(height: 14),
              ],
            );
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('${u['displayName'] ?? u['email']}', style: AppTheme.display(21)),
            Text('${u['email']}', style: TextStyle(color: AppColors.muted)),
            const SizedBox(height: 6),
            Text(
              '${t('Son cihaz', 'Last device')}: ${u['lastDevice'] ?? '-'} · ${u['lastIpAddress'] ?? '-'}',
              style: TextStyle(color: AppColors.subtle, fontSize: 12.5),
            ),
            const SizedBox(height: 16),
            chips(t('Rol', 'Role'), ['member', 'premium', 'moderator', 'admin'], role, (v) => role = v),
            chips(t('Plan', 'Plan'), ['free', 'pro', 'ultra', 'enterprise'], tier, (v) => tier = v),
            chips(t('Durum', 'Status'), ['active', 'suspended', 'banned'], status, (v) => status = v),
            TextField(controller: quotaGb, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: t('Kota (GB)', 'Quota (GB)'))),
            const SizedBox(height: 12),
            TextField(controller: notes, maxLines: 3, decoration: InputDecoration(labelText: t('Notlar', 'Notes'))),
            const SizedBox(height: 16),
            PrimaryButton(
              label: t('Kaydet', 'Save'),
              icon: LucideIcons.check,
              onPressed: () async {
                try {
                  await Api.patch('/api/admin/users', {
                    'userId': u['id'],
                    'role': role,
                    'subscriptionTier': tier,
                    'status': status,
                    'quotaBytes': ((double.tryParse(quotaGb.text) ?? 2) * 1073741824).round(),
                    'notes': notes.text,
                  });
                  if (ctx.mounted) Navigator.pop(ctx);
                  if (context.mounted) showToast(context, t('Kullanıcı güncellendi', 'User updated'), success: true);
                  await reload();
                } on ApiException catch (e) {
                  if (context.mounted) showToast(context, e.message, error: true);
                }
              },
            ),
          ]),
        );
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return _Loader<List<Map<String, dynamic>>>(
      load: () async => _list(await Api.get('/api/admin/users'), 'users'),
      builder: (context, users, reload) {
        final filtered = users.where((u) => '${u['email']} ${u['displayName']}'.toLowerCase().contains(_q.toLowerCase())).toList();
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: [
            TextField(
              onChanged: (v) => setState(() => _q = v),
              decoration: InputDecoration(hintText: t('Kullanıcı ara…', 'Search users…'), prefixIcon: const Icon(LucideIcons.search, size: 18)),
            ),
            const SizedBox(height: 12),
            ...filtered.map((u) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GlassCard(
                    padding: const EdgeInsets.all(12),
                    onTap: () => _edit(context, u, reload),
                    child: Row(children: [
                      UserAvatar(url: u['avatarUrl'] as String?, name: '${u['displayName'] ?? u['email']}', size: 42),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('${u['displayName'] ?? ''}', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
                          Text('${u['email']}', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
                          const SizedBox(height: 4),
                          Text(
                            '${formatBytes(_n(u['usedBytes']))} / ${formatBytes(_n(u['quotaBytes']))} · ${_n(u['filesCount'])} ${t('dosya', 'files')}',
                            style: TextStyle(color: AppColors.muted, fontSize: 12),
                          ),
                        ]),
                      ),
                      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                        Pill(tierName('${u['subscriptionTier']}'), color: u['subscriptionTier'] == 'free' ? AppColors.muted : AppColors.warning),
                        const SizedBox(height: 4),
                        if (u['role'] == 'admin' || u['role'] == 'moderator') Pill('${u['role']}', color: AppColors.danger),
                        if (u['status'] != null && u['status'] != 'active') Pill('${u['status']}', color: AppColors.danger),
                      ]),
                    ]),
                  ),
                )),
          ],
        );
      },
    );
  }
}

// ───────────── Dosyalar ─────────────

class _FilesTab extends StatelessWidget {
  const _FilesTab();

  @override
  Widget build(BuildContext context) {
    return _Loader<List<Map<String, dynamic>>>(
      load: () async => _list(await Api.get('/api/admin/files'), 'files'),
      builder: (context, files, reload) => ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        itemCount: files.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final f = files[i];
          final name = '${f['filename']}';
          return GlassCard(
            padding: const EdgeInsets.fromLTRB(12, 10, 4, 10),
            child: Row(children: [
              FileTypeIcon(category: fileCategory('${f['mimeType'] ?? ''}', name), size: 40),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(name.split('/').last, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text('${formatBytes(_n(f['size']))} · ${f['userEmail'] ?? ''}',
                      maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.subtle, fontSize: 12)),
                ]),
              ),
              IconButton(
                icon: Icon(LucideIcons.trash2, size: 18, color: AppColors.danger),
                onPressed: () async {
                  final ok = await confirmDialog(context,
                      title: t('Dosya kalıcı silinsin mi?', 'Delete file permanently?'),
                      message: t('Dosya depodan ve veritabanından silinir.', 'The file is removed from storage and the database.'),
                      confirm: t('Sil', 'Delete'),
                      danger: true);
                  if (!ok) return;
                  try {
                    await Api.delete('/api/admin/files', query: {'fileId': f['id']});
                    await reload();
                  } on ApiException catch (e) {
                    if (context.mounted) showToast(context, e.message, error: true);
                  }
                },
              ),
            ]),
          );
        },
      ),
    );
  }
}

// ───────────── Paylaşımlar ─────────────

class _SharesTab extends StatelessWidget {
  const _SharesTab();

  @override
  Widget build(BuildContext context) {
    return _Loader<List<Map<String, dynamic>>>(
      load: () async => _list(await Api.get('/api/admin/shares'), 'shares'),
      builder: (context, shares, reload) => ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        itemCount: shares.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final s = shares[i];
          final active = s['isActive'] == true;
          final file = s['cloudFile'] as Map?;
          return GlassCard(
            padding: const EdgeInsets.fromLTRB(14, 10, 8, 10),
            child: Row(children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${file?['filename'] ?? s['title'] ?? s['folderPath'] ?? s['token']}'.split('/').last,
                      maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text('/s/${s['token']} · ${s['userEmail'] ?? ''}',
                      maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: AppColors.subtle, fontSize: 12)),
                  Text('${_n(s['downloadCount'])} ${t('indirme', 'downloads')} · ${formatExpiresIn(parseDate(s['expiresAt']))}',
                      style: TextStyle(color: AppColors.muted, fontSize: 12)),
                ]),
              ),
              Switch(
                value: active,
                onChanged: (v) async {
                  try {
                    await Api.patch('/api/admin/shares', {'shareId': s['id'], 'isActive': v});
                    await reload();
                  } on ApiException catch (e) {
                    if (context.mounted) showToast(context, e.message, error: true);
                  }
                },
              ),
            ]),
          );
        },
      ),
    );
  }
}

// ───────────── Talepler ─────────────

class _TicketsTab extends StatelessWidget {
  const _TicketsTab();

  @override
  Widget build(BuildContext context) {
    return _Loader<List<Map<String, dynamic>>>(
      load: () async => _list(await Api.get('/api/admin/tickets'), 'tickets'),
      builder: (context, tickets, reload) => ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        itemCount: tickets.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final tk = tickets[i];
          final (label, color) = ticketStatus('${tk['status']}');
          return GlassCard(
            onTap: () async {
              await Navigator.push(context, MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: '${tk['id']}', asStaff: true)));
              await reload();
            },
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Text('${tk['title']}', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700))),
                Pill(label, color: color),
              ]),
              const SizedBox(height: 6),
              Text(
                '${tk['userEmail'] ?? ''} · ${departmentLabel('${tk['department']}')} · ${priorityLabel('${tk['priority']}')}',
                style: TextStyle(color: AppColors.subtle, fontSize: 12.5),
              ),
            ]),
          );
        },
      ),
    );
  }
}

// ───────────── Kayıtlar ─────────────

class _LogsTab extends StatelessWidget {
  const _LogsTab();

  @override
  Widget build(BuildContext context) {
    return _Loader<List<Map<String, dynamic>>>(
      load: () async => _list(await Api.get('/api/admin/logs'), 'logs'),
      builder: (context, logs, _) => ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        itemCount: logs.length,
        separatorBuilder: (_, _) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final l = logs[i];
          final color = switch (l['status']) { 'danger' => AppColors.danger, 'warning' => AppColors.warning, _ => AppColors.success };
          return GlassCard(
            padding: const EdgeInsets.all(12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Pill('${l['action']}', color: color),
                const Spacer(),
                Text(formatRelative(parseDate(l['timestamp'])), style: TextStyle(color: AppColors.subtle, fontSize: 11.5)),
              ]),
              const SizedBox(height: 8),
              Text('${l['details'] ?? ''}', style: const TextStyle(fontSize: 13, height: 1.35)),
            ]),
          );
        },
      ),
    );
  }
}
