package app.lovable.propositos2026.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.SharedPreferences
import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * Puente entre JavaScript (WebView) y los widgets nativos de Android.
 * 
 * Para usar este bridge:
 * 1. Copia este archivo a: android/app/src/main/java/app/lovable/propositos2026/widgets/
 * 2. Modifica MainActivity.kt para agregar el JavaScript interface
 * 
 * En MainActivity.kt, dentro de onCreate(), después de super.onCreate():
 * 
 * ```kotlin
 * val webView = findViewById<WebView>(android.R.id.content)?.findViewWithTag<WebView>("webview")
 * // O si usas Capacitor, accede al WebView así:
 * bridge.webView.addJavascriptInterface(WidgetBridge(this), "AndroidWidget")
 * ```
 */
class WidgetBridge(private val context: Context) {

    private val goalsPrefs: SharedPreferences = 
        context.getSharedPreferences("GoalsWidgetData", Context.MODE_PRIVATE)
    
    private val tasksPrefs: SharedPreferences = 
        context.getSharedPreferences("TasksWidgetData", Context.MODE_PRIVATE)

    /**
     * Llamado desde JavaScript para actualizar el widget de metas
     * @param jsonData JSON string con los datos de las metas
     */
    @JavascriptInterface
    fun updateGoalsWidget(jsonData: String) {
        try {
            val data = JSONObject(jsonData)
            
            goalsPrefs.edit().apply {
                putString("goal1_title", data.optString("goal1_title", "Meta 1"))
                putInt("goal1_progress", data.optInt("goal1_progress", 0))
                putString("goal2_title", data.optString("goal2_title", "Meta 2"))
                putInt("goal2_progress", data.optInt("goal2_progress", 0))
                putString("goal3_title", data.optString("goal3_title", "Meta 3"))
                putInt("goal3_progress", data.optInt("goal3_progress", 0))
                apply()
            }

            // Notificar al widget que se actualice
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, GoalsWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            
            for (appWidgetId in appWidgetIds) {
                GoalsWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId)
            }
            
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Llamado desde JavaScript para actualizar el widget de tareas
     * @param jsonData JSON string con los datos de las tareas
     */
    @JavascriptInterface
    fun updateTasksWidget(jsonData: String) {
        try {
            val data = JSONObject(jsonData)
            
            tasksPrefs.edit().apply {
                putString("task1_text", data.optString("task1_text", ""))
                putBoolean("task1_completed", data.optBoolean("task1_completed", false))
                putString("task2_text", data.optString("task2_text", ""))
                putBoolean("task2_completed", data.optBoolean("task2_completed", false))
                putString("task3_text", data.optString("task3_text", ""))
                putBoolean("task3_completed", data.optBoolean("task3_completed", false))
                putString("task4_text", data.optString("task4_text", ""))
                putBoolean("task4_completed", data.optBoolean("task4_completed", false))
                apply()
            }

            // Notificar al widget que se actualice
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, TodayTasksWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            
            for (appWidgetId in appWidgetIds) {
                TodayTasksWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId)
            }
            
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
