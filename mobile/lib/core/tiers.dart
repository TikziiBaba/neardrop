import 'i18n.dart';
import 'models.dart';

/// lib/subscription/permissions.ts içindeki TIER_LIMITS'in arayüzde gereken kısmı.
/// Asıl kontrol sunucuda yapılır; burada yalnızca kilitli seçenekler gösterilir.
class TierRules {
  final int rank;
  final bool staff;
  const TierRules(this.rank, this.staff);

  factory TierRules.of(UserProfile? p) {
    final rank = switch (p?.subscriptionTier) { 'pro' => 1, 'ultra' => 2, 'enterprise' => 3, _ => 0 };
    return TierRules(rank, p?.isAdmin ?? false);
  }

  bool atLeast(int r) => staff || rank >= r;
  bool get passwords => atLeast(1);
  bool get folderSharing => atLeast(1);
  bool get customDownloadLimit => atLeast(1);
  bool get permanentLinks => atLeast(2);
  bool get analytics => atLeast(2);
  int get maxActiveShares => atLeast(1) ? 9999 : 1;
}

class ExpiryOption {
  final int hours;
  final int minRank;
  const ExpiryOption(this.hours, this.minRank);

  String get label => switch (hours) {
        0 => t('Süresiz', 'Never'),
        1 => t('1 saat', '1 hour'),
        6 => t('6 saat', '6 hours'),
        12 => t('12 saat', '12 hours'),
        24 => t('24 saat', '24 hours'),
        168 => t('7 gün', '7 days'),
        720 => t('30 gün', '30 days'),
        _ => '$hours h',
      };
}

const expiryOptions = [
  ExpiryOption(1, 0),
  ExpiryOption(6, 0),
  ExpiryOption(12, 0),
  ExpiryOption(168, 1),
  ExpiryOption(720, 2),
  ExpiryOption(0, 2),
];

String tierName(String tier) => switch (tier) {
      'pro' => 'Pro',
      'ultra' => 'Ultra',
      'enterprise' => t('Kurumsal', 'Enterprise'),
      _ => t('Ücretsiz', 'Free'),
    };
