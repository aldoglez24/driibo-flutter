package com.gotaxi.taxi.driver_flutter

import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PersistableBundle
import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {

  override fun onCreate(savedInstanceState: Bundle?, persistentState: PersistableBundle?) {
    super.onCreate(savedInstanceState, persistentState)
    createNotificationChannels()
  }

  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val sound = Uri.parse("android.resource://" + applicationContext.packageName + "/" + R.raw.notification)

    val notificationManager = applicationContext.getSystemService(NOTIFICATION_SERVICE) as NotificationManager

    NotificationChannel("orders", "Orders", NotificationManager.IMPORTANCE_HIGH).let {
      it.enableLights(true)
      it.description = "New trip request notifications"
      val audioAttributes = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .build()
      it.setSound(sound, audioAttributes)
      notificationManager.createNotificationChannel(it)
    }

    NotificationChannel("message", "Message", NotificationManager.IMPORTANCE_HIGH).let {
      it.enableLights(true)
      it.description = "In-App Chat messages"
      val audioAttributes = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_ALARM)
        .build()
      it.setSound(sound, audioAttributes)
      notificationManager.createNotificationChannel(it)
    }

    NotificationChannel("tripEvents", "Order Events", NotificationManager.IMPORTANCE_HIGH).let {
      it.enableLights(true)
      it.description = "Updates to order status"
      val audioAttributes = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_ALARM)
        .build()
      it.setSound(sound, audioAttributes)
      notificationManager.createNotificationChannel(it)
    }
  }
}
