# MC-NovaTools: Hukuki ve Vergisel Fizibilite Özeti

> **Bu belge hukuki veya mali müşavirlik tavsiyesi değildir.** Kamuya açık kaynaklardan
> 27 Kasım 2026 tarihinde yapılmış bir ön araştırmadır. Herhangi bir başvuru, hesap açma
> veya gelir tahsilatından önce bir mali müşavir (SMMM/YMM) ile görüşülmeli ve gerekirse
> Gelir İdaresi'nden yazılı **özelge** alınmalıdır. Satır bazlı kaynaklar:
> `docs/research/legal-risk-matrix.csv` (LEGAL-01..28).

Durum: Türkiye'de yerleşik, şirketi olmayan tek bir gerçek kişi; tamamen tarayıcıda çalışan,
üyelik ve sunucu tarafı işleme içermeyen bir araç sitesi (mc-novatools.com).

## 1. Doğrulanmış bilgiler (birincil veya resmî kaynak)

- **GVK mükerrer 20/B (1/1/2024'ten beri yürürlükteki metin):** İnternet ve benzeri
  elektronik ortamlarda metin, görüntü, ses, video gibi içerik paylaşanların kazançları ile
  bu ortamlarda verilen kurs, eğitim, "veri işleme ve geliştirme", ürün tanıtımı gibi
  hizmetlerden elde edilen kazançlar gelir vergisinden müstesnadır. Şartlar: Türkiye'de
  kurulu bir bankada hesap, ilgili **tüm** hasılatın **münhasıran** bu hesaptan tahsili;
  banka her aktarımda %15 tevkifat yapar. Şart ihlali: vergi + vergi ziyaı cezası + gecikme
  faizi. (LEGAL-01)
- **2026 sınırı 5.300.000 TL** (GVK 103. madde 4. gelir dilimi; 332 Seri No.lu Tebliğ,
  RG 31/12/2025). Aşılırsa o yıl istisna kaybedilir ve faaliyete ait tüm kazanç beyan
  edilir. (LEGAL-02)
- **Usul:** Vergi dairesinden istisna belgesi (elden, posta veya Dijital Vergi Dairesi);
  mükellefiyeti olmayan kişi için önce mükellefiyet tesis edilir. Hesap açılışından (veya
  belgenin mevcut hesap için bankaya ibrazından) itibaren **1 ay içinde** banka adı, şube
  ve IBAN vergi dairesine yazılı bildirilir (318/325 Seri No.lu Tebliğ). (LEGAL-03)
- **KDV:** KDV Kanunu 17/4-a, 20/B kapsamında vergilendirilen kazançlara konu teslim ve
  hizmetleri KDV'den istisna eder. (LEGAL-06)
- **Tebliğ kapsamı:** Reklam, sponsorluk, bağış/hediye/bahşiş ve ücretli abonelik gelirleri
  kapsamda sayılıyor; kendi internet sitesinde eğitim videosu yayınlayıp reklam geliri elde
  eden örnek (Örnek 4) kapsamda. Ancak **mobil olmayan, uygulama mağazası dışında müşteriye
  satılan bilgisayar uygulamaları kapsam dışı** (Örnek 20). Münhasıran aracılık faaliyeti
  kapsam dışı. (LEGAL-04, 09, 10, 11)
- **Affiliate:** Ankara Defterdarlığı'nın 14/01/2026 tarihli özelgesi, YouTube ve kişisel
  internet sitesindeki ürün tanıtımlarından alınan komisyonların şartlar sağlanırsa 20/B
  kapsamında olabileceğini söylüyor. Özelge yalnızca soran kişiyi ve onun olayını bağlar. (LEGAL-08)
- **Genç girişimci (GVK mük. 20):** İlk kez mükellef olan ve başlangıçta 29 yaşını
  doldurmamış kişi; 3 vergilendirme dönemi; 2. gelir dilimi tutarına kadar (2026: 400.000 TL);
  yıllık beyanname **yine verilir**; yalnızca gelir vergisi, KDV'yi kapsamaz. (LEGAL-13)
- **Ödeme altyapısı:** Stripe Türkiye'yi desteklemiyor. Lemon Squeezy 31 Mart 2027'de
  kapanıyor ve yeni kayıt almıyor. Paddle'ın desteklemediği ülkeler listesinde Türkiye yok;
  bireyler ve şahıs işletmeleri için "business verification" gerekmiyor (kimlik doğrulaması
  yapılıyor). GitHub Sponsors'ın desteklenen bölgeleri arasında Türkiye var. (LEGAL-14..17)
- **Google CMP:** Kişiselleştirilmiş reklam için Google sertifikalı, IAB TCF entegre CMP
  zorunlu: AEA/Birleşik Krallık 16/01/2024, İsviçre 31/07/2024'ten beri. Google Ad Manager
  belgelerine göre 28/02/2026'dan itibaren üretilen TC string'ler için TCF v2.3 zorunlu. (LEGAL-24)
- **Cayma hakkı:** Mesafeli Sözleşmeler Yönetmeliği 15/1-ğ: elektronik ortamda anında ifa
  edilen hizmetler ve anında teslim edilen gayrimaddi mallarda cayma hakkı yok; 5/1-h
  uyarınca tüketiciye bu önceden bildirilmelidir. (LEGAL-25)
- **VERBİS:** 2025/1572 sayılı Kurul Kararı: 50'den az çalışan ve 100 milyon TL'den az
  bilanço → kayıt istisnası (ana faaliyeti özel nitelikli veri olmayanlar). Tek kişilik
  işletme muhtemelen muaf. Aydınlatma metni ve çerez onayı yükümlülüğü ise devam eder. (LEGAL-21, 22)
- **Açık kaynak lisanslar:** jszip MIT veya GPLv3 seçimli (MIT seçilebilir); pdf-lib,
  decimal.js, zod, undici MIT; pdfjs-dist ve @vercel/speed-insights Apache-2.0. Ticari
  kullanım serbest; lisans/NOTICE metinleri korunmalı. (LEGAL-27)

## 2. Belirsiz olanlar (özelge veya uzman görüşü gerekir)

1. **Araç sitesinde AdSense 20/B kapsamında mı?** Tebliğ kendi sitesinde içerik + reklam
   örneğini kabul ediyor, ama etkileşimli araçların "paylaşılan içerik" veya "veri işleme
   hizmeti" sayılıp sayılmadığı netleşmemiş. 2022 tarihli olumsuz özelge eski (2024 öncesi)
   metne dayanıyor. Doğrudan bu konuda 2024 sonrası özelge bulunamadı. (LEGAL-04)
2. **Ücretli özellikler / tek seferlik satış (Paddle):** Yazılım satışına daha yakın görünüyor;
   tebliğ örneklerine göre 20/B dışında kalma ihtimali yüksek → ticari kazanç, defter tutma,
   KDV ihracat istisnası (11/1-a) uygulanıp uygulanamayacağı belirsiz. (LEGAL-07, 10)
3. **Bağ-Kur (4/b):** SGK genelgesi bulunamadı. 20/B'de mükellefiyet açıldığı için 4/b
   sigortalılık ve aylık prim doğması muhtemel; 4/a kapsamında zaten çalışıyorsanız durum
   farklı olabilir. Erken dönemde prim, reklam gelirini aşabilir. (LEGAL-12)
4. **Paddle'ın Türk bireyi kabul edip etmediği** ve Türk bankasına döviz ödeme yapıp
   yapmadığı Paddle'dan yazılı teyit edilmedi. (LEGAL-16)
5. **Döviz bozdurma zorunluluğu:** İhracatçılar için %35 TCMB'ye satış 31/01/2027'ye kadar
   uzatılmış (haber kaynakları); bireyin AdSense/Paddle tahsilatına uygulanıp uygulanmadığı
   doğrulanmadı. (LEGAL-20)
6. **KVKK md. 9 yurt dışı aktarım** (Google, Vercel) ve **AB GDPR md. 27 temsilci** gerekip
   gerekmediği. (LEGAL-23, 24)
7. **ETBİS kaydı** ve 6563 bilgi yükümlülüklerinin bu modelde kapsamı. (LEGAL-26)
8. Buy Me a Coffee'nin Türkiye'ye ödeme yapıp yapmadığı. (LEGAL-18)

## 3. Asla varsayılmaması gerekenler

- "Vergisiz" veya "istisna garanti" **değildir**. 20/B'de bile %15 tevkifat nihai vergidir;
  şartlardan biri bozulursa (ör. tek bir ödeme başka hesaba gelirse) cezalı tarhiyat olur.
- Başka birine verilmiş özelge sizi bağlamaz; sadece kendi adınıza alınan özelge güvence verir.
- 20/B, Bağ-Kur yükümlülüğünü otomatik olarak ortadan kaldırmaz.
- Paddle ile satış, Türkiye'de vergi yükümlülüğünüzü ortadan kaldırmaz; Paddle yalnızca
  alıcıya karşı satıcıdır (müşteri tarafı KDV/satış vergisi).
- Genç girişimci istisnası beyanname ve defter yükümlülüğünü kaldırmaz; KDV'yi kapsamaz.
- Bağışlar hediye değil, gelirdir.
- Sitede "vergi avantajlı", "yasal olarak onaylı" gibi ifadeler kullanmayın.

## 4. Asgari yönetim yükü ile yasal yol (öneri, onay bekler)

1. **Önce özelge, sonra gelir.** AdSense geliri başlamadan veya ilk ödeme eşiğine
   gelmeden önce mali müşavir aracılığıyla 20/B kapsamı için özelge talep edin. Siteyi
   tam tarif edin: tarayıcı içi araçlar + Türkçe/İngilizce rehber içerikler + AdSense +
   (varsa) affiliate/sponsorluk/bağış.
2. **Olumlu sonuçta:** İstisna belgesi → tek bir Türk bankasında (tercihen döviz alt hesabı
   olan) özel hesap → 1 ay içinde IBAN bildirimi → AdSense, affiliate, sponsorluk,
   GitHub Sponsors ödemelerinin **hepsini** bu hesaba yönlendirme → yıllık toplamı 5,3 milyon
   TL sınırına göre izleme. Bağ-Kur durumunu SGK'dan aynı anda netleştirin.
3. **Olumsuz sonuçta:** Şahıs işletmesi (ticari kazanç, işletme defteri). 29 yaş altı ve ilk
   mükellefiyet ise genç girişimci istisnası değerlendirilir.
4. **Ücretli özellikleri (Paddle) şimdilik ertelemek** yönetim yükünü en aza indirir; ancak
   vergi ve KDV durumu netleştikten ve Paddle Türkiye'den birey kabulünü yazılı teyit ettikten
   sonra açılmalı.
5. **Uyum (gelirden bağımsız, şimdi):** Türkçe aydınlatma metni + çerez politikası; AEA/UK/CH
   için Google sertifikalı TCF v2.3 CMP; onaydan önce reklam/analitik çerezi yok; affiliate ve
   sponsorlu içerikleri etiketleme; üçüncü taraf lisans sayfası.

## 5. Mali müşavir / vergi dairesi (özelge) için soru listesi

- [ ] Etkileşimli, tarayıcı içi araç sitesinden ve aynı sitedeki rehber yazılardan elde edilen
      Google AdSense geliri GVK mük. 20/B kapsamında mı? (sitenin ayrıntılı tarifi ile)
- [ ] Aynı sitedeki affiliate komisyonu, doğrudan sponsorluk ve GitHub Sponsors bağışları
      aynı istisna belgesi ve hesap ile tahsil edilebilir mi?
- [ ] Paddle (yabancı MoR) üzerinden yapılan abonelik/tek seferlik dijital satışlar 20/B
      kapsamında mı? Değilse ticari kazanç mı, KDV 11/1-a hizmet ihracatı istisnası uygulanır mı?
- [ ] 20/B mükellefiyeti 4/b (Bağ-Kur) sigortalılığı başlatır mı? 4/a çalışan isem değişir mi?
- [ ] Döviz cinsinden tahsilatta tevkifat matrahı ve kur; döviz alt hesabı 20/B hesabı olabilir mi?
- [ ] Google/Paddle'dan gelen dövizler için TCMB'ye satış (ihracat bedeli) yükümlülüğü var mı?
- [ ] 20/B kapsamı dışında kalan küçük gelirler olursa istisna bozulur mu (tüm hasılat şartı)?
- [ ] Genç girişimci istisnası ile 20/B birlikte veya sırayla uygulanabilir mi? (yaşım: ___)
- [ ] ETBİS kaydı ve e-arşiv/fatura düzenleme yükümlülüğü doğar mı?
- [ ] Yıllık 5,3 milyon TL sınırı brüt hasılat mı, safi kazanç mı üzerinden izlenir?
- [ ] KVKK md. 9 kapsamında Google AdSense/Vercel için hangi aktarım dayanağı kullanılmalı?

## Başlıca kaynaklar

- 193 sayılı GVK güncel metin: https://www.mevzuat.gov.tr/mevzuatmetin/1.4.193.pdf
- 3065 sayılı KDV Kanunu: https://www.mevzuat.gov.tr/mevzuatmetin/1.5.3065.pdf
- 325 Seri No.lu GV Genel Tebliği (RG 26/09/2024, 32674): https://www.turmob.org.tr/arsiv/mbs/resmigazete/32674-rg-1.pdf
- 332 Seri No.lu GV Genel Tebliği (2026 tarifesi): https://www.alomaliye.com/2025/12/31/gelir-vergisi-genel-tebligi-seri-no-332-gvk-332/
- Ankara Defterdarlığı özelgesi 14/01/2026: https://www.alomaliye.com/2026/02/19/youtube-ve-kisisel-internet-sitesi-uzerinden-yapilan-urun-tanitimlarinda-vergi-istisnasi/
- Google CMP şartı: https://support.google.com/adsense/answer/13554116
- Paddle desteklenmeyen ülkeler: https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle
- Mesafeli Sözleşmeler Yönetmeliği: https://www.lexpera.com.tr/mevzuat/yonetmelikler/mesafeli-sozlesmeler-yonetmeligi
