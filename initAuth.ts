import { init } from "next-firebase-auth";
import { firebaseConfig } from "./constants";

const initAuth = () => {
  init({
    authPageURL: "/auth",
    appPageURL: "/",
    loginAPIEndpoint: "/api/login", // required
    logoutAPIEndpoint: "/api/logout", // required
    // firebaseAuthEmulatorHost: "localhost:9099",
    // Required in most cases.
    firebaseAdminInitConfig: {
      credential: {
        projectId: firebaseConfig.projectId,
        clientEmail:
          "firebase-adminsdk-am4ez@task-pdf-writer.iam.gserviceaccount.com",
        // The private key must not be accesssible on the client side.
        privateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
      },
      databaseURL: "https://task-pdf-writer.firebaseio.com",
    },
    firebaseClientInitConfig: firebaseConfig,
    cookies: {
      name: "ExampleApp", // required
      // Keys are required unless you set `signed` to `false`.
      // The keys cannot be accessible on the client side.
      keys: [
        process.env.COOKIE_SECRET_CURRENT,
        process.env.COOKIE_SECRET_PREVIOUS,
      ],
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
      overwrite: true,
      path: "/",
      sameSite: "strict",
      secure: true, // set this to false in local (non-HTTPS) development
      signed: true,
    },
  });
};

export default initAuth;
