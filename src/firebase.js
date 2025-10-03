import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase設定（後で実際の値に置き換えてください）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Realtime Databaseのインスタンスを取得
export const database = getDatabase(app);
