import admin from "firebase-admin";
import type { Group, User } from "./types";

const confFile =
  process.env.NODE_ENV === "production"
    ? "/etc/conf/firebase.json"
    : "firebase.json";

export const makeDbService = async () => {
  const key = await Bun.file(confFile).json();

  const firebaseConfig = {
    credential: admin.credential.cert(key),
  };
  const app = admin.initializeApp(firebaseConfig);
  const db = app.firestore();
  const userCollection = db.collection("users");
  const groupCollection = db.collection("groups");

  return {
    async addUser(data: User) {
      const userRef = userCollection.doc(data.id.toString());
      try {
        userRef.set(data, { merge: true });
      } catch (error) {
        console.log("DB error", error);
      }
    },

    async addGroup(data: Group) {
      const groupRef = groupCollection.doc(data.id.toString());
      try {
        groupRef.set(data, { merge: true });
      } catch (error) {
        console.log("DB error", error);
      }
    },
  };
};
