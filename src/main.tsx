import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize daily notifications when the app loads
const initNotifications = async () => {
  try {
    const { initializeDailyNotifications, hasNotificationPermission } = await import('@/utils/notifications');
    if (hasNotificationPermission()) {
      initializeDailyNotifications();
    }
  } catch (error) {
    console.log('Notifications not available');
  }
};

// Run after app is mounted
setTimeout(initNotifications, 3000);

createRoot(document.getElementById("root")!).render(<App />);