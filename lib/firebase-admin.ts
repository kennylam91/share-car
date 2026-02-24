import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { SupabaseClient } from "@supabase/supabase-js";

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
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

export async function notifyDriversAboutNewRequest(
  supabase: SupabaseClient,
  title = "Có khách tìm xe",
  body = "Có hành khách mới đang tìm xe. Hãy kiểm tra ngay!",
): Promise<void> {
  const { data: driverProfiles } = await supabase
    .from("profiles")
    .select("fcm_token")
    .eq("role", "driver")
    .not("fcm_token", "is", null);

  const tokens: string[] = (driverProfiles ?? [])
    .map((p: any) => p.fcm_token as string)
    .filter(Boolean);

  if (tokens.length > 0) {
    await sendPushNotificationsToDrivers(tokens, title, body);
  }
}
