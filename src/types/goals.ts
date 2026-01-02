export type GoalCategory = 
  | 'salud' 
  | 'finanzas' 
  | 'aprendizaje' 
  | 'relaciones' 
  | 'carrera' 
  | 'creatividad' 
  | 'bienestar' 
  | 'ejercicio'
  | 'otro';

export type GoalType = 'checklist' | 'habit' | 'quantitative';

export type GoalStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type GoalPriority = 'low' | 'medium' | 'high';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  type: GoalType;
  start_date: string;
  target_date?: string;
  target_value: number;
  current_value: number;
  status: GoalStatus;
  why?: string;
  icon: string;
  color: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  order_index: number;
  created_at: string;
}

export interface CheckIn {
  id: string;
  goal_id: string;
  user_id: string;
  date: string;
  value: number;
  note?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  type: string;
  name: string;
  description?: string;
  icon: string;
  earned_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in_date?: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name?: string;
  avatar_url?: string;
  timezone: string;
  notification_mode: 'soft' | 'normal' | 'intense';
  created_at: string;
  updated_at: string;
}

export const CATEGORY_CONFIG: Record<GoalCategory, { label: string; icon: string; color: string }> = {
  salud: { label: 'Salud', icon: '💪', color: 'category-salud' },
  finanzas: { label: 'Finanzas', icon: '💰', color: 'category-finanzas' },
  aprendizaje: { label: 'Aprendizaje', icon: '📚', color: 'category-aprendizaje' },
  relaciones: { label: 'Relaciones', icon: '❤️', color: 'category-relaciones' },
  carrera: { label: 'Carrera', icon: '🚀', color: 'category-carrera' },
  creatividad: { label: 'Creatividad', icon: '🎨', color: 'category-creatividad' },
  bienestar: { label: 'Bienestar', icon: '🧘', color: 'category-bienestar' },
  ejercicio: { label: 'Ejercicio', icon: '🏃', color: 'category-ejercicio' },
  otro: { label: 'Otro', icon: '✨', color: 'category-otro' },
};

export const GOAL_TYPE_CONFIG: Record<GoalType, { label: string; description: string; icon: string }> = {
  checklist: { 
    label: 'Lista de tareas', 
    description: 'Completa sub-objetivos paso a paso',
    icon: '✅' 
  },
  habit: { 
    label: 'Hábito', 
    description: 'Repetición diaria o semanal',
    icon: '🔄' 
  },
  quantitative: { 
    label: 'Cuantitativa', 
    description: 'Alcanza un número objetivo',
    icon: '📊' 
  },
};

export const MOTIVATIONAL_QUOTES = [
  "Cada paso cuenta. ¡Sigue adelante! 🌟",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No tienes que ser perfecto, solo tienes que empezar.",
  "Tu único límite eres tú mismo. ¡Supéralo!",
  "Los grandes logros requieren tiempo. Sé paciente contigo.",
  "Hoy es un buen día para avanzar hacia tus metas.",
  "Recuerda por qué empezaste. 💪",
  "Pequeños progresos siguen siendo progresos.",
];
