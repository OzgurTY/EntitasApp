import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// 1. Sinyalleri Çek (Ana Sayfa İçin)
export const fetchSignals = async (selectedModel = 'All') => {
  try {
    const signalsRef = collection(db, 'signals');
    // Son 100 veriyi çekip istemci tarafında sıralamak/filtrelemek
    // bazen karmaşık indeks hatalarından kaçınmak için daha pratiktir.
    const q = query(signalsRef, limit(100));
    const snapshot = await getDocs(q);
    
    let data = snapshot.docs.map(doc => {
      const raw = doc.data();
      // Tarih düzeltme (Timestamp veya String desteği)
      let ts = new Date();
      if (raw.ts?.toDate) ts = raw.ts.toDate();
      else if (typeof raw.ts === 'string') ts = new Date(raw.ts);
      
      return { ...raw, _id: doc.id, ts: ts.toISOString() };
    });

    // Tarihe göre yeniden eskiye sırala
    data.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    // Model Filtrelemesi
    if (selectedModel !== 'All') {
      data = data.filter(item => item.modelName === selectedModel);
    }

    return data;
  } catch (error) {
    console.error("fetchSignals Error:", error);
    return [];
  }
};

// 2. Model İstatistiklerini Çek (Performans Ekranı ve Kartlar İçin)
export const fetchModelStats = async () => {
  try {
    const statsRef = collection(db, 'model_performance');
    const snapshot = await getDocs(statsRef);
    
    const stats = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      // Model ismini anahtar olarak kullanıyoruz ki erişim hızlı olsun
      if (data.model_name) {
        stats[data.model_name] = data;
      }
    });
    return stats;
  } catch (error) {
    console.error("fetchModelStats Error:", error);
    return {};
  }
};

// 3. Varlık Geçmişini Çek (Detay Ekranı Grafiği İçin)
export const fetchAssetHistory = async (symbol) => {
  try {
    const signalsRef = collection(db, 'signals');
    // Sadece o sembole ait, eskiden yeniye sıralı son 50 veriyi getir
    const q = query(
      signalsRef, 
      where('symbol', '==', symbol),
      orderBy('ts', 'asc'), 
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const raw = doc.data();
      let ts = new Date();
      if (raw.ts?.toDate) ts = raw.ts.toDate();
      else if (typeof raw.ts === 'string') ts = new Date(raw.ts);
      
      return { ...raw, _id: doc.id, ts: ts.toISOString() };
    });
  } catch (error) {
    console.error("fetchAssetHistory Error:", error);
    // Hata olursa (örn: indeks yoksa) boş dizi dön
    return [];
  }
};