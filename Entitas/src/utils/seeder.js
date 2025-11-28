import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { SIGNALS } from '../constants/mockData';

export const uploadMockData = async () => {
  try {
    console.log("Veri yükleme başlıyor...");
    const batch = writeBatch(db); // Toplu işlem başlat

    SIGNALS.forEach((signal) => {
      // 'signals' koleksiyonunda yeni bir referans oluştur
      const docRef = doc(collection(db, "signals"));
      
      // Mock data'daki _id'yi çıkarıp kalanını alıyoruz (Firestore kendi ID'sini verecek)
      // eslint-disable-next-line no-unused-vars
      const { _id, ...dataToUpload } = signal;

      // Batch'e ekle
      batch.set(docRef, {
        ...dataToUpload,
        // İstersen test ederken tarihleri "şimdi" olarak güncelle:
        // ts: new Date().toISOString() 
      });
    });

    // İşlemi onayla ve gönder
    await batch.commit();
    
    console.log("✅ Tüm veriler başarıyla yüklendi!");
    alert("Başarılı! Veriler Firestore'a yüklendi.");
    return true;
  } catch (error) {
    console.error("❌ Veri yükleme hatası:", error);
    alert("Hata: " + error.message);
    return false;
  }
};