import { NextResponse } from "next/server";

// This route serves the Firebase Messaging service worker with environment
// variables injected, since Next.js cannot substitute env vars in static files
// under /public.
export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const swContent = `
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'Yêu cầu xe mới';
  const notificationOptions = {
    body: payload.notification?.body || 'Có yêu cầu xe mới từ hành khách.',
    icon: '/icon-192x192.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/",
    },
  });
}
