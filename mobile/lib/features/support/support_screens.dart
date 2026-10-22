import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../core/api.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/models.dart';
import '../../state/auth_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/ui.dart';

String departmentLabel(String d) => switch (d) {
      'technical' => t('Teknik', 'Technical'),
      'billing' => t('Ödeme', 'Billing'),
      'storage' => t('Depolama', 'Storage'),
      _ => t('Genel', 'General'),
    };

String priorityLabel(String p) => switch (p) {
      'low' => t('Düşük', 'Low'),
      'high' => t('Yüksek', 'High'),
      'urgent' => t('Acil', 'Urgent'),
      _ => t('Orta', 'Medium'),
    };

(String, Color) ticketStatus(String s) => switch (s) {
      'in_progress' => (t('İnceleniyor', 'In progress'), AppColors.accentText),
      'waiting_customer' => (t('Yanıtın bekleniyor', 'Awaiting you'), AppColors.warning),
      'resolved' => (t('Çözüldü', 'Resolved'), AppColors.success),
      'closed' => (t('Kapandı', 'Closed'), AppColors.subtle),
      _ => (t('Açık', 'Open'), AppColors.fileVideo),
    };

// ───────────────────────── Talep listesi ─────────────────────────

class TicketsScreen extends StatefulWidget {
  const TicketsScreen({super.key});

  @override
  State<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends State<TicketsScreen> {
  List<Ticket>? _tickets;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final p = context.read<AuthStore>().profile!;
    try {
      final res = await Api.get('/api/tickets', query: {'userId': p.id});
      _tickets = ((res['tickets'] as List?) ?? []).map((e) => Ticket.fromJson((e as Map).cast<String, dynamic>())).toList();
      _error = null;
    } on ApiException catch (e) {
      _error = e.message;
    }
    if (mounted) setState(() {});
  }

  Future<void> _new() async {
    final created = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const NewTicketScreen()));
    if (created == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    final tickets = _tickets;
    return Scaffold(
      appBar: AppBar(title: Text(t('Destek', 'Support'))),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _new,
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        icon: const Icon(LucideIcons.plus),
        label: Text(t('Yeni talep', 'New ticket'), style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: AuroraBackground(
        child: SafeArea(
          child: _error != null
              ? ErrorRetry(message: _error!, onRetry: _load)
              : tickets == null
                  ? const Loader()
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: tickets.isEmpty
                          ? ListView(children: [
                              EmptyState(
                                title: t('Talebin yok', 'No tickets'),
                                message: t('Bir sorun mu var? Yeni talep aç, ekibimiz yanıtlasın.', 'Having an issue? Open a ticket and our team will reply.'),
                              ),
                            ])
                          : ListView.separated(
                              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                              itemCount: tickets.length,
                              separatorBuilder: (_, _) => const SizedBox(height: 10),
                              itemBuilder: (_, i) {
                                final tk = tickets[i];
                                final (label, color) = ticketStatus(tk.status);
                                return GlassCard(
                                  onTap: () async {
                                    await Navigator.push(context, MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: tk.id)));
                                    _load();
                                  },
                                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Row(children: [
                                      Expanded(
                                        child: Text(tk.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
                                      ),
                                      const SizedBox(width: 8),
                                      Pill(label, color: color),
                                    ]),
                                    const SizedBox(height: 8),
                                    Text(
                                      '${departmentLabel(tk.department)} · ${priorityLabel(tk.priority)} · ${formatRelative(tk.updatedAt ?? tk.createdAt)}',
                                      style: TextStyle(color: AppColors.subtle, fontSize: 12.5),
                                    ),
                                  ]),
                                );
                              },
                            ),
                    ),
        ),
      ),
    );
  }
}

// ───────────────────────── Yeni talep ─────────────────────────

class NewTicketScreen extends StatefulWidget {
  const NewTicketScreen({super.key});

  @override
  State<NewTicketScreen> createState() => _NewTicketScreenState();
}

class _NewTicketScreenState extends State<NewTicketScreen> {
  final _title = TextEditingController();
  final _message = TextEditingController();
  String _department = 'technical';
  String _priority = 'medium';
  bool _loading = false;

