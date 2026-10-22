# shared_preferences_android ve path_provider_android Dart'tan JNI ile çağrılıyor.
# R8 bu metotları kullanılmıyor sanıp silince uygulama açılışta takılıyordu (NoSuchMethodError).
-keep class io.flutter.plugins.sharedpreferences.** { *; }
-keep class io.flutter.plugins.pathprovider.** { *; }
-keep class com.github.dart_lang.jni.** { *; }
-keep class com.github.dart_lang.jni_flutter.** { *; }
# jni paketinin isimle eriştiği Kotlin sınıfları (package:jni içindeki 'kotlin/...' referansları)
-keep class kotlin.Result { *; }
-keep class kotlin.Result$Failure { *; }
-keep class kotlin.Unit { *; }
-keep class kotlin.coroutines.** { *; }
