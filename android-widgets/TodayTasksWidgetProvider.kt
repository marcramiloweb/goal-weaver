package app.lovable.propositos2026.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import app.lovable.propositos2026.R
import app.lovable.propositos2026.MainActivity

/**
 * Widget para mostrar las tareas de hoy
 * 
 * Para usar este widget:
 * 1. Copia este archivo a: android/app/src/main/java/app/lovable/propositos2026/widgets/
 * 2. Copia today_tasks_widget_layout.xml a: android/app/src/main/res/layout/
 * 3. Copia today_tasks_widget_info.xml a: android/app/src/main/res/xml/
 * 4. Añade el receiver en AndroidManifest.xml
 */
class TodayTasksWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.today_tasks_widget_layout)

            // Intent para abrir la app
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // Cargar datos desde SharedPreferences
            val prefs = context.getSharedPreferences("TodayTasksData", Context.MODE_PRIVATE)
            
            val task1 = prefs.getString("task1", "") ?: ""
            val task1Done = prefs.getBoolean("task1_done", false)
            val task2 = prefs.getString("task2", "") ?: ""
            val task2Done = prefs.getBoolean("task2_done", false)
            val task3 = prefs.getString("task3", "") ?: ""
            val task3Done = prefs.getBoolean("task3_done", false)
            val task4 = prefs.getString("task4", "") ?: ""
            val task4Done = prefs.getBoolean("task4_done", false)

            val completedCount = listOf(task1Done, task2Done, task3Done, task4Done).count { it }
            val totalCount = listOf(task1, task2, task3, task4).count { it.isNotEmpty() }

            views.setTextViewText(R.id.tasks_count, "$completedCount/$totalCount completadas")

            if (task1.isNotEmpty()) {
                views.setTextViewText(R.id.task1_text, task1)
                views.setImageViewResource(
                    R.id.task1_check, 
                    if (task1Done) R.drawable.ic_check_circle else R.drawable.ic_circle
                )
            }
            if (task2.isNotEmpty()) {
                views.setTextViewText(R.id.task2_text, task2)
                views.setImageViewResource(
                    R.id.task2_check, 
                    if (task2Done) R.drawable.ic_check_circle else R.drawable.ic_circle
                )
            }
            if (task3.isNotEmpty()) {
                views.setTextViewText(R.id.task3_text, task3)
                views.setImageViewResource(
                    R.id.task3_check, 
                    if (task3Done) R.drawable.ic_check_circle else R.drawable.ic_circle
                )
            }
            if (task4.isNotEmpty()) {
                views.setTextViewText(R.id.task4_text, task4)
                views.setImageViewResource(
                    R.id.task4_check, 
                    if (task4Done) R.drawable.ic_check_circle else R.drawable.ic_circle
                )
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