  Future<void> _submit() async {
    if (_title.text.trim().isEmpty || _message.text.trim().isEmpty) {
      showToast(context, t('Başlık ve açıklamayı doldurun.', 'Fill in the title and description.'), error: true);
      return;
    }
    final p = context.read<AuthStore>().profile!;
    setState(() => _loading = true);
    try {
      final res = await Api.post('/api/tickets', {
        'userId': p.id,
        'userEmail': p.email,
        'userName': p.displayName,
        'userRole': p.role,
        'title': _title.text.trim(),
        'department': _department,
        'priority': _priority,
        'message': _message.text.trim(),
      });
      if (!mounted) return;
      showToast(context, t('Destek talebin oluşturuldu', 'Support ticket created'), success: true);
      final id = (res['ticket'] as Map?)?['id'];
      if (id != null) {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: '$id')));
      } else {
        Navigator.pop(context, true);
      }
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget chips(String title, List<String> values, String selected, String Function(String) label, ValueChanged<String> onSel) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Wrap(spacing: 8, runSpacing: 8, children: [
              for (final v in values)
                ChoiceChip(label: Text(label(v)), selected: selected == v, showCheckmark: false, onSelected: (_) => onSel(v)),
            ]),
            const SizedBox(height: 16),
          ],
        );

    return Scaffold(
      appBar: AppBar(title: Text(t('Yeni destek talebi', 'New support ticket'))),
      body: AuroraBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
            children: [
              TextField(controller: _title, decoration: InputDecoration(labelText: t('Konu', 'Subject'))),
              const SizedBox(height: 16),
              chips(t('Departman', 'Department'), ['technical', 'billing', 'storage', 'general'], _department, departmentLabel,
                  (v) => setState(() => _department = v)),
              chips(t('Öncelik', 'Priority'), ['low', 'medium', 'high', 'urgent'], _priority, priorityLabel, (v) => setState(() => _priority = v)),
              TextField(
                controller: _message,
                minLines: 6,
                maxLines: 12,
                decoration: InputDecoration(labelText: t('Sorunu anlat', 'Describe the issue'), alignLabelWithHint: true),
              ),
              const SizedBox(height: 18),
              PrimaryButton(label: t('Gönder', 'Submit'), icon: LucideIcons.send, loading: _loading, onPressed: _submit),
            ],
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── Talep ayrıntısı (sohbet) ─────────────────────────

class TicketDetailScreen extends StatefulWidget {
  final String ticketId;
  final bool asStaff;
  const TicketDetailScreen({super.key, required this.ticketId, this.asStaff = false});

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  Ticket? _ticket;
  List<TicketMessage> _messages = [];
  String? _error;
  final _reply = TextEditingController();
  final _scroll = ScrollController();
  bool _sending = false;

  String get _base => widget.asStaff ? '/api/admin/tickets/${widget.ticketId}' : '/api/tickets/${widget.ticketId}';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await Api.get(_base);
      _ticket = res['ticket'] is Map ? Ticket.fromJson((res['ticket'] as Map).cast<String, dynamic>()) : null;
      _messages = ((res['messages'] as List?) ?? []).map((e) => TicketMessage.fromJson((e as Map).cast<String, dynamic>())).toList();
      _error = _ticket == null ? t('Talep bulunamadı', 'Ticket not found') : null;
    } on ApiException catch (e) {
      _error = e.message;
    }
    if (mounted) setState(() {});
    _toBottom();
  }

  void _toBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    });
  }

  Future<void> _send() async {
    final text = _reply.text.trim();
    if (text.isEmpty) return;
    final p = context.read<AuthStore>().profile!;
    setState(() => _sending = true);
    try {
      final res = await Api.post(_base, {
        'senderId': p.id,
        'senderEmail': p.email,
        'senderName': p.displayName,
        'senderRole': p.role,
        'message': text,
        if (widget.asStaff) 'isStaff': true,
      });
      if (res['message'] is Map) {
        _messages.add(TicketMessage.fromJson((res['message'] as Map).cast<String, dynamic>()));
      } else {
        await _load();
      }
      _reply.clear();
      _toBottom();
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _setStatus(String status) async {
    try {
      await Api.patch(_base, {'status': status});
      await _load();
      if (mounted) showToast(context, t('Talep güncellendi', 'Ticket updated'), success: true);
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final me = context.watch<AuthStore>().profile;
    final tk = _ticket;
    return Scaffold(
      appBar: AppBar(
        title: Text(tk?.title ?? t('Destek talebi', 'Support ticket'), maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          if (tk != null && widget.asStaff)
            PopupMenuButton<String>(
              icon: const Icon(LucideIcons.ellipsisVertical),
              onSelected: _setStatus,
              itemBuilder: (_) => [
                for (final s in ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'])
                  PopupMenuItem(value: s, child: Text(ticketStatus(s).$1)),
              ],
            )
          else if (tk != null && !tk.isClosed)
            TextButton(
              onPressed: () => _setStatus('resolved'),
              child: Text(t('Çözüldü', 'Resolve'), style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w700)),
            ),
        ],
      ),
      body: AuroraBackground(
        child: SafeArea(
          child: _error != null
              ? ErrorRetry(message: _error!, onRetry: _load)
              : tk == null
                  ? const Loader()
                  : Column(children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                        child: Wrap(spacing: 8, runSpacing: 6, children: [
                          Pill(ticketStatus(tk.status).$1, color: ticketStatus(tk.status).$2),
                          Pill(departmentLabel(tk.department), color: AppColors.muted),
                          Pill(priorityLabel(tk.priority), color: tk.priority == 'urgent' || tk.priority == 'high' ? AppColors.danger : AppColors.muted),
                          if (widget.asStaff) Pill(tk.userEmail, color: AppColors.accentText, icon: LucideIcons.user),
                        ]),
                      ),
                      Expanded(
                        child: ListView.builder(
                          controller: _scroll,
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                          itemCount: _messages.length,
                          itemBuilder: (_, i) {
                            final m = _messages[i];
                            final mine = m.senderId == me?.id && m.isStaff == widget.asStaff;
                            return Align(
                              alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
                                decoration: BoxDecoration(
                                  gradient: mine ? AppColors.buttonGradient : null,
                                  color: mine ? null : (m.isStaff ? AppColors.surface3 : AppColors.surface2),
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(18),
                                    topRight: const Radius.circular(18),
                                    bottomLeft: Radius.circular(mine ? 18 : 4),
                                    bottomRight: Radius.circular(mine ? 4 : 18),
                                  ),
                                  border: mine ? null : Border.all(color: AppColors.border),
                                ),
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Row(mainAxisSize: MainAxisSize.min, children: [
                                    if (m.isStaff) ...[Icon(LucideIcons.badgeCheck, size: 13, color: mine ? Colors.white : AppColors.accentText), const SizedBox(width: 4)],
                                    Text(
                                      m.isStaff ? '${m.senderName} · NearDrop' : m.senderName,
                                      style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: mine ? Colors.white70 : AppColors.muted),
                                    ),
                                  ]),
                                  const SizedBox(height: 4),
                                  Text(m.message, style: TextStyle(color: mine ? Colors.white : AppColors.foreground, height: 1.4)),
                                  const SizedBox(height: 4),
                                  Text(formatDate(m.createdAt), style: TextStyle(fontSize: 10.5, color: mine ? Colors.white60 : AppColors.subtle)),
                                ]),
                              ),
                            );
                          },
                        ),
                      ),
                      if (!tk.isClosed || widget.asStaff)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                          child: FrostedPanel(
                            padding: const EdgeInsets.fromLTRB(14, 4, 6, 4),
                            child: Row(children: [
                              Expanded(
                                child: TextField(
                                  controller: _reply,
                                  minLines: 1,
                                  maxLines: 5,
                                  decoration: InputDecoration(
                                    hintText: t('Yanıt yaz…', 'Write a reply…'),
                                    filled: false,
                                    border: InputBorder.none,
                                    enabledBorder: InputBorder.none,
                                    focusedBorder: InputBorder.none,
                                  ),
                                ),
                              ),
                              _sending
                                  ? const Padding(padding: EdgeInsets.all(12), child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)))
                                  : IconButton(icon: Icon(LucideIcons.sendHorizontal, color: AppColors.accentText), onPressed: _send),
                            ]),
                          ),
                        ),
                    ]),
        ),
      ),
    );
  }
}

