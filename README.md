# 🎁 Stellar-Soroban Müşteri Sadakat Programı DApp

Bu proje **Stellar ve Soroban** kullanılarak oluşturulmuş bir müşteri sadakat programı dApp'idir. Modern, basit ve güçlü bir çözüm sunar.

## 🚀 Özellikler

- **Next.js** tabanlı modern frontend
- **Rust / Soroban** akıllı sözleşmeleri
- 🔑 **Freighter cüzdan** bağlantısı
- ⭐ Alışveriş yaparak puan kazanma
- 🎁 Puanları ödüllerle değiştirme
- 💰 Puan bakiyesi takibi
- 🔥 Kullanılan puanları yakma (burn) sistemi
- 🎨 Şık ve sezgisel kullanıcı arayüzü (Tailwind CSS ile)

## 📂 Proje Yapısı

```bash
/contract          # Rust/Soroban akıllı sözleşme kodları
/app              # Next.js uygulaması
/components       # React bileşenleri
/tailwind.config.js # Tailwind konfigürasyonu
/README.md        # Bu döküman!
```

## 🛠️ Kurulum

1️⃣ **Repo'yu klonlayın:**
```bash
git clone https://github.com/<kervanaysegul>/<Customer-Loyalty-Program>.git
cd <repo_adi>
```

2️⃣ **Bağımlılıkları yükleyin:**
```bash
npm install
```

3️⃣ **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

4️⃣ **Akıllı sözleşmeyi derlemek için:**
```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

## ⚙️ Kullanım

- Ana sayfada cüzdanınızı bağlayın
- Alışveriş simülasyonu yaparak puan kazanın
- Puan bakiyenizi kontrol edin
- Puanlarınızı ödüllerle değiştirin
- Her işlem Stellar ağında kayıt altına alınır!

## 🎯 Ana Fonksiyonlar

### Müşteri İşlemleri:
- **Puan Kazanma**: Her alışverişte otomatik puan kazanma
- **Bakiye Görüntüleme**: Toplam puan bakiyesini görüntüleme
- **Puan Kullanma**: Ödüller için puan harcama
- **Puan Transferi**: Diğer kullanıcılara puan gönderme

### Admin İşlemleri:
- **Puan Üretimi**: Yeni puan tokenları oluşturma
- **Ödül Tanımlama**: Yeni ödül kategorileri ekleme
- **İstatistik Görüntüleme**: Program performansını izleme

## 📸 Ekran Görüntüleri

![Uygulama ekran görüntüsü](./screenshots/loyalty-app.png)

## 🔧 Teknik Detaylar

### Kullanılan Soroban Fonksiyonları:
- `mint`: Puan tokenları oluşturma
- `transfer`: Puan transferi
- `balance`: Bakiye sorgulama
- `burn`: Kullanılan puanları yakma

### Frontend Teknolojileri:
- Next.js 14
- TypeScript
- Tailwind CSS
- Freighter API
- Stellar SDK

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

✨ **Katkıda bulunmak istiyorsanız:**  
- PR'larınızı bekliyoruz!  
- Yeni özellik önerileri ve hata raporları açabilirsiniz.

---

🔗 **Bağlantılar:**
- 🌐 [Stellar Geliştirici Dokümantasyonu](https://developers.stellar.org/docs/)
- 🔧 [Soroban Dokümantasyonu](https://soroban.stellar.org/docs)
- 💼 [Freighter Cüzdan](https://freighter.app/)

---

**Not:** Projeyi çalıştırmadan önce `contract` klasöründeki Soroban akıllı sözleşme derleme işlemini tamamladığınızdan emin olun!

## 🎯 Yol Haritası

- [ ] Çoklu ödül kategorileri
- [ ] NFT ödül sistemi
- [ ] Mobil uygulama desteği
- [ ] Toplu puan transferi
- [ ] Analitik dashboard

