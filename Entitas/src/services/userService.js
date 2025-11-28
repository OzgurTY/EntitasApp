import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Kullanıcının favorilerini getir
export const getFavorites = async (userId) => {
  if (!userId) return [];
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().favorites || [];
    }
    return [];
  } catch (error) {
    console.error("Favoriler çekilemedi:", error);
    return [];
  }
};

// Favoriye Ekle / Çıkar
export const toggleFavorite = async (userId, symbol) => {
  if (!userId) return false;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    let newStatus = false;

    if (!userSnap.exists()) {
      await setDoc(userRef, { favorites: [symbol] });
      newStatus = true;
    } else {
      const favorites = userSnap.data().favorites || [];
      if (favorites.includes(symbol)) {
        await updateDoc(userRef, {
          favorites: arrayRemove(symbol)
        });
        newStatus = false;
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(symbol)
        });
        newStatus = true;
      }
    }
    return newStatus;
  } catch (error) {
    console.error("Favori işlemi hatası:", error);
    return false;
  }
};