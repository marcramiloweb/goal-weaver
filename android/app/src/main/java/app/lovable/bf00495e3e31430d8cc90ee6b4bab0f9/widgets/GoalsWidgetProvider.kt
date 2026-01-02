package app.lovable.bf00495e3e31430d8cc90ee6b4bab0f9.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.content.SharedPreferences
import app.lovable.bf00495e3e31430d8cc90ee6b4bab0f9.R

class GoalsWidgetProvider : AppWidgetProvider() {

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
        private const val PREFS_NAME = "GoalsWidgetPrefs"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            
            val views = RemoteViews(context.packageName, R.layout.goals_widget_layout)
            
            // Goal 1
            val goal1Title = prefs.getString("goal_1_title", "Meta 1")
            val goal1Progress = prefs.getInt("goal_1_progress", 0)
            views.setTextViewText(R.id.goal_1_title, goal1Title)
            views.setTextViewText(R.id.goal_1_progress_text, "$goal1Progress%")
            views.setProgressBar(R.id.goal_1_progress_bar, 100, goal1Progress, false)
            
            // Goal 2
            val goal2Title = prefs.getString("goal_2_title", "Meta 2")
            val goal2Progress = prefs.getInt("goal_2_progress", 0)
            views.setTextViewText(R.id.goal_2_title, goal2Title)
            views.setTextViewText(R.id.goal_2_progress_text, "$goal2Progress%")
            views.setProgressBar(R.id.goal_2_progress_bar, 100, goal2Progress, false)
            
            // Goal 3
            val goal3Title = prefs.getString("goal_3_title", "Meta 3")
            val goal3Progress = prefs.getInt("goal_3_progress", 0)
            views.setTextViewText(R.id.goal_3_title, goal3Title)
            views.setTextViewText(R.id.goal_3_progress_text, "$goal3Progress%")
            views.setProgressBar(R.id.goal_3_progress_bar, 100, goal3Progress, false)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
