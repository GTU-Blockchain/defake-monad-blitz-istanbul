# PRD: Commit-Reveal Voting dApp

**Hackathon:** Monad Blitz Ankara 2025
**Süre:** 6 saat
**Tarih:** 28 Şubat 2025
**Versiyon:** 1.0

---

## 1. Ürün Özeti

On-chain oylamalarda temel sorun şeffaflığın aynı zamanda bir güvenlik açığı oluşturmasıdır — her oy blockchain'e yazılır yazılmaz herkese görünür, bu da front-running ve bandwagon etkilerine kapı açar.

Bu proje, **commit-reveal protokolünü** kullanarak manipülasyona dayanıklı bir oylama sistemi sunar. Kullanıcılar oylarını şifreli (commit) gönderir; deadline sonrası herkesle aynı anda açıklar (reveal). Açıklama aşamasında oylar sayılır ve kazanan belirlenir.

Uygulama **Monad Testnet** üzerinde deploy edilir. Monad'ın 500ms blok süresi ve paralel EVM mimarisi, reveal aşamasındaki yüksek işlem yoğunluğunu sorunsuz karşılar.

---

## 2. Problem Tanımı

### 2.1 Mevcut Durum

Ethereum ve EVM uyumlu zincirlerde yaygın kullanılan basit oylama sözleşmelerinde oylar işlem anında zincire yazılır ve herkesin görmesine açık olur.

### 2.2 Sorunlar

| Sorun | Açıklama | Etki |
|---|---|---|
| Front-running | Kullanıcılar başkalarının oyunu görüp kendi oylarını buna göre değiştirebilir | Organik tercihler bozulur |
| Bandwagon etkisi | Lider seçeneği görmek kalan seçmenleri etkiler | Sonuç manipüle edilebilir |
| Sybil koruması yok | Aynı cüzdan defalarca aynı işlemi yapabilir | Oy bütünlüğü bozulur |

### 2.3 Hedef Durum

Hiçbir kullanıcı reveal aşaması tamamlanana kadar başkasının oyunu göremez. Sonuçlar ancak tüm açıklamalar yapıldıktan sonra belirlenir.

---

## 3. Kullanıcılar

### 3.1 Birincil Kullanıcı: Oy Veren (Voter)

- EVM uyumlu cüzdan sahibi (MetaMask, Rabby vb.)
- Monad Testnet'e bağlanabilir ve test MON token'ına sahiptir
- Bir teklife oy vermek ister, süreç içinde seçiminin gizli kalmasını bekler

### 3.2 İkincil Kullanıcı: Yönetici (Owner)

- Sözleşmeyi deploy eden taraf
- Teklif listesini ve faz sürelerini deploy sırasında belirler
- Deploy sonrası müdahale edemez (immutable kurallar)

---

## 4. Kullanıcı Hikayeleri

```
US-01: Oy verme taahhüdü
  Bir voter olarak,
  Commit aşamasında oyumu şifreleyerek göndermek istiyorum,
  Böylece seçimim reveal aşamasına kadar kimseye görünmez.

US-02: Oyun açıklanması
  Bir voter olarak,
  Reveal aşamasında gizli anahtarımla oyumu açıklamak istiyorum,
  Böylece oyum sayıma dahil edilsin.

US-03: Süre bilgisi
  Bir voter olarak,
  Her fazın ne kadar süresi kaldığını görmek istiyorum,
  Böylece zamanında commit/reveal yapabileyim.

US-04: Sonuçları görme
  Bir voter olarak,
  Oylama bittikten sonra tüm teklif oylarını ve kazananı görmek istiyorum,
  Böylece şeffaf bir sonuç doğrulayabileyim.

US-05: Secret güvenliği
  Bir voter olarak,
  Commit yaptıktan sonra gizli anahtarımın kaybolmayacağına dair uyarı almak istiyorum,
  Böylece reveal aşamasında oy kullanamama riskini bilirim.
```

---

## 5. Fonksiyonel Gereksinimler

### 5.1 Smart Contract

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-01 | Contract deploy edilirken teklif listesi ve faz süreleri parametre olarak alınır | P0 |
| F-02 | Commit aşamasında her adres yalnızca bir kez `commit(hash)` çağırabilir | P0 |
| F-03 | Hash `keccak256(abi.encodePacked(vote, nonce, msg.sender))` formülüyle doğrulanır | P0 |
| F-04 | Reveal işlemi yalnızca commit deadline'ı geçtikten sonra kabul edilir | P0 |
| F-05 | Reveal işlemi reveal deadline'ı geçmeden yapılmalıdır | P0 |
| F-06 | Her adres yalnızca bir kez reveal yapabilir | P0 |
| F-07 | Kazanan, reveal deadline dolunca `getWinner()` ile sorgulanabilir | P0 |
| F-08 | `currentPhase()` COMMIT / REVEAL / ENDED döner | P1 |
| F-09 | `timeLeft()` her iki deadline için kalan saniyeyi döner | P1 |

### 5.2 Frontend

