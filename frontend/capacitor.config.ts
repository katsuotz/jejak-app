import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jejak.app',
  appName: 'Jejak',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
