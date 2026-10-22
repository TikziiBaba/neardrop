import 'format.dart';

int _int(dynamic v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
int? _intOrNull(dynamic v) => v == null ? null : _int(v);

class UserProfile {
  final String id;
  final String email;
  final String displayName;
  final String? avatarUrl;
  final int quotaBytes;
  final int usedBytes;
  final String role;
  final String subscriptionTier;
  final String subscriptionStatus;
  final DateTime? subscriptionRenewsAt;
  final DateTime? createdAt;

  const UserProfile({
    required this.id,
    required this.email,
    required this.displayName,
    this.avatarUrl,
    required this.quotaBytes,
    required this.usedBytes,
    required this.role,
    required this.subscriptionTier,
    this.subscriptionStatus = 'active',
    this.subscriptionRenewsAt,
    this.createdAt,
  });

  bool get isAdmin => role == 'admin' || role == 'moderator';
  bool get isPaid => subscriptionTier != 'free';

  UserProfile copyWith({String? displayName, String? avatarUrl, int? usedBytes}) => UserProfile(
        id: id,
        email: email,
        displayName: displayName ?? this.displayName,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        quotaBytes: quotaBytes,
        usedBytes: usedBytes ?? this.usedBytes,
        role: role,
        subscriptionTier: subscriptionTier,
        subscriptionStatus: subscriptionStatus,
        subscriptionRenewsAt: subscriptionRenewsAt,
        createdAt: createdAt,
      );
}

class CloudFile {
  final String id;
  final String filename;
  final int size;
  final String mimeType;
  final String? checksum;
  final DateTime? createdAt;
  final DateTime? expiresAt;
  final int activeSharesCount;

  const CloudFile({
    required this.id,
    required this.filename,
    required this.size,
    required this.mimeType,
    this.checksum,
    this.createdAt,
    this.expiresAt,
    this.activeSharesCount = 0,
  });

  factory CloudFile.fromJson(Map<String, dynamic> j) => CloudFile(
        id: '${j['id']}',
        filename: '${j['filename'] ?? ''}',
        size: _int(j['size']),
        mimeType: '${j['mimeType'] ?? j['mime_type'] ?? 'application/octet-stream'}',
        checksum: j['checksum'] as String?,
        createdAt: parseDate(j['createdAt'] ?? j['created_at']),
        expiresAt: parseDate(j['expiresAt']),
        activeSharesCount: _int(j['activeSharesCount']),
      );

  /// Klasörler dosya adındaki "/" ile ifade edilir (ör. "Fotoğraflar/tatil.jpg").
  String get name => filename.split('/').last;
  String get folder {
    final i = filename.lastIndexOf('/');
    return i < 0 ? '' : filename.substring(0, i);
  }

  FileCategory get category => fileCategory(mimeType, filename);

  CloudFile copyWith({String? filename, int? size}) => CloudFile(
        id: id,
        filename: filename ?? this.filename,
        size: size ?? this.size,
        mimeType: mimeType,
        checksum: checksum,
        createdAt: createdAt,
        expiresAt: expiresAt,
        activeSharesCount: activeSharesCount,
      );
}

class ShareLink {
  final String id;
  final String? cloudFileId;
  final String? folderPath;
  final String? title;
  final String? description;
  final String token;
  final bool passwordProtected;
  final DateTime? expiresAt;
  final int downloadCount;
  final int? maxDownloads;
  final bool isActive;
  final DateTime? createdAt;
  final bool isFolder;
  final int folderFilesCount;
  final int folderTotalBytes;
  final String? fileName;
  final int? fileSize;
  final String? fileMime;

  const ShareLink({
    required this.id,
    this.cloudFileId,
    this.folderPath,
    this.title,
    this.description,
    required this.token,
    this.passwordProtected = false,
    this.expiresAt,
    this.downloadCount = 0,
    this.maxDownloads,
    this.isActive = true,
    this.createdAt,
    this.isFolder = false,
    this.folderFilesCount = 0,
    this.folderTotalBytes = 0,
    this.fileName,
    this.fileSize,
    this.fileMime,
  });

  factory ShareLink.fromJson(Map<String, dynamic> j) {
    final cf = j['cloudFile'] as Map<String, dynamic>?;
    return ShareLink(
      id: '${j['id']}',
      cloudFileId: j['cloudFileId'] as String?,
      folderPath: j['folderPath'] as String?,
      title: j['title'] as String?,
      description: j['description'] as String?,
      token: '${j['token']}',
      passwordProtected: j['passwordProtected'] == true,
      expiresAt: parseDate(j['expiresAt']),
      downloadCount: _int(j['downloadCount']),
      maxDownloads: _intOrNull(j['maxDownloads']),
      isActive: j['isActive'] != false,
      createdAt: parseDate(j['createdAt']),
      isFolder: j['isFolder'] == true || (j['folderPath'] as String?)?.isNotEmpty == true,
      folderFilesCount: _int(j['folderFilesCount']),
      folderTotalBytes: _int(j['folderTotalBytes']),
      fileName: cf?['filename'] as String?,
      fileSize: _intOrNull(cf?['size']),
      fileMime: cf?['mimeType'] as String?,
    );
  }

  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());
  bool get isExhausted => maxDownloads != null && downloadCount >= maxDownloads!;
  bool get isLive => isActive && !isExpired && !isExhausted;

  String get displayName {
    if (isFolder) return title ?? folderPath?.split('/').last ?? 'Folder';
    return (fileName ?? title ?? 'File').split('/').last;
  }

  int get displaySize => isFolder ? folderTotalBytes : (fileSize ?? 0);

  ShareLink copyWith({bool? isActive, DateTime? expiresAt, bool clearExpiry = false}) => ShareLink(
        id: id,
        cloudFileId: cloudFileId,
        folderPath: folderPath,
        title: title,
        description: description,
        token: token,
        passwordProtected: passwordProtected,
        expiresAt: clearExpiry ? null : (expiresAt ?? this.expiresAt),
        downloadCount: downloadCount,
        maxDownloads: maxDownloads,
        isActive: isActive ?? this.isActive,
        createdAt: createdAt,
        isFolder: isFolder,
        folderFilesCount: folderFilesCount,
        folderTotalBytes: folderTotalBytes,
        fileName: fileName,
        fileSize: fileSize,
        fileMime: fileMime,
      );
}

