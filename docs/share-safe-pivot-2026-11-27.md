# MC-NovaTools — Ürün Dönüşümü: Share-Safe File Check + İçerik Kapsamı Daraltma

**Tarih:** 2026-11-27
**Dal:** `feat/share-safe-pivot` (taban: `main` @ `6f0409c6`)
**Önceki tur:** [`adsense-content-quality-audit.md`](adsense-content-quality-audit.md) (#285, #286; canlıda)

## 1. Başlangıç durumu ve kök neden

AdSense paneli (2026-11-26 ekran görüntüsü): "Düşük değere sahip içerik", inceleme deneme sınırı aşıldı, yeni istek **3 Ara 2026**'dan itibaren.

#286 teknik sorunları (Türkçe/İngilizce karışımı, kopya URL'ler, boş makaleler, sahte tarih sinyalleri) çözmüş ve canlıya çıkmıştı. Canlı sitemap'in 2026-11-26'daki içeriği kalan nedeni gösteriyor:

| İndekslenen yüzey | Adet | Değerlendirme |
|---|---|---|
| Sertifikalı araçlar | 26 | Çoğu emtia hesaplayıcı (yaş, VKİ, yüzde, birim, Roma rakamı); her biri için binlerce rakip var |
| Blog makaleleri | 30 | **24'ü ABD kişisel finans/sigorta/vergi** (Best Credit Cards 2026, Auto Insurance, NFT Tax…). Site bu konularda uzmanlık ya da araç sunmuyor |
| Blog kategori arşivleri | 5 | 1–24 makale; kapsam daraltılınca 1–2 makaleye düşüyor |

`tools-manifest.json` her araç için `cpc` hedefleri tutuyor; içerik stratejisi yüksek TBM'ye göre kurulmuş. Google'ın "faydalı içerik" ve "ölçekli içerik" ölçütleri ile AdSense'in "özgün ve yüksek kaliteli bilgi, araç veya hizmet" şartı açısından sorun teknik değil, **kimlik ve değer** sorunu.

## 2. Seçilen ürün fırsatı: Share-Safe File Check

Beş aday değerlendirildi (kaynaklar araştırma notlarında; arama hacmi verisine erişilemedi, nitel göstergeler kullanıldı):

| Aday | Talep kanıtı | Rekabet | Karar |
|---|---|---|---|
| **Dosya paylaşmadan önce gizli veri kontrolü** | INRIA: 75 kurumun 39.664 PDF'inin büyük çoğunluğunda yazar/OS/yol sızıntısı; 2025 Epstein PDF karartma hataları; Okta 2023 HAR olayı; ExifCleaner ~2.9k, Dangerzone ~5.9k GitHub yıldızı | Parçalı; Adobe ve iLovePDF dosyayı yüklüyor; "doğrula → temizle → yeniden doğrula" yapan ve PDF revizyonları ile Excel gizli sayfalarını kapsayan bir araç bulunamadı | **Seçildi** |
| Supabase/Firebase güvenlik ön kontrolü (RLSProof) | UpGuard: 16.000+ hatalı yapılandırılmış Supabase DB | Supabase'in kendi Security Advisor'ı + ücretli tarayıcılar | İkincil (geliştirici/ücretli katman) |
| AI-search/GEO hazırlık denetleyici | Hype; Google llms.txt'yi kullanmıyor | Doymuş | Elendi |
| Tarayıcı-içi PDF paketi | Yüksek hacim | iLovePDF/Smallpdf/Adobe | Elendi (yine ret riski) |
| HAR/log temizleyici | Okta olayı | Cloudflare'in ücretsiz aracı | #1'in içine sekme olarak eklendi |

**Neden geri gelinir:** Sözleşme, CV, fotoğraf, destek talebi logu — her gönderimden önce tekrar eden bir kontrol. Mevcut PDF Redact aracıyla doğal bir ikili oluşturuyor.

## 3. Uygulanan değişiklikler

### 3.1 Yeni araç `/tools/security/share-safe-check/`
- `share-safe-core.mjs` (DOM'suz, Node'da test edilir):
  - **JPEG/PNG/WebP:** GPS, cihaz/lens seri no, kişi adları, cihaz/yazılım, zaman, gömülü küçük resim, XMP geçmişi, IPTC, PNG metin alanları. Temizlik **kayıpsız** (yeniden sıkıştırma yok); ICC profili ve döndürülmüş fotoğrafın yönü korunuyor.
  - **PDF:** artımlı kayıtlar (eski sürümler), Info sözlüğü, XMP, yorum/işaretlemeler, ekli dosyalar, JavaScript, form alanları. Temizlik: tek revizyon olarak yeniden yazım + **erişilemeyen nesnelerin atılması** (eski sürüm kalıntıları; testte `SECRET-OLD-TEXT` kalıntısının kaybolduğu doğrulandı).
  - **DOCX/XLSX/PPTX:** yazar/son düzenleyen, şirket/yönetici, düzenleme süresi, izlenen değişiklikler (silinen metinle birlikte), yorumlar, gizli metin, gizli/"çok gizli" sayfalar, gizli satır/sütun, dış bağlantılar, pivot önbelleği, konuşmacı notları, gizli slaytlar, gömülü nesneler, içerideki fotoğraflarda GPS. Temizlik yalnız kişi/kurum/zaman özellikleri; içerik değiştiren öğeler **raporlanıyor, sessizce silinmiyor**.
  - **HAR/JSON/log/.env:** Authorization/Cookie/Set-Cookie, JWT, Bearer, URL'deki token'lar, özel anahtarlar, AWS/GitHub/Stripe/Slack/Google anahtarları; değerler `[REDACTED]` ile değiştiriliyor.
- `share-safe-app.mjs`: tarama → temiz kopya → **temiz kopyanın yeniden taranması**; yalnız yeniden taramanın doğruladığı şey "kaldırıldı" diye gösteriliyor. Dosyadan gelen tüm metin `textContent` ile basılıyor. Ağ isteği yok (yalnız kullanıcı tıklarsa OSM harita linki, açıkça belirtiliyor).
- `index.html`: kaynaklı özgün içerik, dosya türü bazında kapsam tablosu, bilinen sınırlamalar, gizlilik, SSS.
- Kayıt: `meta.json`, `tool-certification.json` kaydı, güvenlik kategori kartı + görev adımı, `public/tool-surface.mjs`, `package.json` test zinciri, `tests/share-safe-check.mjs`.

### 3.2 Blog kapsamı
- Yeni `src/data/blog-editorial-scope.js`: 24 kapsam dışı makale (ABD finans/sigorta/vergi + bulut fiyat karşılaştırması). `audit-blog-originality.mjs` bunları `UNPUBLISHED_OUT_OF_SCOPE` yapıyor; `--check` modu yayımlanırlarsa hata veriyor. Silme yok; listeden çıkarılan slug yeniden yayımlanır.
- Yayında kalan 6 makale: tarayıcı araçları ve gizlilik, Acrobat'sız PDF düzenleme, lazy loading, PDF finans kayıtları, Rule of 72, JWT.
- 5 blog kategori arşivi kaldırıldı (1–2 makalelik ince sayfa olacaktı); `/blog/categories/*` → `/blog/` 301; sitemap'ten çıkarıldı.
- Kategori hub'larındaki aynı makaleye giden **24 yinelenen "Related guides" kartı** tekilleştirildi.
- Geri çekilen makalelere giden 89 iç link mevcut `repair-withheld-blog-links.mjs` ile var olan sayfalara yönlendirildi.
- `audit-public-routes.mjs`: "en az 20 blog rotası" sabiti, yayın kaydındaki makale sayısına bağlandı.

### 3.3 Yapılandırılmış veri dürüstlüğü
`src/components/Analytics.mjs`: `sameAs` içinde 404 dönen `github.com/mc-novatools` ve `x.com/mcnovatools` ile doğrulanamayan LinkedIn kaldırıldı; Person şemasından "LPC" unvanı ve uydurma `alumniOf` çıkarıldı. Yalnız var olan `github.com/metehancetinnn(/NovaTools)` kaldı.

## 4. GitHub kullanıcı adı geçişi

- Hesap `psycholog1sts` → `metehancetinnn` olarak yeniden adlandırılmış (`gh api user` = `metehancetinnn`; eski URL GitHub yönlendirmesiyle çalışıyor). Depo herkese açık.
- Yerel `origin` → `git@github.com:metehancetinnn/NovaTools.git` (ls-remote doğrulandı).
- Güncellenen: `package.json` repository, `schema-generator.mjs` sameAs, 5 makale footer'ı, `AGENTS.md`, `PLANS.md`, `docs/revenue/*`, AdSense denetim belgesi.
- Bilerek değiştirilmeyen: tarihli denetim kayıtları (`research-implementation-ledger.md`, `site-audit-2026-08-04.md`, RLSProof tasarım belgesi). Bunlar o tarihteki durumu anlatıyor ve eski URL'ler yönlendiriliyor.
- Workflow'larda kullanıcı adı yok; Actions etkilenmez.
- **Sizin yapmanız gereken (hesap ayarı):** Depo "homepage" alanı hâlâ `https://novatools-mc.vercel.app` gösteriyor; canlı alan adı `mc-novatools.com`. Webhook listesi bu oturumda okunamadı (yetki kapsamı); Cloudflare Pages GitHub entegrasyonunun yeni adı gördüğünü panelden doğrulayın.

## 5. Yasal ve gelir modeli bulguları (özet; mali müşavir teyidi gerekir)

**Doğrulanmış:**
- GVK mükerrer **20/B**, 1/1/2024'ten beri "internet ve benzeri elektronik ortamlar" üzerinden içerik/hizmet sunan gerçek kişileri kapsıyor. Şartları: bu gelire özel Türkiye'deki bir banka hesabı, %15 nihai stopaj (banka keser), 1 ay içinde vergi dairesine bildirim. 2026 üst sınırı 5.300.000 TL; aşılırsa ya da hesap dışı tahsilat olursa istisna kaybediliyor. KDV istisnası (KDVK 17/4-a) var.
- Stripe Türkiye'yi desteklemiyor. **Lemon Squeezy yeni kayıt almıyor ve 31 Mart 2027'de kapanıyor.** Paddle (merchant of record) Türkiye'yi engelli ülkeler listesine koymuyor.
- KVKK uygulanır (VERBİS muafiyeti olabilir, aydınlatma yükümlülüğü sürer). AB ziyaretçilerini reklam çerezleriyle izlemek GDPR 3(2)(b)'yi tetikler. EEA/UK/CH kişiselleştirilmiş reklam için Google sertifikalı, TCF v2.3 uyumlu CMP zorunlu.

**Belirsiz:**
- Araç sitesinin AdSense gelirinin 20/B kapsamında olduğu: 2026 tarihli bir özelge kişisel web sitesi üzerinden ürün tanıtımını kabul ediyor, ama araç sitesi + AdSense için doğrudan özelge bulunamadı.
- 20/B'nin Bağ-Kur'u tetikleyip tetiklemediği.
- Abonelik gelirinin ("veri işleme ve geliştirme") kapsam içinde olup olmadığı.
- Paddle'ın vergi kaydı olmayan bir bireyi onaylayıp onaylamayacağı.
- 2026 TCMB genelgesine göre hizmet dövizinde bozdurma yükümlülüğü.

**En az yükümlülüklü yasal yol:** (1) Vergi dairesinden 20/B özelgesi isteyin. (2) Uygunsa istisna belgesi + özel banka hesabı, sınırın altında kalın. (3) Abonelik büyürse şahıs şirketi (yaş uygunsa genç girişimci istisnası, GVK mük. 20) + Paddle. Her durumda: sertifikalı CMP, KVKK/GDPR aydınlatma, açık kaynak lisans bildirimleri.

Hiçbir gelir "vergisiz" kabul edilmemelidir; yukarıdakiler hukuki görüş değildir.

## 6. Komutlar ve sonuçlar (Windows, 2026-11-27)

| Komut | Sonuç |
|---|---|
| `npm run lint` | ✅ 0 hata (5 uyarı önceden vardı) |
| `npm test` (tam zincir, yeni test dahil) | ✅ geçti; legacy-core 78/78 |
| `node tests/share-safe-check.mjs` | ✅ |
| `npm run build` | ⚠️ Son adım `build:csp` hariç hepsi geçti. Fark tek bir inline script hash'i (`ma4cWi2…` yerine `jNGBFK2…`); nedeni `core.autocrlf=true` ile CRLF checkout. Değişiklik eklemiyor, değiştiriyor. CI (Linux) yetkili kaynak |
| `audit:public-routes`, `lint:site-links` (59 URL), `lint:blog-outlines`, `audit:adsense`, `lint:rss`, `lint:performance-budget`, `lint:media-dimensions`, `lint:blog-seed`, `lint:blog-images`, `audit:claim-candidates`, `audit:client-env`, `audit:algorithm-resilience`, `lint:critical-css`, `lint:i18n`, `validate:structured-data` | ✅ |
| Tarayıcı (build önizlemesi) | ✅ HAR, JPEG+GPS, PDF (2 revizyon + kalıntı nesne + yorum), DOCX dosyaları uçtan uca tarandı, temizlendi ve yeniden doğrulandı. Temiz JPEG çözülüyor (64×48) ve ICC profili korunuyor. 375 px'te yatay taşma yok. Dosya işlenirken üçüncü taraf istek yok |
| Playwright e2e, Lighthouse | Çalıştırılmadı (yerelde Playwright tarayıcısı yok); PR CI'ında çalışacak |

## 7. Kalan riskler

1. **Ana sayfa mobil yükseklik testi** (`tests/e2e/accessibility.spec.mjs`): Yeni sertifikalı kart ana sayfayı uzatabilir. Önceki araç eklemelerinde sınır CI ölçümüne göre artırılmıştı; CI sonucu izlenmeli.
2. **Ret riski sıfırlanmadı.** İndekslenen yüzeyin büyük kısmı hâlâ emtia hesaplayıcılardan oluşuyor. Yeni araç ve kapsam daraltması değer sinyalini güçlendiriyor ama onay garantisi yok.
3. **İnceleme kotası:** Deneme sınırı aşılmış durumda; 3 Aralık'tan önce başvuru yapılamaz. Erken ve hazırlıksız başvuru bir hakkı daha harcar.
4. Kaldırılan 24 makale URL'si 404 dönecek (iç linkler onarıldı). Bu, Search Console'da bir süre "bulunamadı" olarak görünür.
5. HEIC ve eski Office biçimleri desteklenmiyor; sayfada açıkça yazıyor.
