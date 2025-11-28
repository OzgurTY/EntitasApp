import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const fetchSignals = async (filterType = 'Tümü') => {
  try {
    const signalsRef = collection(db, 'signals');
    // Not: Eğer 'ts' alanı karmaşık bir obje ise ($date gibi), Firestore sıralamasında (orderBy)
    // sorun yaşayabilirsin. Şimdilik sıralamayı client-side (uygulama içinde) yapacağız.
    // Bu yüzden sorgudan 'orderBy'ı geçici olarak kaldırıyorum.
    const q = query(signalsRef, limit(50));
    
    const snapshot = await getDocs(q);
    
    let data = snapshot.docs.map(doc => {
      const rawData = doc.data();
      
      // TARİH NORMALİZASYONU (Önemli Kısım)
      let normalizedDate = new Date(); // Varsayılan: Şu an
      
      if (rawData.ts) {
        if (rawData.ts?.toDate) {
          // 1. Durum: Firestore Timestamp (En iyisi)
          normalizedDate = rawData.ts.toDate();
        } else if (typeof rawData.ts === 'string') {
          // 2. Durum: ISO String (Bizim seeder)
          normalizedDate = new Date(rawData.ts);
        } else if (rawData.ts?.$date) {
          // 3. Durum: Senin attığın format (MongoDB stili)
          normalizedDate = new Date(rawData.ts.$date);
        }
      }

      return {
        _id: doc.id,
        ...rawData,
        ts: normalizedDate.toISOString() // Arayüze her zaman standart string gönderiyoruz
      };
    });

    // Client-side Sıralama (Yeniden eskiye)
    data.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    // Client-side Filtreleme
    if (filterType !== 'Tümü') {
      const signalMap = { 'Al': 'BUY', 'Sat': 'SELL', 'Tut': 'HOLD' };
      const targetSignal = signalMap[filterType];
      
      if (targetSignal) {
        data = data.filter(item => item.signal === targetSignal);
      }
    }

    return data;
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return [];
  }
};