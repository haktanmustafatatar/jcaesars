const fs = require('fs');

const featuresTranslations = {
  tr: {
    badge: "Çekirdek Zeka",
    title1: "Redefine",
    titleAI: "Yapay Zeka Otonomisi.",
    title2: "Yeniden Tanımlayan Yetenekler",
    description: "Her özellik hız, doğruluk ve mutlak marka uyumu için tasarlanmıştır.",
    explore: "Özelliği Keşfet",
    f1Title: "Herhangi Bir Web Sitesinde Eğit",
    f1Desc: "Herhangi bir dijital ayak izinden otomatik olarak zeka çıkarın. Yapay zekamız derin bağlamı anlar.",
    f2Title: "Sonsuz Bilgi",
    f2Desc: "PDF, Dokümanlar ve yapılandırılmış veriler için kesintisiz işleme. Uzmanlaşmış bilgi tabanınız.",
    f3Title: "Özel Kişilik",
    f3Desc: "Ajanınızın ruhunu tanımlayın. Markanızın sesiyle mutlak hassasiyetle eşleştirin.",
    f4Title: "Elit Dağıtım",
    f4Desc: "Tek bir kod parçası. Sonsuz erişim. Yüksek sadakatli bir arayüzle platformlar arası dağıtım yapın.",
    f5Title: "Pro Analitik",
    f5Desc: "Davranış, duygu ve dönüşüm metriklerini izlemek için derin zeka panosu.",
    f6Title: "Önce Geliştirici",
    f6Desc: "Mimari entegrasyon için tam API yetenekleri. Esneklik talep edenler için tasarlandı."
  },
  en: {
    badge: "Core Intelligence",
    title1: "Capabilities that Redefine",
    titleAI: "AI Autonomy.",
    title2: "",
    description: "Every feature is engineered for speed, accuracy, and absolute brand alignment.",
    explore: "Explore Feature",
    f1Title: "Train on Any Website",
    f1Desc: "Automatically crawl and extract intelligence from any digital footprint. Our AI understands deep context.",
    f2Title: "Infinite Knowledge",
    f2Desc: "Seamless processing for PDFs, Docs, and structured data. Your specialized knowledge base, refined.",
    f3Title: "Bespoke Personality",
    f3Desc: "Define your agent's soul. Match your brand's voice with absolute precision and elegance.",
    f4Title: "Elite Deployment",
    f4Desc: "One snippet. Infinite reach. Deploy across platforms with a high-fidelity interface.",
    f5Title: "Pro Analytics",
    f5Desc: "Deep intelligence dashboard to monitor behavior, sentiment, and conversion metrics.",
    f6Title: "Developer First",
    f6Desc: "Full API capabilities for architectural integration. Built for those who demand flexibility."
  },
  ar: {
    badge: "الذكاء الأساسي",
    title1: "قدرات تعيد تعريف",
    titleAI: "استقلالية الذكاء الاصطناعي.",
    title2: "",
    description: "تم تصميم كل ميزة من أجل السرعة والدقة والمواءمة المطلقة مع العلامة التجارية.",
    explore: "استكشف الميزة",
    f1Title: "تدرب على أي موقع ويب",
    f1Desc: "استخرج الذكاء تلقائيًا من أي بصمة رقمية. يفهم الذكاء الاصطناعي الخاص بنا السياق العميق.",
    f2Title: "معرفة لا نهائية",
    f2Desc: "معالجة سلسة لملفات PDF والمستندات والبيانات المنظمة. قاعدة معارفك المتخصصة والمحسنة.",
    f3Title: "شخصية مخصصة",
    f3Desc: "حدد روح وكيلك. طابق صوت علامتك التجارية بدقة وأناقة مطلقة.",
    f4Title: "نشر نخبوي",
    f4Desc: "مقتطف واحد. وصول غير محدود. انشر عبر المنصات بواجهة عالية الدقة.",
    f5Title: "تحليلات احترافية",
    f5Desc: "لوحة معلومات ذكاء عميقة لمراقبة السلوك والمشاعر ومقاييس التحويل.",
    f6Title: "المطور أولاً",
    f6Desc: "قدرات API كاملة للتكامل المعماري. مصمم لأولئك الذين يطلبون المرونة."
  },
  ru: {
    badge: "Базовый Интеллект",
    title1: "Возможности, переопределяющие",
    titleAI: "Автономию ИИ.",
    title2: "",
    description: "Каждая функция разработана для обеспечения скорости, точности и абсолютного соответствия бренду.",
    explore: "Изучить функцию",
    f1Title: "Обучение на любом сайте",
    f1Desc: "Автоматически анализируйте любой цифровой след. Наш ИИ понимает глубокий контекст.",
    f2Title: "Бесконечные знания",
    f2Desc: "Быстрая обработка PDF, документов и данных. Ваша специализированная база знаний.",
    f3Title: "Индивидуальность",
    f3Desc: "Определите душу вашего агента. Идеально подберите голос вашего бренда.",
    f4Title: "Элитное развертывание",
    f4Desc: "Один скрипт. Бесконечный охват. Развертывание на разных платформах.",
    f5Title: "Про-Аналитика",
    f5Desc: "Глубокая панель аналитики для отслеживания поведения, настроений и конверсии.",
    f6Title: "Для разработчиков",
    f6Desc: "Полные возможности API для архитектурной интеграции. Создано для тех, кому нужна гибкость."
  },
  fr: {
    badge: "Intelligence de Base",
    title1: "Des capacités qui redéfinissent",
    titleAI: "l'Autonomie de l'IA.",
    title2: "",
    description: "Chaque fonctionnalité est conçue pour la rapidité, la précision et l'alignement absolu avec la marque.",
    explore: "Explorer la fonctionnalité",
    f1Title: "Entraînez sur n'importe quel site",
    f1Desc: "Extrayez automatiquement l'intelligence de n'importe quelle empreinte numérique. Notre IA comprend le contexte profond.",
    f2Title: "Connaissance Infinie",
    f2Desc: "Traitement transparent des PDF, Docs et données. Votre base de connaissances spécialisée, affinée.",
    f3Title: "Personnalité sur mesure",
    f3Desc: "Définissez l'âme de votre agent. Faites correspondre la voix de votre marque avec précision.",
    f4Title: "Déploiement d'Élite",
    f4Desc: "Un seul extrait. Portée infinie. Déployez sur toutes les plateformes avec une interface haute fidélité.",
    f5Title: "Analyse Pro",
    f5Desc: "Tableau de bord d'intelligence approfondie pour surveiller le comportement et les conversions.",
    f6Title: "Pour les Développeurs",
    f6Desc: "Capacités API complètes pour une intégration architecturale."
  },
  de: {
    badge: "Kernintelligenz",
    title1: "Fähigkeiten, die die",
    titleAI: "KI-Autonomie",
    title2: "neu definieren.",
    description: "Jede Funktion ist auf Geschwindigkeit, Genauigkeit und absolute Markenausrichtung ausgelegt.",
    explore: "Funktion erkunden",
    f1Title: "Auf jeder Website trainieren",
    f1Desc: "Extrahieren Sie automatisch Informationen aus jedem digitalen Fußabdruck.",
    f2Title: "Unendliches Wissen",
    f2Desc: "Nahtlose Verarbeitung für PDFs, Docs und strukturierte Daten.",
    f3Title: "Maßgeschneiderte Persönlichkeit",
    f3Desc: "Definieren Sie die Seele Ihres Agenten. Passen Sie die Stimme Ihrer Marke mit absoluter Präzision an.",
    f4Title: "Elite-Bereitstellung",
    f4Desc: "Ein Snippet. Unendliche Reichweite. Stellen Sie Plattformen mit einer hochwertigen Schnittstelle bereit.",
    f5Title: "Pro-Analyse",
    f5Desc: "Deep-Intelligence-Dashboard zur Überwachung von Verhalten, Stimmung und Konversionen.",
    f6Title: "Developer First",
    f6Desc: "Volle API-Funktionen für die architektonische Integration."
  },
  gr: {
    badge: "Βασική Νοημοσύνη",
    title1: "Δυνατότητες που Επαναπροσδιορίζουν",
    titleAI: "Την Αυτονομία του AI.",
    title2: "",
    description: "Κάθε χαρακτηριστικό είναι σχεδιασμένο για ταχύτητα, ακρίβεια και απόλυτη εναρμόνιση με το brand.",
    explore: "Εξερευνήστε τη Λειτουργία",
    f1Title: "Εκπαίδευση σε κάθε Ιστότοπο",
    f1Desc: "Αυτόματη εξαγωγή νοημοσύνης από κάθε ψηφιακό αποτύπωμα.",
    f2Title: "Άπειρη Γνώση",
    f2Desc: "Απρόσκοπτη επεξεργασία για PDF, έγγραφα και δομημένα δεδομένα.",
    f3Title: "Προσαρμοσμένη Προσωπικότητα",
    f3Desc: "Καθορίστε την ψυχή του πράκτορά σας. Ταιριάξτε τη φωνή της επωνυμίας σας.",
    f4Title: "Ελίτ Ανάπτυξη",
    f4Desc: "Ένα απόσπασμα. Άπειρη εμβέλεια. Αναπτύξτε σε πλατφόρμες με διεπαφή υψηλής πιστότητας.",
    f5Title: "Pro Analytics",
    f5Desc: "πίνακας εργαλείων βαθιάς νοημοσύνης για την παρακολούθηση συμπεριφοράς και μετατροπών.",
    f6Title: "Developer First",
    f6Desc: "Πλήρεις ικανότητες API για αρχιτεκτονική ενσωμάτωση."
  }
};

const langs = ['tr', 'en', 'ar', 'ru', 'fr', 'de', 'gr'];

langs.forEach(lang => {
  const file = `./messages/${lang}.json`;
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.Features = featuresTranslations[lang];
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
});
