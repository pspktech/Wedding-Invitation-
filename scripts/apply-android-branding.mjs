import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const root = 'android/app/src/main';
const manifestPath = `${root}/AndroidManifest.xml`;
const stringsPath = `${root}/res/values/strings.xml`;
const stylesPath = `${root}/res/values/styles.xml`;
const colorsPath = `${root}/res/values/colors.xml`;
const activityPath = `${root}/java/com/pspktech/weddinginvitation/MainActivity.java`;
const iconDir = `${root}/res/drawable`;

await mkdir(iconDir, { recursive: true });
await copyFile('assets/madhupotti-icon.png', `${iconDir}/madhupotti_icon.png`);

let manifest = await readFile(manifestPath, 'utf8');
manifest = manifest
  .replace('android:icon="@mipmap/ic_launcher"', 'android:icon="@drawable/madhupotti_icon"')
  .replace('android:roundIcon="@mipmap/ic_launcher_round"', 'android:roundIcon="@drawable/madhupotti_icon"');
await writeFile(manifestPath, manifest);

let strings = await readFile(stringsPath, 'utf8');
strings = strings
  .replace(/<string name="app_name">.*?<\/string>/, '<string name="app_name">MadhuPotti</string>')
  .replace(/<string name="title_activity_main">.*?<\/string>/, '<string name="title_activity_main">MadhuPotti</string>');
await writeFile(stringsPath, strings);

await writeFile(colorsPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#3D5A40</color>
    <color name="colorPrimaryDark">#1C291E</color>
    <color name="colorAccent">#D4A967</color>
</resources>
`);

await writeFile(stylesPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="android:fontFamily">sans</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@color/colorPrimaryDark</item>
        <item name="android:windowActionModeOverlay">true</item>
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>
    <style name="AppTheme.NoActionBar" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@color/colorPrimaryDark</item>
        <item name="android:background">@null</item>
    </style>
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`);

await writeFile(activityPath, `package com.pspktech.weddinginvitation;

import android.os.Bundle;
import com.google.android.material.color.DynamicColors;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        DynamicColors.applyToActivityIfAvailable(this);
        super.onCreate(savedInstanceState);
    }
}
`);

const gradlePath = 'android/app/build.gradle';
let gradle = await readFile(gradlePath, 'utf8');
if (!gradle.includes('com.google.android.material:material')) {
  gradle = gradle.replace(
    'implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"',
    'implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"\n    implementation "com.google.android.material:material:1.13.0"'
  );
}
await writeFile(gradlePath, gradle);

console.log('Applied MadhuPotti Android branding and dynamic Material theme.');
