allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
// Bazı eklentiler (receive_sharing_intent) compileSdk 37 istiyor; SDK bu platformu "android-37.0"
// olarak kurduğu için AGP 9.0 bulamıyor. Uygulamayla aynı seviyeye (36) çekiyoruz.
subprojects {
    afterEvaluate {
        val android = extensions.findByName("android")
        if (android is com.android.build.gradle.BaseExtension) {
            val sdk = android.compileSdkVersion?.removePrefix("android-")?.substringBefore('.')?.toIntOrNull()
            if (sdk != null && sdk > 36) android.compileSdkVersion(36)
        }
    }
}

subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
