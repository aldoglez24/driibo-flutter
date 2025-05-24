package com.gotaxi.taxi.driver_flutter

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.core.content.ContextCompat // <-- Agregar
import io.flutter.embedding.android.FlutterActivity
import com.gotaxi.taxi.driver_flutter.R // Importa el R correcto


class MainActivity : FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        //val sound = Uri.parse("android.resource://${packageName}/${R.raw.notification}")

        val sound = Uri.parse("android.resource://${applicationContext.packageName}/${R.raw.notification}")
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channels = listOf(
            NotificationChannel("orders", "Orders", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "New trip request notifications"
            },
            NotificationChannel("message", "Message", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "In-App Chat messages"
            },
            NotificationChannel("tripEvents", "Order Events", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Updates to order status"
            }
        )

        val audioAttributes = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .build()

        channels.forEach {
            it.enableLights(true)
            it.setSound(sound, audioAttributes)
            notificationManager.createNotificationChannel(it)
        }
    }
}