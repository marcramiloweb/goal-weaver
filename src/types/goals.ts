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
  "La disciplina es el puente entre metas y logros. 🌉",
  "Cree en ti mismo y todo será posible. ✨",
  "El momento perfecto es ahora. ¡Actúa!",
  "Tu futuro yo te agradecerá el esfuerzo de hoy.",
  "Los sueños no funcionan a menos que tú lo hagas. 💫",
  "Cada día es una nueva oportunidad para mejorar.",
  "La constancia supera al talento cuando el talento no es constante.",
  "No te rindas, los comienzos siempre son difíciles. 🚀",
  "Eres más fuerte de lo que crees. 💪",
  "La mejor inversión es en ti mismo.",
  "Enfócate en el progreso, no en la perfección.",
  "Hoy puede ser el día que cambie todo. 🌅",
  "Las pequeñas victorias construyen grandes triunfos.",
  "Tu actitud determina tu dirección. 🧭",
  "Cada experto fue una vez un principiante.",
  "La motivación te pone en marcha, el hábito te mantiene.",
  "Visualiza tu éxito y trabaja para alcanzarlo. 🎯",
  "El fracaso es solo una lección disfrazada.",
  "Conviértete en la persona que quieres ser.",
  "La paciencia es amarga, pero sus frutos son dulces. 🍎",
  "Nunca es tarde para ser lo que podrías haber sido.",
  "Tu única competencia eres tú mismo ayer.",
  "El coraje no es la ausencia de miedo, es actuar a pesar de él. 🦁"
];

// Get a unique quote based on the date (changes daily)
export const getDailyQuote = (): string => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
};
