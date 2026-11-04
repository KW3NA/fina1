import 'dotenv/config';

console.log('DEBUG: Environment variables loaded:');
console.log('HTML2PDFROCKET_API_KEY:', process.env.HTML2PDFROCKET_API_KEY ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLOUD_TRANSLATION_API_KEY:', process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY ? 'SET' : 'NOT SET');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('API_KEY')));

export default ({ config }) => ({
  expo: {
    name: "E-Literacy App",
    slug: "e-literacy-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/logo.jpg",
    splash: {
      image: "./assets/logo.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    // ... any other fields you had
    ...config,
    extra: {
      HTML2PDFROCKET_API_KEY: process.env.HTML2PDFROCKET_API_KEY,
      GOOGLE_CLOUD_TRANSLATION_API_KEY: process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY,
      OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
      // ...other extras
    },
    plugins: [
      "expo-font",
      "expo-sharing",
      "expo-splash-screen",
      "expo-status-bar",
      "expo-web-browser"
    ]
  }
});