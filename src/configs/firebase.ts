import admin, { ServiceAccount } from "firebase-admin";

export const getFirebaseAppOptions = async (): Promise<admin.AppOptions> => {
  const serviceAccount = await import(
    `../../go-plug-firebase-credentials.json`,
    {
      assert: {
        type: "json",
      },
    }
  );
  return {
    credential: admin.credential.cert(serviceAccount.default as ServiceAccount),
  };
};

export const initializeFirebaseAdmin = async (): Promise<void> => {
  const firebaseAppOptions = await getFirebaseAppOptions();
  admin.initializeApp(firebaseAppOptions);
};

export const firebaseMessaging = () => admin.messaging();
export const firebaseAuth = () => admin.auth();
