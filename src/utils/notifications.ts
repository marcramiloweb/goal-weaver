import { getDailyQuote, MOTIVATIONAL_QUOTES } from '@/types/goals';

// Check if notifications are supported
export const notificationsSupported = (): boolean => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!notificationsSupported()) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check if notification permission is granted
export const hasNotificationPermission = (): boolean => {
  if (!notificationsSupported()) return false;
  return Notification.permission === 'granted';
};

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!hasNotificationPermission()) return;
  
  try {
    // Try to use service worker notifications if available (for PWA)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          ...options,
        });
      });
    } else {
      // Fallback to regular notifications
      new Notification(title, {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        ...options,
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Show daily motivational notification
export const showDailyMotivationalNotification = (): void => {
  const quote = getDailyQuote();
  showNotification('¡Buenos días! 🌟', {
    body: quote,
    tag: 'daily-motivation',
  });
};

// Get a random motivational quote (different from daily)
export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex];
};

// Schedule daily notification (simplified - uses localStorage to track)
const LAST_NOTIFICATION_KEY = 'lastMotivationalNotification';
const NOTIFICATION_ENABLED_KEY = 'notificationsEnabled';

export const shouldShowDailyNotification = (): boolean => {
  const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY);
  if (!lastNotification) return true;
  
  const lastDate = new Date(lastNotification);
  const today = new Date();
  
  // Check if it's a new day
  return lastDate.toDateString() !== today.toDateString();
};

export const markNotificationShown = (): void => {
  localStorage.setItem(LAST_NOTIFICATION_KEY, new Date().toISOString());
};

export const setNotificationsEnabled = (enabled: boolean): void => {
  localStorage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled));
};

export const areNotificationsEnabled = (): boolean => {
  return localStorage.getItem(NOTIFICATION_ENABLED_KEY) !== 'false';
};

// Initialize daily notification system
export const initializeDailyNotifications = async (): Promise<void> => {
  if (!notificationsSupported()) return;
  if (!hasNotificationPermission()) return;
  if (!areNotificationsEnabled()) return;
  
  // Check if we should show today's notification
  if (shouldShowDailyNotification()) {
    // Show notification after a short delay
    setTimeout(() => {
      showDailyMotivationalNotification();
      markNotificationShown();
    }, 2000);
  }
};

// Request and enable notifications with user feedback
export const enableNotifications = async (): Promise<{ 
  success: boolean; 
  message: string;
}> => {
  if (!notificationsSupported()) {
    return { 
      success: false, 
      message: 'Tu navegador no soporta notificaciones' 
    };
  }
  
  const granted = await requestNotificationPermission();
  
  if (granted) {
    setNotificationsEnabled(true);
    markNotificationShown();
    
    // Show immediate notification
    showNotification('¡Notificaciones activadas! 🔔', {
      body: getDailyQuote(),
      tag: 'notification-enabled',
    });
    
    return { 
      success: true, 
      message: 'Recibirás frases motivacionales cada día' 
    };
  }
  
  return { 
    success: false, 
    message: 'No se pudieron activar las notificaciones. Por favor, permite las notificaciones en la configuración de tu navegador.' 
  };
};

// Disable notifications
export const disableNotifications = (): void => {
  setNotificationsEnabled(false);
};

// Schedule a notification for a specific time (for goal reminders)
export const scheduleGoalReminder = (
  title: string, 
  body: string, 
  delayMs: number
): number => {
  if (!hasNotificationPermission()) return 0;
  
  return window.setTimeout(() => {
    showNotification(title, {
      body,
      tag: 'goal-reminder',
      requireInteraction: true,
    });
  }, delayMs);
};

// Clear a scheduled reminder
export const clearScheduledReminder = (timerId: number): void => {
  window.clearTimeout(timerId);
};