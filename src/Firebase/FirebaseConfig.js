import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCePBUfJ0jJEpxAsI0fOP9Rh6dxysU8hZ4',
  authDomain: 'food-delivery-bbe43.firebaseapp.com',
  projectId: 'food-delivery-bbe43',
  storageBucket: 'food-delivery-bbe43.appspot.com',
  messagingSenderId: '924921587897',
  appId: '1:924921587897:web:84a494f19310fd20c01368',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Kiểm tra kết nối Firebase Auth
const db = getFirestore(app);

export { auth, db };
