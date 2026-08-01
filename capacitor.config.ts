import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livrariaplus.app',
  appName: 'Livraria Plus',
  webDir: 'app-web',
  server: {
    url: 'https://www.livrariaplus.com.br',
    cleartext: false,
  },
};

export default config;
