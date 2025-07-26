import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";
import logger from "../../logger.js";

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, set };
