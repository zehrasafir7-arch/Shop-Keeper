// @ts-ignore
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateAndroidProjectZip(res: Response, targetUrl: string) {
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="BussinessBilling-Android-APK-Project.zip"'
  );

  archive.pipe(res);

  // 1. Root build.gradle
  archive.append(
    `// Top-level build file
buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`,
    { name: 'ShopkeeperPro-Android/build.gradle' }
  );

  // 2. settings.gradle
  archive.append(
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "ShopkeeperPro"
include ':app'
`,
    { name: 'ShopkeeperPro-Android/settings.gradle' }
  );

  // 3. gradle.properties
  archive.append(
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
`,
    { name: 'ShopkeeperPro-Android/gradle.properties' }
  );

  // 4. app/build.gradle
  archive.append(
    `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'pro.shopkeeper.pos'
    compileSdk 34

    defaultConfig {
        applicationId "pro.shopkeeper.pos"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
`,
    { name: 'ShopkeeperPro-Android/app/build.gradle' }
  );

  // 5. app/src/main/AndroidManifest.xml
  archive.append(
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="pro.shopkeeper.pos">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@style/Theme.ShopkeeperPro"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:screenOrientation="unspecified"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="${new URL(targetUrl).hostname}" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`,
    { name: 'ShopkeeperPro-Android/app/src/main/AndroidManifest.xml' }
  );

  // 6. app/src/main/java/pro/shopkeeper/pos/MainActivity.kt
  archive.append(
    `package pro.shopkeeper.pos

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefresh: SwipeRefreshLayout
    
    // Live Cloud Server URL
    private val appUrl = "${targetUrl}"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        swipeRefresh = findViewById(R.id.swipeRefresh)

        setupWebView()
        setupBackNavigation()

        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(appUrl)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.userAgentString = settings.userAgentString + " ShopkeeperProAndroidApp/1.0"

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url.toString()
                if (url.startsWith("tel:") || url.startsWith("whatsapp:") || url.startsWith("mailto:") || url.startsWith("https://wa.me/")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        return false
                    }
                }
                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress == 100) {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.grant(request.resources)
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }
}
`,
    { name: 'ShopkeeperPro-Android/app/src/main/java/pro/shopkeeper/pos/MainActivity.kt' }
  );

  // 7. app/src/main/res/layout/activity_main.xml
  archive.append(
    `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0f172a">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="0dp"
        android:layout_height="4dp"
        android:indeterminate="false"
        android:max="100"
        android:progressTint="#2563eb"
        android:visibility="gone"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefresh"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/progressBar">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />
    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

</androidx.constraintlayout.widget.ConstraintLayout>
`,
    { name: 'ShopkeeperPro-Android/app/src/main/res/layout/activity_main.xml' }
  );

  // 8. res/values
  archive.append(
    `<resources>
    <string name="app_name">Shopkeeper Pro</string>
</resources>
`,
    { name: 'ShopkeeperPro-Android/app/src/main/res/values/strings.xml' }
  );

  archive.append(
    `<resources>
    <color name="primary">#2563eb</color>
    <color name="primary_dark">#1d4ed8</color>
    <color name="background">#0f172a</color>
</resources>
`,
    { name: 'ShopkeeperPro-Android/app/src/main/res/values/colors.xml' }
  );

  archive.append(
    `<resources>
    <style name="Theme.ShopkeeperPro" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="android:statusBarColor">@color/background</item>
    </style>
</resources>
`,
    { name: 'ShopkeeperPro-Android/app/src/main/res/values/themes.xml' }
  );

  // 9. README.md with build instructions
  archive.append(
    `# Shopkeeper Pro - Android APK Project

This is the complete Android Studio project for **Shopkeeper Pro POS & Billing**.

## 🚀 How to Build your APK (.apk file)

### Option 1: In Android Studio (Recommended)
1. Extract this ZIP archive.
2. Open **Android Studio** and select **"Open an Existing Project"**.
3. Choose the extracted \`ShopkeeperPro-Android\` folder.
4. Let Gradle sync dependencies.
5. In the top menu, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Android Studio will generate your \`app-debug.apk\` in \`app/build/outputs/apk/debug/\`!
7. Copy this \`app-debug.apk\` directly onto any Android phone or tablet to install.

### Option 2: Command Line (Gradle)
\`\`\`bash
cd ShopkeeperPro-Android
./gradlew assembleDebug
\`\`\`
The APK will be located at:
\`app/build/outputs/apk/debug/app-debug.apk\`

### Option 3: Publish to Google Play Store (.aab)
1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle (.aab)**.
3. Choose or create your signing keystore.
4. Upload the generated \`.aab\` directly to your **Google Play Console**!

---
Target Web App URL: ${targetUrl}
Package Identifier: pro.shopkeeper.pos
Min Android Version: Android 7.0 (API 24+)
Target Android Version: Android 14 (API 34)
`,
    { name: 'ShopkeeperPro-Android/README.md' }
  );

  // 10. Copy icons into mipmap
  const iconPath = path.resolve(__dirname, '../public/pwa-192x192.png');
  if (fs.existsSync(iconPath)) {
    archive.file(iconPath, { name: 'ShopkeeperPro-Android/app/src/main/res/mipmap/ic_launcher.png' });
  }

  archive.finalize();
}
