package expo.modules.foregroundservice

import android.Manifest
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import androidx.core.content.ContextCompat
import expo.modules.interfaces.permissions.PermissionsStatus
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Keeps the process alive while a clip transcribes.
 *
 * The service does no work of its own. React Native's JS thread carries on when
 * the app is backgrounded; what it cannot survive is the system deciding the
 * process is idle. A foreground service is what says otherwise.
 */
class ForegroundServiceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ForegroundService")

    AsyncFunction("start") { text: String, percent: Int ->
      send(TranscriptionService.ACTION_START, text, percent)
    }

    AsyncFunction("update") { percent: Int ->
      send(TranscriptionService.ACTION_UPDATE, null, percent)
    }

    AsyncFunction("stop") {
      appContext.reactContext?.let { context ->
        context.stopService(Intent(context, TranscriptionService::class.java))
      }
      Unit
    }

    // The phone's own reading of how hot it is, PowerManager's THERMAL_STATUS_*:
    // 0 none, 1 light, 2 moderate, 3 severe, 4 critical, 5 emergency, 6 shutdown.
    // A batch reads it between clips and waits at severe, rather than pushing a
    // phone that is already throttling into the platform killing the app.
    Function("thermalStatus") {
      val context = appContext.reactContext ?: return@Function 0
      val power = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
      power?.currentThermalStatus ?: 0
    }

    // Physical memory, in bytes. The downloaded language model is read whole
    // into RAM, and on a phone with too little of it the system kills the app
    // the moment the model loads — so the download is not offered there.
    Function("totalMemory") {
      val context = appContext.reactContext ?: return@Function 0.0
      val activity = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
      val info = ActivityManager.MemoryInfo()
      activity?.getMemoryInfo(info)
      info.totalMem.toDouble()
    }

    AsyncFunction("requestNotificationPermission") { promise: Promise ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
        promise.resolve(true)
        return@AsyncFunction
      }

      val permissions = appContext.permissions
      if (permissions == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      permissions.askForPermissions({ result ->
        promise.resolve(result[Manifest.permission.POST_NOTIFICATIONS]?.status == PermissionsStatus.GRANTED)
      }, Manifest.permission.POST_NOTIFICATIONS)
    }
  }

  private fun send(action: String, text: String?, percent: Int) {
    val context = appContext.reactContext ?: return
    val intent = Intent(context, TranscriptionService::class.java).apply {
      this.action = action
      putExtra(TranscriptionService.EXTRA_PERCENT, percent)
      if (text != null) putExtra(TranscriptionService.EXTRA_TEXT, text)
    }
    ContextCompat.startForegroundService(context, intent)
  }
}