// ───────────────────────── İletişim ─────────────────────────

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  late final _name = TextEditingController(text: context.read<AuthStore>().profile?.displayName);
  late final _email = TextEditingController(text: context.read<AuthStore>().profile?.email);
  final _phone = TextEditingController();
  final _subject = TextEditingController();
  final _message = TextEditingController();
  bool _loading = false;
  bool _sent = false;

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty || _email.text.trim().isEmpty || _message.text.trim().isEmpty) {
      showToast(context, t('Ad, e-posta ve mesaj alanlarını doldurun.', 'Fill in name, email and message.'), error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      await Api.post('/api/contact', {
        'name': _name.text.trim(),
        'email': _email.text.trim(),
        'phone': _phone.text.trim(),
        'subject': _subject.text.trim().isEmpty ? t('Genel İletişim', 'General') : _subject.text.trim(),
        'message': _message.text.trim(),
      });
      if (mounted) setState(() => _sent = true);
    } on ApiException catch (e) {
      if (mounted) showToast(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(t('İletişim', 'Contact'))),
      body: AuroraBackground(
        child: SafeArea(
          child: _sent
              ? EmptyState(
                  title: t('Mesajın ulaştı', 'Message sent'),
                  message: t('En kısa sürede e-posta ile dönüş yapacağız.', "We'll get back to you by email soon."),
                  action: SecondaryButton(label: t('Kapat', 'Close'), expand: false, onPressed: () => Navigator.pop(context)),
                )
              : ListView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  children: [
                    Text(t('Bize yaz', 'Write to us'), style: AppTheme.display(26)),
                    const SizedBox(height: 4),
                    Text(t('Soru, öneri ya da iş birliği için.', 'Questions, feedback or partnerships.'), style: TextStyle(color: AppColors.muted)),
                    const SizedBox(height: 18),
                    TextField(controller: _name, decoration: InputDecoration(labelText: t('Ad soyad', 'Full name'))),
                    const SizedBox(height: 12),
                    TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: InputDecoration(labelText: t('E-posta', 'Email'))),
                    const SizedBox(height: 12),
                    TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: InputDecoration(labelText: t('Telefon (isteğe bağlı)', 'Phone (optional)'))),
                    const SizedBox(height: 12),
                    TextField(controller: _subject, decoration: InputDecoration(labelText: t('Konu', 'Subject'))),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _message,
                      minLines: 5,
                      maxLines: 10,
                      decoration: InputDecoration(labelText: t('Mesaj', 'Message'), alignLabelWithHint: true),
                    ),
                    const SizedBox(height: 18),
                    PrimaryButton(label: t('Gönder', 'Send'), icon: LucideIcons.send, loading: _loading, onPressed: _submit),
                  ],
                ),
        ),
      ),
    );
  }
}
