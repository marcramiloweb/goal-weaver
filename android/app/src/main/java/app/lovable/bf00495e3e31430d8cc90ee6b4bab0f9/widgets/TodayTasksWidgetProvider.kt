package app.lovable.bf00495e3e31430d8cc90ee6b4bab0f9.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.view.View
import app.lovable.bf00495e3e31430d8cc90ee6b4bab0f9.R

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
        private const val PREFS_NAME = "TasksWidgetPrefs"
        private const val MAX_TASKS = 5

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            
            val views = RemoteViews(context.packageName, R.layout.today_tasks_widget_layout)
            
            val taskContainerIds = arrayOf(
                R.id.task_1_container,
                R.id.task_2_container,
                R.id.task_3_container,
                R.id.task_4_container,
                R.id.task_5_container
            )
            
            val taskTitleIds = arrayOf(
                R.id.task_1_title,
                R.id.task_2_title,
                R.id.task_3_title,
                R.id.task_4_title,
                R.id.task_5_title
            )
            
            val taskIconIds = arrayOf(
                R.id.task_1_icon,
                R.id.task_2_icon,
                R.id.task_3_icon,
                R.id.task_4_icon,
                R.id.task_5_icon
            )
            
            for (i in 0 until MAX_TASKS) {
                val taskTitle = prefs.getString("task_${i}_title", null)
                val taskCompleted = prefs.getBoolean("task_${i}_completed", false)
                
                if (taskTitle != null) {
                    views.setViewVisibility(taskContainerIds[i], View.VISIBLE)
                    views.setTextViewText(taskTitleIds[i], taskTitle)
                    
                    if (taskCompleted) {
                        views.setImageViewResource(taskIconIds[i], R.drawable.ic_check_circle)
                    } else {
                        views.setImageViewResource(taskIconIds[i], R.drawable.ic_circle)
                    }
                } else {
                    views.setViewVisibility(taskContainerIds[i], View.GONE)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
