import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/config.dart';
import 'core/device.dart';
import 'core/i18n.dart';
import 'features/auth/welcome_screen.dart';
import 'features/shell/home_shell.dart';
import 'features/shell/link_router.dart';
import 'features/transfer/p2p_engine.dart';
import 'state/auth_store.dart';
import 'state/files_store.dart';
import 'state/settings_store.dart';
import 'theme/app_theme.dart';
import 'widgets/ui.dart';

final navigatorKey = GlobalKey<NavigatorState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Colors.transparent,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  await Supabase.initialize(url: AppConfig.supabaseUrl, publishableKey: AppConfig.supabaseAnonKey);
  await Future.wait([
    initializeDateFormatting('tr'),
    initializeDateFormatting('en'),
    DeviceIdentity.load(),
  ]);
  final locale = await LocaleStore.load();
  final settings = SettingsStore();
  await settings.load();

  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider.value(value: locale),
      ChangeNotifierProvider.value(value: settings),
      ChangeNotifierProvider(create: (_) => AuthStore()),
      ChangeNotifierProvider(create: (_) => FilesStore()),
      ChangeNotifierProvider(create: (_) => P2PEngine()),
    ],
    child: const NearDropApp(),
  ));
}

class NearDropApp extends StatelessWidget {
  const NearDropApp({super.key});

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LocaleStore>();
    return MaterialApp(
      title: 'NearDrop',
      debugShowCheckedModeBanner: false,
      navigatorKey: navigatorKey,
      theme: AppTheme.build(),
      locale: Locale(locale.code),
      supportedLocales: const [Locale('tr'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (context, child) => LinkRouter(navigatorKey: navigatorKey, child: child!),
      home: const RootGate(),
    );
  }
}

/// Oturum durumuna göre giriş akışı, misafir modu ya da ana uygulama.
class RootGate extends StatefulWidget {
  const RootGate({super.key});

  @override
  State<RootGate> createState() => _RootGateState();
}

class _RootGateState extends State<RootGate> {
  String? _lastUser;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    final userId = auth.profile?.id;
    if (userId != _lastUser) {
      _lastUser = userId;
      // Hesap değişince dosya önbelleğini temizle, yeni kullanıcı için yükle
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final files = context.read<FilesStore>();
        files.reset();
        if (userId != null) files.refresh();
      });
    }
    if (auth.status == AuthStatus.signedOut && !auth.guest) {
      // Karşılama ekranına dönünce odadan çık; diğer cihazlar bu telefonu görmeye devam etmesin
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final engine = context.read<P2PEngine>();
        if (engine.connected || engine.joining) engine.leave();
      });
    }

    final Widget page;
    if (auth.status == AuthStatus.loading) {
      page = const _Splash(key: ValueKey('splash'));
    } else if (auth.isSignedIn) {
      page = const HomeShell(key: ValueKey('home'));
    } else if (auth.guest) {
      page = const HomeShell(key: ValueKey('guest'), guest: true);
    } else {
      page = const WelcomeScreen(key: ValueKey('welcome'));
    }
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 450),
      switchInCurve: Curves.easeOutCubic,
      transitionBuilder: (child, anim) => FadeTransition(
        opacity: anim,
        child: ScaleTransition(scale: Tween(begin: 0.98, end: 1.0).animate(anim), child: child),
      ),
      child: page,
    );
  }
}

class _Splash extends StatelessWidget {
  const _Splash({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: AuroraBackground(
        intense: true,
        child: Center(child: LogoMark(size: 96)),
      ),
    );
  }
}
