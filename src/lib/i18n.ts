/**
 * ALAZ NEON — Internationalization (i18n) System
 * Supports: Turkish (tr), German (de)
 */

export type Locale = "tr" | "de";

const translations = {
  // ═══════════════════════════════════════════
  // LANDING PAGE
  // ═══════════════════════════════════════════
  "common.back": { tr: "ANA SAYFA", de: "ZURÜCK ZUR STARTSEITE" },
  "landing.hostLabel": { tr: "Yayıncı / Kurucu", de: "Moderator / Gastgeber" },
  "join.hostOffline": { tr: "HOST ÇEVRİMDIŞI", de: "HOST OFFLINE" },
  "join.title": { tr: "SAVAŞA KATIL", de: "TRITT DEM KAMPF BEI" },
  "join.subtitle": { tr: "BEYİN HÜCRELERİNİ HAZIRLA", de: "BEREITE DEINE GEHIRNZELLEN VOR" },
  "landing.hostTitle": { tr: "Oda Kur", de: "Raum Erstellen" },
  "landing.hostDesc": {
    tr: "TV ekranında ateş yak, arkadaşlarını davet et!",
    de: "Starte das Spiel auf dem TV und lade deine Freunde ein!",
  },
  "landing.playerLabel": { tr: "Oyuncu / Misafir", de: "Spieler / Gast" },
  "landing.playerTitle": { tr: "Katıl", de: "Beitreten" },
  "landing.playerDesc": {
    tr: "Telefonunla oyuna gir, zihninin ateşini göster!",
    de: "Tritt mit deinem Handy bei und zeig was du drauf hast!",
  },
  "landing.tagline": {
    tr: "ZEKANIN YENİ STATÜ SEMBOLÜ",
    de: "DAS NEUE STATUSSYMBOL DER INTELLIGENZ",
  },
  "landing.subtitle": {
    tr: "Ready for the ultimate mythical challenge?",
    de: "Bereit für die ultimative Herausforderung?",
  },
  "attract.joinNow": { tr: "OYUNA KATIL", de: "JETZT BEITRETEN" },
  "attract.scanToJoin": { tr: "QR KODU OKUT", de: "QR-CODE SCANNEN" },
  "attract.howToPlay": { tr: "NASIL OYNANIR?", de: "SPIELANLEITUNG" },
  "attract.step1": { tr: "1. ODAYA GİR", de: "1. RAUM BEITRETEN" },
  "attract.step2": { tr: "2. KELİME BUL", de: "2. WÖRTER FINDEN" },
  "attract.step3": { tr: "3. ATEŞLE!", de: "3. FEUER!" },

  // ═══════════════════════════════════════════
  // HOST SETUP
  // ═══════════════════════════════════════════
  "setup.title": { tr: "OYUN AYARLARI", de: "SPIELEINSTELLUNGEN" },
  "setup.subtitle": {
    tr: "Zamanı, tur sayısını ve kategorileri belirle.",
    de: "Zeit, Rundenzahl und Kategorien festlegen.",
  },
  "setup.premiumMode": { tr: "Premium Mode", de: "Premium Modus" },
  "setup.timerLabel": { tr: "Süre / Tempo", de: "Zeit / Tempo" },
  "setup.timerAriaLabel": {
    tr: "Süre veya Tempo Seçimi",
    de: "Zeit- oder Tempo-Auswahl",
  },
  "setup.timer30": {
    tr: "30 Saniye (Ateş Hattı)",
    de: "30 Sekunden (Feuerlinie)",
  },
  "setup.timer45": {
    tr: "45 Saniye (Yüksek Tempo)",
    de: "45 Sekunden (Hohes Tempo)",
  },
  "setup.timer60": { tr: "60 Saniye (Standart)", de: "60 Sekunden (Standard)" },
  "setup.timer90": { tr: "90 Saniye (Zor Mod)", de: "90 Sekunden (Schwer)" },
  "setup.roundsLabel": { tr: "Tur Sayısı", de: "Rundenzahl" },
  "setup.roundsCalc": {
    tr: (r: string, t: string, total: number) =>
      `${r} tur × ${t}sn = maks ${total}sn oyun`,
    de: (r: string, t: string, total: number) =>
      `${r} Runden × ${t}s = max ${total}s Spiel`,
  },
  "setup.gameModeLabel": { tr: "Oyun Modu", de: "Spielmodus" },
  "setup.individual": { tr: "BİREYSEL", de: "EINZELSPIELER" },
  "setup.team": { tr: "TAKIM MODU", de: "TEAM-MODUS" },
  "setup.individualDesc": {
    tr: "Herkes kendi için yarışır.",
    de: "Jeder spielt für sich.",
  },
  "setup.teamDesc": {
    tr: "Masalar arası kıyasıya rekabet!",
    de: "Tisch gegen Tisch Wettkampf!",
  },
  "setup.languageLabel": { tr: "Dil Seçimi", de: "Sprachauswahl" },
  "setup.languageTR": { tr: "Türkçe", de: "Türkisch" },
  "setup.languageDE": { tr: "Almanca (Deutsch)", de: "Deutsch" },
  "setup.presetLabel": { tr: "Hızlı Preset", de: "Schnell-Vorlagen" },
  "setup.categoriesLabel": {
    tr: "Kategoriler (Virgülle Ayır)",
    de: "Kategorien (mit Komma trennen)",
  },
  "setup.categoriesPlaceholder": {
    tr: "Şehir, Ülke, İsim...",
    de: "Stadt, Land, Name...",
  },
  "setup.categoriesHint": {
    tr: "* 4-6 kategori en iyi oyun deneyimini sağlar.",
    de: "* 4-6 Kategorien bieten die beste Spielerfahrung.",
  },
  "setup.startButton": {
    tr: (r: string) => `LOBİYİ AÇ (${r} TUR) →`,
    de: (r: string) => `LOBBY STARTEN (${r} RUNDEN) →`,
  },
  "setup.starting": { tr: "BAŞLATILIYOR...", de: "WIRD GESTARTET..." },
  "setup.statusTitle": { tr: "Sistem Durumu", de: "Systemstatus" },
  "setup.statusWaiting": { tr: "BEKLEMEDE", de: "WARTEND" },
  "setup.statusDesc": {
    tr: "Oyun henüz başlatılmadı. Lobi oluşturmak için ana paneli kullanın.",
    de: "Das Spiel wurde noch nicht gestartet. Nutze das Hauptpanel um die Lobby zu erstellen.",
  },
  "setup.scoringTitle": { tr: "Puanlama", de: "Punktevergabe" },
  "setup.scoreUnique": { tr: "Benzersiz cevap", de: "Einzigartige Antwort" },
  "setup.scoreShared": { tr: "Paylaşılan cevap", de: "Geteilte Antwort" },
  "setup.scoreEarly": {
    tr: "Erken teslim bonusu",
    de: "Frühzeitiger Abgabe-Bonus",
  },
  "setup.historyTitle": { tr: "Son Oyunlar", de: "Letzte Spiele" },
  "setup.historyEmpty": {
    tr: "Geçmiş bulunamadı",
    de: "Kein Verlauf gefunden",
  },
  "setup.errorNoCategory": {
    tr: "Lütfen en az bir kategori girin.",
    de: "Bitte geben Sie mindestens eine Kategorie ein.",
  },
  "setup.errorCreate": {
    tr: "Oda oluşturulurken bir hata oluştu: ",
    de: "Fehler beim Erstellen des Raums: ",
  },
  "setup.errorFirebase": {
    tr: "⚠️ Firebase bağlantı hatası! Proje erişilemez durumda. .env.local dosyasındaki VITE_FIREBASE_API_KEY değerini kontrol edin.",
    de: "⚠️ Firebase Verbindungsfehler! Projekt nicht erreichbar. Überprüfen Sie VITE_FIREBASE_API_KEY in .env.local.",
  },

  // ═══════════════════════════════════════════
  // HOST LOBBY
  // ═══════════════════════════════════════════
  "lobby.title": { tr: "ATEŞ YAKILDI!", de: "DAS FEUER BRENNT!" },
  "lobby.subtitle": {
    tr: (rounds: number) =>
      `Oyun başlıyor. Bu heyecan verici meydan okuma ${rounds} tur sürecek.`,
    de: (rounds: number) =>
      `Das Spiel beginnt. Diese Herausforderung dauert ${rounds} Runden.`,
  },
  "lobby.roomCode": { tr: "ODA GİRİŞ KODU", de: "RAUM-CODE" },
  "lobby.connect": { tr: "BAĞLAN", de: "VERBINDEN" },
  "lobby.categories": { tr: "KATEGORİLER", de: "KATEGORIEN" },
  "lobby.active": { tr: "AKTİF", de: "AKTIV" },
  "lobby.noCategories": {
    tr: "Kategori seçilmedi...",
    de: "Keine Kategorien gewählt...",
  },
  "lobby.removeCategory": { tr: "Kategoriyi Sil", de: "Kategorie löschen" },
  "lobby.newCategory": { tr: "Yeni Kategori...", de: "Neue Kategorie..." },
  "lobby.addCategory": { tr: "Kategori Ekle", de: "Kategorie hinzufügen" },
  "lobby.teamReady": { tr: "Takım Kayıtlı", de: "Teams Bereit" },
  "lobby.playerReady": { tr: "Savaşçı Hazır", de: "Krieger Bereit" },
  "lobby.startGame": { tr: "OYUNU BAŞLAT →", de: "SPIEL STARTEN →" },
  "lobby.noCategory": { tr: "Kategori Eksik!", de: "Kategorien Fehlen!" },
  "lobby.networkConnected": { tr: "> AĞA_BAĞLANILDI", de: "> NETZWERK_VERBUNDEN" },
  "lobby.waitingSystems": {
    tr: "Diğer sistemler bekleniyor. Veri akışı başlamak üzere...",
    de: "Warte auf andere Systeme. Datenfluss beginnt in Kürze...",
  },

  // ═══════════════════════════════════════════
  // HOST PLAYING
  // ═══════════════════════════════════════════
  "playing.seconds": { tr: "Saniye", de: "Sekunden" },
  "playing.category": { tr: "KATEGORİ", de: "KATEGORIE" },
  "playing.answered": {
    tr: "Oyuncu Cevapladı",
    de: "Spieler haben geantwortet",
  },

  // ═══════════════════════════════════════════
  // HOST REVIEW
  // ═══════════════════════════════════════════
  "review.cognitiveAccuracy": {
    tr: "Bilişsel Doğruluk",
    de: "Kognitive Genauigkeit",
  },
  "review.groupAverage": { tr: "Grup Ortalaması", de: "Gruppendurchschnitt" },
  "review.originalityDensity": {
    tr: "Özgünlük Yoğunluğu",
    de: "Originalitätsdichte",
  },
  "review.uniquePerPlayer": {
    tr: "Unik Cevap / Oyuncu",
    de: "Einzigartige Antwort / Spieler",
  },
  "review.mentalPerformance": {
    tr: "Zihinsel Performans",
    de: "Mentale Leistung",
  },
  "review.analyzing": {
    tr: "PUANLAR ANALİZ EDİLİYOR",
    de: "PUNKTE WERDEN ANALYSIERT",
  },
  "review.measuring": {
    tr: "Zihinlerin ateşi ölçülüyor...",
    de: "Das Feuer der Geister wird gemessen...",
  },
  "review.roundSummary": {
    tr: (r: number) => `TUR ${r} ÖZETİ`,
    de: (r: number) => `RUNDE ${r} ZUSAMMENFASSUNG`,
  },
  "review.systemAnalyzed": {
    tr: "Sistem Puanları Analiz Etti",
    de: "Das System hat die Punkte analysiert",
  },
  "review.teamRanking": { tr: "Takım Sıralaması", de: "Team-Rangliste" },
  "review.overallRanking": { tr: "Genel Sıralama", de: "Gesamt-Rangliste" },
  "review.thisRound": {
    tr: (p: number) => `Bu Tur: +${p} Puan`,
    de: (p: number) => `Diese Runde: +${p} Punkte`,
  },
  "review.rank": {
    tr: (r: number) => `SIRA #${r}`,
    de: (r: number) => `RANG #${r}`,
  },
  "review.categoryAnalysis": {
    tr: "Kategori Analizi",
    de: "Kategorie-Analyse",
  },
  "review.approve": { tr: "ONAYLA", de: "BESTÄTIGEN" },
  "review.reject": { tr: "REDDET", de: "ABLEHNEN" },
  "review.empty": { tr: "BOŞ", de: "LEER" },
  "review.points": {
    tr: (p: number) => `+${p} Puan`,
    de: (p: number) => `+${p} Punkte`,
  },
  "review.uniqueBonus": { tr: "(Benzersiz)", de: "(Einzigartig)" },
  "review.hostRejected": { tr: "HOST REDDETTİ", de: "VOM HOST ABGELEHNT" },
  "review.invalidLetter": { tr: "GEÇERSİZ HARF", de: "UNGÜLTIGER BUCHSTABE" },
  "review.speedBonusTitle": {
    tr: "GÜMÜŞ FİŞEK YOLCUSU (HIZ BONUSU)",
    de: "SILBERKUGEL (GESCHWINDIGKEITSBONUS)",
  },
  "review.speedBonusDesc": {
    tr: (n: string) => `${n} önce ateşledi!`,
    de: (n: string) => `${n} hat zuerst gefeuert!`,
  },
  "review.seeResults": { tr: "SONUÇLARI GÖR →", de: "ERGEBNISSE ANSEHEN →" },
  "review.nextRound": { tr: "SONRAKİ TURA GEÇ →", de: "NÄCHSTE RUNDE →" },
  "review.persona.sprinter": { tr: "Hızlı Çita", de: "Sprinter" },
  "review.persona.innovator": { tr: "İnovatör", de: "Innovator" },
  "review.persona.sniper": { tr: "Keskin Nişancı", de: "Scharfschütze" },
  "review.persona.strategist": { tr: "Stratejist", de: "Stratege" },
  "review.persona.ghost": { tr: "Gölge", de: "Schatten" },
  "review.silverBullet": { tr: "Gümüş Fişek", de: "Silberkugel" },

  // ═══════════════════════════════════════════
  // PODIUM
  // ═══════════════════════════════════════════
  "podium.title": { tr: "ŞAMPİYONLAR", de: "CHAMPIONS" },
  "podium.awardsTitle": { tr: "OYUNUN EN'LERİ", de: "DIE BESTEN DES SPIELS" },
  "podium.creativeTitle": { tr: "MİTİK YARATICI", de: "MYTHISCHER KREATIVER" },
  "podium.creativeDesc": {
    tr: "En Yenilikçi Karakter",
    de: "Innovativster Charakter",
  },
  "podium.creativeCount": {
    tr: "Benzersiz Cevap",
    de: "Einzigartige Antworten",
  },
  "podium.creativeNone": {
    tr: "Herkes kopyacıydı!",
    de: "Alle haben abgeschrieben!",
  },
  "podium.speedTitle": { tr: "ATEŞİN OĞLU", de: "SOHN DES FEUERS" },
  "podium.speedDesc": { tr: "Fırtına Gemi Kaptanı", de: "Sturmkapitän" },
  "podium.speedCount": { tr: "Hız Bonusu", de: "Geschwindigkeitsbonus" },
  "podium.speedNone": {
    tr: "Kimse acele etmedi.",
    de: "Niemand hat sich beeilt.",
  },
  "podium.ghostTitle": { tr: "LOBİ HAYALETİ", de: "LOBBY-GEIST" },
  "podium.ghostDesc": {
    tr: "Boş Kağıt Uzmanı",
    de: "Experte für leere Blätter",
  },
  "podium.ghostCount": { tr: "Boş Cevap", de: "Leere Antworten" },
  "podium.ghostNone": { tr: "Kağıtlar ful dolu!", de: "Alle Blätter voll!" },
  "podium.newGame": { tr: "Yeni Oyun Başlat", de: "Neues Spiel starten" },

  // ═══════════════════════════════════════════
  // STANDINGS (Mid-game Leaderboard)
  // ═══════════════════════════════════════════
  "standings.title": { tr: "GÜNCEL PUAN DURUMU", de: "AKTUELLE PLATZIERUNG" },
  "standings.playerTitle": { tr: "PUAN DURUMU EKRANDA", de: "PUNKTESTAND AUF DEM BILDSCHIRM" },
  "standings.playerDesc": { 
    tr: "Liderlik tablosu için ana ekrana (TV) bak. Sonraki raunt birazdan başlayacak.", 
    de: "Schau auf den Hauptbildschirm für die Rangliste. Die nächste Runde beginnt bald." 
  },

  // ═══════════════════════════════════════════
  // AUTH & LEADERBOARD
  // ═══════════════════════════════════════════
  "auth.login": { tr: "Giriş Yap", de: "Anmelden" },
  "auth.register": { tr: "Kayıt Ol", de: "Registrieren" },
  "auth.email": { tr: "E-posta", de: "E-Mail" },
  "auth.password": { tr: "Şifre", de: "Passwort" },
  "auth.noAccount": { tr: "Hesabın yok mu?", de: "Noch kein Konto?" },
  "auth.haveAccount": {
    tr: "Zaten hesabın var mı?",
    de: "Hast du bereits ein Konto?",
  },
  "auth.welcomeBack": {
    tr: "Hoş Geldin, Savaşçı",
    de: "Willkommen zurück, Krieger",
  },
  "auth.joinLeague": {
    tr: "Efsaneler Ligine Katıl",
    de: "Tritt der Legenden-Liga bei",
  },
  "leaderboard.title": {
    tr: "HAFTALIK ŞAMPİYONLAR",
    de: "WÖCHENTLICHE CHAMPIONS",
  },
  "leaderboard.subtitle": {
    tr: "Zirvedeki Zihinler",
    de: "Die klügsten Köpfe an der Spitze",
  },
  "leaderboard.rank": { tr: "SIRA", de: "RANG" },
  "leaderboard.player": { tr: "OYUNCU", de: "SPIELER" },
  "leaderboard.score": { tr: "TOPLAM PUAN", de: "GESAMTPUNKTZAHL" },
  "leaderboard.back": { tr: "← GERİ DÖN", de: "← ZURÜCK" },
  "leaderboard.thisWeek": { tr: "BU HAFTA", de: "DIESE WOCHE" },
  "leaderboard.allTime": { tr: "TÜM ZAMANLAR", de: "ALLE ZEITEN" },
  "podium.individual": { tr: "Bireysel", de: "Einzelspieler" },

  // ═══════════════════════════════════════════
  // PLAYER JOIN
  // ═══════════════════════════════════════════
  "join.roomCode": { tr: "Oda Kodu", de: "Raum-Code" },
  "join.roomPlaceholder": { tr: "ÖRN: 4X9B", de: "z.B.: 4X9B" },
  "join.nickname": { tr: "Nickname", de: "Nickname" },
  "join.nicknamePlaceholder": { tr: "Efsane Oyuncu", de: "Legendärer Spieler" },
  "join.nicknamePlaceholderShort": { tr: "SAVAŞÇI", de: "KRIEGER" },
  "join.teamLabel": { tr: "Masa No / Takım Adı", de: "Tisch Nr. / Teamname" },
  "join.teamPlaceholder": {
    tr: "Masa 5 / Mavi Takım",
    de: "Tisch 5 / Blaues Team",
  },
  "join.teamPlaceholderShort": { tr: "TAKIM ADI", de: "TEAMNAME" },
  "join.terminalHeader": { tr: "ALAZ_SYS // TERMİNAL_v2.1", de: "ALAZ_SYS // TERMINAL_v2.1" },
  "join.terminalFooter": { tr: "ALAZ NEON // NO SYSTEM IS SAFE", de: "ALAZ NEON // KEIN SYSTEM IST SICHER" },
  "join.connecting": {
    tr: "BAĞLANILIYOR...",
    de: "VERBINDUNG WIRD HERGESTELLT...",
  },
  "join.submit": { tr: "SAVAŞA KATIL", de: "AM KAMPF TEILNEHMEN" },
  "join.errorNoRoom": {
    tr: "Oda bulunamadı. Lütfen TV ekranındaki kodu kontrol edin.",
    de: "Raum nicht gefunden. Bitte den Code auf dem TV-Bildschirm überprüfen.",
  },
  "join.errorStarted": {
    tr: "Bu odaya şu an giriş yapılamaz (Oyun çoktan başlamış).",
    de: "Dieser Raum ist nicht mehr betretbar (Spiel hat bereits begonnen).",
  },
  "join.errorPlayer": {
    tr: "Oyuncu kaydı oluşturulamadı: ",
    de: "Spielerregistrierung fehlgeschlagen: ",
  },
  "join.errorGeneral": {
    tr: "Beklenmeyen bir hata oluştu.",
    de: "Ein unerwarteter Fehler ist aufgetreten.",
  },

  // ═══════════════════════════════════════════
  // PLAYER GAME
  // ═══════════════════════════════════════════
  "game.roomClosed": { tr: "ODA KAPALI", de: "RAUM GESCHLOSSEN" },
  "game.roomClosedDesc": {
    tr: "Bu oyun odası host tarafından kapatıldı.",
    de: "Dieser Raum wurde vom Moderator geschlossen.",
  },
  "game.backHome": { tr: "ANA SAYFAYA DÖN", de: "ZURÜCK ZUR STARTSEITE" },
  "game.player": { tr: "Oyuncu", de: "Spieler" },
  "game.submitting": { tr: "GÖNDERİLİYOR...", de: "WIRD GESENDET..." },
  "game.submitEarly": {
    tr: "BİTİRDİM! (ERKEN BONUSU)",
    de: "FERTIG! (FRÜHBONUS)",
  },
  "game.earlyHint": {
    tr: "NE KADAR ERKEN, O KADAR PUAN!",
    de: "JE SCHNELLER, DESTO MEHR PUNKTE!",
  },
  "game.submitError": {
    tr: "Cevaplar gönderilemedi. Lütfen tekrar deneyin.",
    de: "Antworten konnten nicht gesendet werden. Bitte erneut versuchen.",
  },

  // ═══════════════════════════════════════════
  // CATEGORY PRESETS (German defaults)
  // ═══════════════════════════════════════════
  "categories.default": {
    tr: "Şehir, Ülke, İsim, Eşya, Hayvan",
    de: "Stadt, Land, Name, Gegenstand, Tier",
  },
} as const;

type TranslationKey = keyof typeof translations;
type TranslationValue = string | ((...args: (string | number)[]) => string);

// ───────── STATE MANAGEMENT ─────────
let currentLocale: Locale =
  typeof window !== "undefined"
    ? (localStorage.getItem("alaz_neon_locale") as Locale) || "tr"
    : "tr";

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("alaz_neon_locale", locale);
  }
}

/**
 * Get a translated string by key.
 * Supports both plain strings and function-based translations for interpolation.
 */
export function t(key: TranslationKey, ...args: (string | number)[]): string {
  const entry = translations[key];
  if (!entry) return key;

  const val = entry[currentLocale] as TranslationValue;
  if (typeof val === "function") {
    return val(...args);
  }
  return val;
}

// Expose for reactive React usage
export const i18n = { t, getLocale, setLocale };
