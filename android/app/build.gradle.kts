import java.util.Properties

plugins {
    id("com.android.application")
    // START: FlutterFire Configuration
    id("com.google.gms.google-services")
    // END: FlutterFire Configuration
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")

if (keystorePropertiesFile.exists()) {
    keystorePropertiesFile.inputStream().use { keystoreProperties.load(it) }
}

val releaseKeyAlias = keystoreProperties["keyAlias"]?.toString()?.takeIf { it.isNotBlank() }
val releaseKeyPassword = keystoreProperties["keyPassword"]?.toString()?.takeIf { it.isNotBlank() }
val releaseStorePassword = keystoreProperties["storePassword"]?.toString()?.takeIf { it.isNotBlank() }
val releaseStoreFile = keystoreProperties["storeFile"]?.toString()?.takeIf { it.isNotBlank() }?.let { file(it) }

val isReleaseKeystoreConfigured = listOf(releaseKeyAlias, releaseKeyPassword, releaseStorePassword).none { it.isNullOrBlank() } && releaseStoreFile?.exists() == true

android {
    namespace = "com.eyexapp.sefernur"
    compileSdk = 36
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
        isCoreLibraryDesugaringEnabled = true
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    signingConfigs {
        if (isReleaseKeystoreConfigured) {
            create("release") {
                keyAlias = releaseKeyAlias!!
                keyPassword = releaseKeyPassword!!
                storeFile = releaseStoreFile!!
                storePassword = releaseStorePassword!!
            }
        }
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.eyexapp.sefernur"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = 26
        targetSdk = 36
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        multiDexEnabled = true
    }

    buildTypes {
        release {
            signingConfig = if (isReleaseKeystoreConfigured) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:32.7.4"))
    implementation("com.google.firebase:firebase-analytics")
    implementation("androidx.multidex:multidex:2.0.1")
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
}
