import { getDailyQuote, MOTIVATIONAL_QUOTES } from '@/types/goals';

// Check if notifications are supported
export const notificationsSupported = (): boolean => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!notificationsSupported()) return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Check if notification permission is granted
export const hasNotificationPermission = (): boolean => {
  if (!notificationsSupported()) return false;
  return Notification.permission === 'granted';
};

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!hasNotificationPermission()) return;
  
  new Notification(title, {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    ...options,
  });
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

// Initialize daily notification system
export const initializeDailyNotifications = async (): Promise<void> => {
  if (!notificationsSupported()) return;
  if (!hasNotificationPermission()) return;
  
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
    // Mark as enabled and show immediate notification
    markNotificationShown();
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