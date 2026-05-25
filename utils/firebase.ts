import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database";
import "firebase/compat/storage";
import { firebaseConfig } from "../constants";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
