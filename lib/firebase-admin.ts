import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function sendPushNotificationsToDrivers(
  fcmTokens: string[],
  title: string,
  body: string,
): Promise<void> {
  if (fcmTokens.length === 0) return;

  const app = getFirebaseAdminApp();
  const messaging = getMessaging(app);

  // Send to all driver tokens in batches of 500 (FCM limit per multicast)
  const batchSize = 500;
  for (let i = 0; i < fcmTokens.length; i += batchSize) {
    const batch = fcmTokens.slice(i, i + batchSize);
    await messaging.sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
    });
  }
}