| ID | Gereksinim | Öncelik |
|---|---|---|
| F-10 | Kullanıcı Monad Testnet'e cüzdanını bağlayabilir | P0 |
| F-11 | Aktif faz görsel olarak gösterilir (renk + etiket) | P0 |
| F-12 | Her faz için geri sayım sayacı gösterilir | P0 |
| F-13 | Commit formu: teklif seçimi + commit TX gönderimi | P0 |
| F-14 | Commit sonrası gizli anahtar localStorage'a kaydedilir | P0 |
| F-15 | Reveal formu: stored secret ile otomatik reveal | P0 |
| F-16 | Teklifler ve oy sayıları listelenir | P1 |
| F-17 | Ended fazında kazanan vurgulanır | P1 |
| F-18 | Kullanıcı zaten commit/reveal yaptıysa form disabled edilir | P1 |
| F-19 | Secret bulunamazsa kullanıcıya hata mesajı gösterilir | P1 |

---

## 6. Fonksiyonel Olmayan Gereksinimler

| Kategori | Gereksinim |
|---|---|
| Güvenlik | `msg.sender` hash'e dahil edilerek replay attack önlenir |
| Güvenlik | Double commit ve double reveal contract seviyesinde engellenir |
| Performans | Frontend polling aralığı 5 saniye (Monad 500ms blok süresine uygun) |
| Uyumluluk | Uygulama MetaMask ve WalletConnect destekleyen her cüzdanla çalışır |
| Dayanıklılık | Frontend herhangi bir merkezi backend olmadan yalnızca on-chain state ile çalışır |
| Gizlilik | Kullanıcı nonce'unu yalnızca kendi browser'ı tutar, contract tutmaz |

---

## 7. Kapsam Dışı (Out of Scope)

Aşağıdakiler bu hackathon versiyonuna dahil **değildir**:

- Whitelist / NFT-gated oy hakkı
- Delegasyon (başkası adına oy)
- Çoklu tur oylama
- Email veya sosyal hesap ile secret kurtarma
- Gas sponsorship / Account Abstraction
- Audit veya production güvenlik testi

---

## 8. Teknik Mimari

### 8.1 Commit-Reveal Protokolü

```
COMMIT AŞAMASI:
  nonce  = random 32-byte
  hash   = keccak256(voteIndex || nonce || msg.sender)
  TX     → contract.commit(hash)
  Kayıt  → localStorage: { voteIndex, nonce, hash }

REVEAL AŞAMASI:
  secret = localStorage.getItem("commit_reveal_secret")
  TX     → contract.reveal(secret.voteIndex, secret.nonce)
  Contract: keccak256(voteIndex || nonce || msg.sender) == commits[msg.sender]?
            ✓ → proposals[voteIndex].voteCount++
```

### 8.2 Faz Geçişleri

```
deploy()
  └─→ COMMIT  [0 ... commitDeadline]
        └─→ REVEAL  [commitDeadline ... revealDeadline]
                └─→ ENDED  [revealDeadline ... ∞]
```

### 8.3 Neden Monad?

Commit-reveal protokolünde reveal aşaması, katılımcıların kısa bir window içinde aynı anda işlem göndermesiyle yüksek TX spike'ı yaratır. Monad'ın **paralel EVM execution** ve **500ms blok süresi** bu yoğunluğu ek gecikme olmadan karşılar.

---

## 9. Faz Planı

| Zaman | Görev | Çıktı |
|---|---|---|
| 00:00–00:30 | Proje setup, env, faucet | Çalışan Hardhat + React projesi |
| 00:30–01:30 | Smart contract + testler | Geçen test suite |
| 01:30–02:00 | Deploy + explorer verify | Confirmed contract address |
| 02:00–04:00 | Frontend core (commit, reveal, phase) | Kullanılabilir UI |
| 04:00–05:00 | UI polish, hata durumları, demo testi | Sunum-ready app |
| 05:00–06:00 | Sunum hazırlığı | Pitch + demo script |

---

## 10. Başarı Kriterleri

Aşağıdakilerin tamamı karşılandığında proje tamamlanmış sayılır:

- [ ] Smart contract Monad Testnet'e deploy edilmiş ve explorer'da görünür
- [ ] Commit işlemi gerçekleşiyor, secret localStorage'a kaydediliyor
- [ ] Reveal işlemi başarılı, oy sayısı artıyor
- [ ] Faz geçişleri UI'da doğru yansıyor
- [ ] Kazanan ENDED fazında doğru gösteriliyor
- [ ] En az 2 farklı cüzdan adresiyle uçtan uca akış test edilmiş

---

## 11. Riskler

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| Kullanıcı secret'ı kaybeder | Yüksek | Reveal yapamaz | Commit sonrası belirgin uyarı + localStorage |
| Faucet çalışmıyor | Orta | Deploy/test yapılamaz | Birden fazla faucet URL'i hazırda tut |
| RPC rate limit | Düşük | Frontend yavaşlar | Polling aralığını 5s tut |
| Commit-reveal süresi çok kısa | Orta | Demo sırasında faz geçer | Deploy parametrelerini demo için ayarla (commit: 30dk, reveal: 20dk) |
