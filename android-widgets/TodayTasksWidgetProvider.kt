package app.lovable.propositos2026.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import app.lovable.propositos2026.R
import app.lovable.propositos2026.MainActivity

/**
 * Widget para mostrar las tareas de hoy
 */
class TodayTasksWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_REFRESH = "app.lovable.propositos2026.REFRESH_TASKS_WIDGET"

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

            // Intent para refresh manual
            val refreshIntent = Intent(context, TodayTasksWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                2,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)

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

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        
        if (intent.action == ACTION_REFRESH) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, TodayTasksWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }
}