class TrashFile {
  final String id;
  final String filename;
  final int size;
  final String mimeType;
  final DateTime? deletedAt;
  final int daysLeft;

  const TrashFile({
    required this.id,
    required this.filename,
    required this.size,
    required this.mimeType,
    this.deletedAt,
    this.daysLeft = 30,
  });

  factory TrashFile.fromJson(Map<String, dynamic> j) => TrashFile(
        id: '${j['id']}',
        filename: '${j['filename'] ?? ''}',
        size: _int(j['size']),
        mimeType: '${j['mimeType'] ?? ''}',
        deletedAt: parseDate(j['deletedAt']),
        daysLeft: _int(j['daysLeft']),
      );
}

class Ticket {
  final String id;
  final String title;
  final String department;
  final String priority;
  final String status;
  final String userEmail;
  final String userName;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int messagesCount;

  const Ticket({
    required this.id,
    required this.title,
    required this.department,
    required this.priority,
    required this.status,
    this.userEmail = '',
    this.userName = '',
    this.createdAt,
    this.updatedAt,
    this.messagesCount = 0,
  });

  factory Ticket.fromJson(Map<String, dynamic> j) => Ticket(
        id: '${j['id']}',
        title: '${j['title'] ?? ''}',
        department: '${j['department'] ?? 'general'}',
        priority: '${j['priority'] ?? 'medium'}',
        status: '${j['status'] ?? 'open'}',
        userEmail: '${j['userEmail'] ?? ''}',
        userName: '${j['userName'] ?? ''}',
        createdAt: parseDate(j['createdAt']),
        updatedAt: parseDate(j['updatedAt'] ?? j['lastReplyAt']),
        messagesCount: _int(j['messagesCount']),
      );

  bool get isClosed => status == 'resolved' || status == 'closed';
}

class TicketMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String senderRole;
  final String message;
  final bool isStaff;
  final DateTime? createdAt;

  const TicketMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.message,
    required this.isStaff,
    this.createdAt,
  });

  factory TicketMessage.fromJson(Map<String, dynamic> j) => TicketMessage(
        id: '${j['id']}',
        senderId: '${j['senderId'] ?? ''}',
        senderName: '${j['senderName'] ?? ''}',
        senderRole: '${j['senderRole'] ?? 'member'}',
        message: '${j['message'] ?? ''}',
        isStaff: j['isStaff'] == true,
        createdAt: parseDate(j['createdAt']),
      );
}

/// Paylaşım bağlantısının herkese açık bilgisi (/api/download?token=)
class PublicShare {
  final String token;
  final bool isFolder;
  final bool passwordProtected;
  final DateTime? expiresAt;
  final int downloadCount;
  final int? maxDownloads;
  final String? title;
  final String? description;
  final CloudFile? file;
  final List<CloudFile> files;
  final int totalSize;

  const PublicShare({
    required this.token,
    required this.isFolder,
    required this.passwordProtected,
    this.expiresAt,
    this.downloadCount = 0,
    this.maxDownloads,
    this.title,
    this.description,
    this.file,
    this.files = const [],
    this.totalSize = 0,
  });

  factory PublicShare.fromJson(String token, Map<String, dynamic> j) {
    final share = (j['share'] as Map?)?.cast<String, dynamic>() ?? {};
    final files = ((j['files'] as List?) ?? []).map((e) => CloudFile.fromJson((e as Map).cast<String, dynamic>())).toList();
    final file = j['file'] is Map ? CloudFile.fromJson((j['file'] as Map).cast<String, dynamic>()) : null;
    return PublicShare(
      token: token,
      isFolder: j['isFolder'] == true,
      passwordProtected: share['passwordProtected'] == true || share['password_hash'] != null,
      expiresAt: parseDate(share['expiresAt'] ?? share['expires_at']),
      downloadCount: _int(share['downloadCount'] ?? share['download_count']),
      maxDownloads: _intOrNull(share['maxDownloads'] ?? share['max_downloads']),
      title: j['title'] as String?,
      description: j['description'] as String?,
      file: file,
      files: files,
      totalSize: j['totalSize'] != null ? _int(j['totalSize']) : (file?.size ?? 0),
    );
  }

  String get displayName => isFolder ? (title ?? 'Folder') : (file?.name ?? 'File');
}
