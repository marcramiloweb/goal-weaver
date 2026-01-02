import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.propositos2026',
  appName: 'Propósitos 2026',
  webDir: 'dist',
  server: {
    url: 'https://bf00495e-3e31-430d-8cc9-0ee6b4bab0f9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
