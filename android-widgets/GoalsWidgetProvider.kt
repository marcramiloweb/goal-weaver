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
 * Widget para mostrar las metas principales con progreso
 */
class GoalsWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_REFRESH = "app.lovable.propositos2026.REFRESH_GOALS_WIDGET"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.goals_widget_layout)

            // Intent para abrir la app al tocar el widget
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // Intent para refresh manual
            val refreshIntent = Intent(context, GoalsWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                1,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)

            // Cargar datos desde SharedPreferences
            val prefs = context.getSharedPreferences("GoalsWidgetData", Context.MODE_PRIVATE)
            
            val goal1Title = prefs.getString("goal1_title", "Meta 1") ?: "Meta 1"
            val goal1Progress = prefs.getInt("goal1_progress", 0)
            val goal2Title = prefs.getString("goal2_title", "Meta 2") ?: "Meta 2"
            val goal2Progress = prefs.getInt("goal2_progress", 0)
            val goal3Title = prefs.getString("goal3_title", "Meta 3") ?: "Meta 3"
            val goal3Progress = prefs.getInt("goal3_progress", 0)

            views.setTextViewText(R.id.goal1_title, goal1Title)
            views.setProgressBar(R.id.goal1_progress, 100, goal1Progress, false)
            views.setTextViewText(R.id.goal1_percent, "$goal1Progress%")

            views.setTextViewText(R.id.goal2_title, goal2Title)
            views.setProgressBar(R.id.goal2_progress, 100, goal2Progress, false)
            views.setTextViewText(R.id.goal2_percent, "$goal2Progress%")

            views.setTextViewText(R.id.goal3_title, goal3Title)
            views.setProgressBar(R.id.goal3_progress, 100, goal3Progress, false)
            views.setTextViewText(R.id.goal3_percent, "$goal3Progress%")

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
            val componentName = ComponentName(context, GoalsWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }
}
