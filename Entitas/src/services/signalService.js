import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const fetchSignals = async (filterType = 'All') => {
  try {
    const signalsRef = collection(db, 'signals');
    // Sıralamayı ve limitlemeyi client-side yapıyoruz şimdilik
    const q = query(signalsRef, limit(100));
    
    const snapshot = await getDocs(q);
    
    let data = snapshot.docs.map(doc => {
      const rawData = doc.data();
      let normalizedDate = new Date();
      
      if (rawData.ts) {
        if (rawData.ts?.toDate) {
          normalizedDate = rawData.ts.toDate();
        } else if (typeof rawData.ts === 'string') {
          normalizedDate = new Date(rawData.ts);
        } else if (rawData.ts?.$date) {
          normalizedDate = new Date(rawData.ts.$date);
        }
      }

      return {
        _id: doc.id,
        ...rawData,
        ts: normalizedDate.toISOString()
      };
    });

    data.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    // FILTERING LOGIC (UPDATED FOR ENGLISH)
    if (filterType !== 'All') {
      // Eğer model ismine göre filtreleme yapılıyorsa (filterType model adıdır)
      // Ancak "Favorites" filtresi HomeScreen'de ayrıca işleniyor.
      // Sinyal tipine göre filtreleme yapacaksak (Buy/Sell/Hold) dönüşüm gerekebilir.
      // Ancak şimdilik HomeScreen'de sadece Model filtresi kullanıyoruz.
      // Eğer "All" değilse, bunun bir Model ismi olduğunu varsayalım.
      
      // Sinyal filtreleme için ekstra kontrol (Opsiyonel, eğer ileride 'Buy' filtresi eklersek)
      // const signalMap = { 'Buy': 'BUY', 'Sell': 'SELL', 'Hold': 'HOLD' };
      
      // Model Filtrelemesi:
      data = data.filter(item => item.modelName === filterType);
    }

    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
};