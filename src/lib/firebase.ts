import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyB7HvY9-pQo1CNlEsZ9XWDbtqcyAihVeSQ",
  authDomain: "chatroom-111000178.firebaseapp.com",
  projectId: "chatroom-111000178",
  storageBucket: "chatroom-111000178.appspot.com",
  messagingSenderId: "932418604282",
  appId: "1:932418604282:web:6f42c536ddf85231260d43",
  databaseURL: "https://chatroom-111000178-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export const storage = getStorage(app)