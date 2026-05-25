import * as admin from "firebase-admin";
import { firebaseConfig } from "../constants";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseConfig.projectId,
      clientEmail:
        "firebase-adminsdk-am4ez@task-pdf-writer.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
        : "",
    }),
    databaseURL: firebaseConfig.databaseURL,
  });
}

export default admin;
