import { mkdir, readFile, writeFile } from 'node:fs/promises';

const javaDir = 'android/app/src/main/java/com/pspktech/weddinginvitation';
const javaPath = `${javaDir}/AppUpdaterPlugin.java`;
const activityPath = `${javaDir}/MainActivity.java`;
const manifestPath = 'android/app/src/main/AndroidManifest.xml';

await mkdir(javaDir, { recursive: true });

await writeFile(javaPath, `package com.pspktech.weddinginvitation;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {
    private static final String APK_MIME = "application/vnd.android.package-archive";

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        try {
            String version = getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0).versionName;
            JSObject result = new JSObject();
            result.put("version", version == null ? "1.0.0" : version);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to read app version", error);
        }
    }

    @PluginMethod
    public void downloadApk(PluginCall call) {
        String url = call.getString("url");
        String fileName = call.getString("fileName", "MadhuPotti-update.apk");
        if (url == null || !url.startsWith("https://")) {
            call.reject("Only HTTPS update URLs are allowed");
            return;
        }
        fileName = fileName.replaceAll("[^A-Za-z0-9._-]", "_");
        try {
            DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("MadhuPotti update");
            request.setDescription("Downloading the latest wedding invitation app");
            request.setMimeType(APK_MIME);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);
            request.setDestinationInExternalFilesDir(getContext(), Environment.DIRECTORY_DOWNLOADS, fileName);
            long id = manager.enqueue(request);
            JSObject result = new JSObject();
            result.put("downloadId", id);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to start APK download", error);
        }
    }

    @PluginMethod
    public void getDownloadStatus(PluginCall call) {
        long id = call.getLong("downloadId", -1L);
        if (id < 0) { call.reject("Invalid download id"); return; }
        DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        try (android.database.Cursor cursor = manager.query(new DownloadManager.Query().setFilterById(id))) {
            if (cursor == null || !cursor.moveToFirst()) { call.reject("Download not found"); return; }
            int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            int reason = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_REASON));
            int downloaded = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
            int total = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
            String state = "pending";
            if (status == DownloadManager.STATUS_RUNNING) state = "running";
            if (status == DownloadManager.STATUS_SUCCESSFUL) state = "successful";
            if (status == DownloadManager.STATUS_FAILED) state = "failed";
            JSObject result = new JSObject();
            result.put("state", state);
            result.put("reason", reason);
            result.put("progress", total > 0 ? Math.round(downloaded * 100f / total) : 0);
            result.put("uri", manager.getUriForDownloadedFile(id) == null ? "" : manager.getUriForDownloadedFile(id).toString());
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to read download status", error);
        }
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        long id = call.getLong("downloadId", -1L);
        if (id < 0) { call.reject("Invalid download id"); return; }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            try {
                Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getContext().getPackageName()));
                settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(settings);
                call.reject("ALLOW_INSTALLS", "Allow MadhuPotti to install updates, then tap Update again");
            } catch (Exception error) {
                call.reject("Please allow installs from this source in Android settings", error);
            }
            return;
        }
        DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        Uri uri = manager.getUriForDownloadedFile(id);
        if (uri == null) { call.reject("APK download is not ready"); return; }
        try {
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(uri, APK_MIME);
            install.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(install);
            call.resolve();
        } catch (Exception error) {
            call.reject("Unable to open Android installer", error);
        }
    }
}
`);

await writeFile(activityPath, `package com.pspktech.weddinginvitation;

import android.os.Bundle;
import com.google.android.material.color.DynamicColors;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppUpdaterPlugin.class);
        DynamicColors.applyToActivityIfAvailable(this);
        super.onCreate(savedInstanceState);
    }
}
`);

let manifest = await readFile(manifestPath, 'utf8');
if (!manifest.includes('android.permission.REQUEST_INSTALL_PACKAGES')) {
  manifest = manifest.replace(
    '    <uses-permission android:name="android.permission.INTERNET" />',
    '    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />'
  );
}
await writeFile(manifestPath, manifest);
console.log('Applied native in-app APK updater bridge.');
