import { Capacitor } from '@capacitor/core';

interface GoalWidgetData {
  goal1_title: string;
  goal1_progress: number;
  goal2_title: string;
  goal2_progress: number;
  goal3_title: string;
  goal3_progress: number;
}

interface TaskWidgetData {
  task1_text: string;
  task1_completed: boolean;
  task2_text: string;
  task2_completed: boolean;
  task3_text: string;
  task3_completed: boolean;
  task4_text: string;
  task4_completed: boolean;
}

/**
 * Sincroniza los datos de metas con el widget de Android
 * Usa JavaScript Interface para comunicarse con el código nativo
 */
export const syncGoalsWidget = async (goals: Array<{
  title: string;
  current_value: number | null;
  target_value: number | null;
  is_featured?: boolean | null;
}>) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Widget sync: Not running on native platform');
    return;
  }

  try {
    // Filtrar metas destacadas o tomar las primeras 3
    const featuredGoals = goals.filter(g => g.is_featured).slice(0, 3);
    const goalsToShow = featuredGoals.length > 0 ? featuredGoals : goals.slice(0, 3);

    const widgetData: GoalWidgetData = {
      goal1_title: goalsToShow[0]?.title || 'Sin meta',
      goal1_progress: calculateProgress(goalsToShow[0]?.current_value, goalsToShow[0]?.target_value),
      goal2_title: goalsToShow[1]?.title || 'Sin meta',
      goal2_progress: calculateProgress(goalsToShow[1]?.current_value, goalsToShow[1]?.target_value),
      goal3_title: goalsToShow[2]?.title || 'Sin meta',
      goal3_progress: calculateProgress(goalsToShow[2]?.current_value, goalsToShow[2]?.target_value),
    };

    // Llamar al método nativo de Android
    if ((window as any).AndroidWidget) {
      (window as any).AndroidWidget.updateGoalsWidget(JSON.stringify(widgetData));
      console.log('Widget sync: Goals widget updated', widgetData);
    } else {
      console.log('Widget sync: AndroidWidget interface not available');
    }
  } catch (error) {
    console.error('Widget sync error:', error);
  }
};

/**
 * Sincroniza los datos de tareas con el widget de Android
 */
export const syncTasksWidget = async (tasks: Array<{
  title: string;
  completed: boolean | null;
  due_date?: string | null;
}>) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Widget sync: Not running on native platform');
    return;
  }

  try {
    // Filtrar tareas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks
      .filter(t => !t.due_date || t.due_date === today)
      .slice(0, 4);

    const widgetData: TaskWidgetData = {
      task1_text: todayTasks[0]?.title || '',
      task1_completed: todayTasks[0]?.completed || false,
      task2_text: todayTasks[1]?.title || '',
      task2_completed: todayTasks[1]?.completed || false,
      task3_text: todayTasks[2]?.title || '',
      task3_completed: todayTasks[2]?.completed || false,
      task4_text: todayTasks[3]?.title || '',
      task4_completed: todayTasks[3]?.completed || false,
    };

    // Llamar al método nativo de Android
    if ((window as any).AndroidWidget) {
      (window as any).AndroidWidget.updateTasksWidget(JSON.stringify(widgetData));
      console.log('Widget sync: Tasks widget updated', widgetData);
    } else {
      console.log('Widget sync: AndroidWidget interface not available');
    }
  } catch (error) {
    console.error('Widget sync error:', error);
  }
};

/**
 * Calcula el progreso como porcentaje
 */
const calculateProgress = (current: number | null | undefined, target: number | null | undefined): number => {
  if (!current || !target || target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

/**
 * Sincroniza todos los widgets
 */
export const syncAllWidgets = async (
  goals: Array<{ title: string; current_value: number | null; target_value: number | null; is_featured?: boolean | null }>,
  tasks: Array<{ title: string; completed: boolean | null; due_date?: string | null }>
) => {
  await Promise.all([
    syncGoalsWidget(goals),
    syncTasksWidget(tasks)
  ]);
};
