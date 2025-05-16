// apps/driver-frontend/android/app/src/main/kotlin/com/gotaxi/taxi/driver_flutter/MainActivity.kt
package com.gotaxi.taxi.driver_flutter

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity

class MainActivity : FlutterActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val sound = Uri.parse("android.resource://$packageName/${R.raw.notification}")
        val mgr   = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val attrs = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .build()

        listOf(
            NotificationChannel("orders", "Orders",   NotificationManager.IMPORTANCE_HIGH)
                .apply { description = "New trip request notifications" },
            NotificationChannel("message", "Message", NotificationManager.IMPORTANCE_HIGH)
                .apply { description = "In-App chat messages" },
            NotificationChannel("tripEvents", "Order Events", NotificationManager.IMPORTANCE_HIGH)
                .apply { description = "Updates to order status" }
        ).forEach {
            it.enableLights(true)
            it.setSound(sound, attrs)
            mgr.createNotificationChannel(it)
        }
    }
}
