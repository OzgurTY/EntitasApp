import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const fetchSignals = async () => {
  try {
    const signalsRef = collection(db, 'signals');
    const q = query(signalsRef, orderBy('ts', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};