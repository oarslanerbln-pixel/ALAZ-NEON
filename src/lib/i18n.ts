/**
 * HENGAME ARENA — Internationalization (i18n) System
 * Supports: German (de), Turkish (tr), English (en)
 */

export type Locale = "tr" | "de" | "en";

const translations = {
  // ═══════════════════════════════════════════
  // LANDING PAGE
  // ═══════════════════════════════════════════
  "common.back": { tr: "ANA SAYFA", de: "ZURÜCK ZUR STARTSEITE", en: "HOME" },
  "landing.hostLabel": { tr: "Yayıncı / Kurucu", de: "Moderator / Gastgeber", en: "Broadcaster / Host" },
  "join.hostOffline": { tr: "HOST ÇEVRİMDIŞI", de: "HOST OFFLINE", en: "HOST OFFLINE" },
  "join.title": { tr: "SAVAŞA KATIL", de: "TRITT DEM KAMPF BEI", en: "JOIN THE BATTLE" },
  "join.subtitle": { tr: "BEYİN HÜCRELERİNİ HAZIRLA", de: "BEREITE DEINE GEHIRNZELLEN VOR", en: "PREPARE YOUR BRAIN CELLS" },
  "landing.hostTitle": { tr: "Oda Kur", de: "Raum Erstellen", en: "Create Room" },
  "landing.hostDesc": {
    tr: "TV ekranında ateş yak, arkadaşlarını davet et!",
    de: "Starte das Spiel auf dem TV und lade deine Freunde ein!",
    en: "Light the fire on the TV screen, invite your friends!",
  },
  "landing.playerLabel": { tr: "Oyuncu / Misafir", de: "Spieler / Gast", en: "Player / Guest" },
  "landing.playerTitle": { tr: "Katıl", de: "Beitreten", en: "Join" },
  "landing.playerDesc": {
    tr: "Telefonunla oyuna gir, zihninin ateşini göster!",
    de: "Tritt mit deinem Handy bei und zeig was du drauf hast!",
    en: "Jump in with your phone, show off your mind!",
  },
  "landing.tagline": {
    tr: "ZEKANIN YENİ STATÜ SEMBOLÜ",
    de: "DAS NEUE STATUSSYMBOL DER INTELLIGENZ",
    en: "THE NEW STATUS SYMBOL OF INTELLIGENCE",
  },
  "landing.subtitle": {
    tr: "Ready for the ultimate mythical challenge?",
    de: "Bereit für die ultimative Herausforderung?",
    en: "Ready for the ultimate mythical challenge?",
  },
  "attract.joinNow": { tr: "OYUNA KATIL", de: "JETZT BEITRETEN", en: "JOIN NOW" },
  "attract.scanToJoin": { tr: "QR KODU OKUT", de: "QR-CODE SCANNEN", en: "SCAN QR CODE" },
  "attract.howToPlay": { tr: "NASIL OYNANIR?", de: "SPIELANLEITUNG", en: "HOW TO PLAY?" },
  "attract.step1": { tr: "1. ODAYA GİR", de: "1. RAUM BEITRETEN", en: "1. JOIN ROOM" },
  "attract.step2": { tr: "2. KELİME BUL", de: "2. WÖRTER FINDEN", en: "2. FIND WORDS" },
  "attract.step3": { tr: "3. ATEŞLE!", de: "3. FEUER!", en: "3. FIRE!" },

  // ═══════════════════════════════════════════
  // HOST SETUP
  // ═══════════════════════════════════════════
  "setup.title": { tr: "OYUN AYARLARI", de: "SPIELEINSTELLUNGEN", en: "GAME SETTINGS" },
  "setup.subtitle": {
    tr: "Zamanı, tur sayısını ve kategorileri belirle.",
    de: "Zeit, Rundenzahl und Kategorien festlegen.",
    en: "Set the time, round count, and categories.",
  },
  "setup.premiumMode": { tr: "Premium Mode", de: "Premium Modus", en: "Premium Mode" },
  "setup.timerLabel": { tr: "Süre / Tempo", de: "Zeit / Tempo", en: "Time / Pace" },
  "setup.timerAriaLabel": {
    tr: "Süre veya Tempo Seçimi",
    de: "Zeit- oder Tempo-Auswahl",
    en: "Time or Pace Selection",
  },
  "setup.timer30": {
    tr: "30 Saniye (Ateş Hattı)",
    de: "30 Sekunden (Feuerlinie)",
    en: "30 Seconds (Firing Line)",
  },
  "setup.timer45": {
    tr: "45 Saniye (Yüksek Tempo)",
    de: "45 Sekunden (Hohes Tempo)",
    en: "45 Seconds (High Pace)",
  },
  "setup.timer60": { tr: "60 Saniye (Standart)", de: "60 Sekunden (Standard)", en: "60 Seconds (Standard)" },
  "setup.timer90": { tr: "90 Saniye (Zor Mod)", de: "90 Sekunden (Schwer)", en: "90 Seconds (Hard Mode)" },
  "setup.roundsLabel": { tr: "Tur Sayısı", de: "Rundenzahl", en: "Round Count" },
  "setup.roundsCalc": {
    tr: (r: string, t: string, total: number) =>
      `${r} tur × ${t}sn = maks ${total}sn oyun`,
    de: (r: string, t: string, total: number) =>
      `${r} Runden × ${t}s = max ${total}s Spiel`,
    en: (r: string, t: string, total: number) =>
      `${r} rounds × ${t}s = max ${total}s game`,
  },
  "setup.gameModeLabel": { tr: "Oyun Modu", de: "Spielmodus", en: "Game Mode" },
  "setup.individual": { tr: "BİREYSEL", de: "EINZELSPIELER", en: "SOLO" },
  "setup.team": { tr: "TAKIM MODU", de: "TEAM-MODUS", en: "TEAM MODE" },
  "setup.individualDesc": {
    tr: "Herkes kendi için yarışır.",
    de: "Jeder spielt für sich.",
    en: "Everyone competes for themselves.",
  },
  "setup.teamDesc": {
    tr: "Masalar arası kıyasıya rekabet!",
    de: "Tisch gegen Tisch Wettkampf!",
    en: "Table vs. table showdown!",
  },
  "setup.languageLabel": { tr: "Dil Seçimi", de: "Sprachauswahl", en: "Language" },
  "setup.languageTR": { tr: "Türkçe", de: "Türkisch", en: "Turkish" },
  "setup.languageDE": { tr: "Almanca (Deutsch)", de: "Deutsch", en: "German (Deutsch)" },
  "setup.presetLabel": { tr: "Hızlı Preset", de: "Schnell-Vorlagen", en: "Quick Preset" },
  "setup.categoriesLabel": {
    tr: "Kategoriler (Virgülle Ayır)",
    de: "Kategorien (mit Komma trennen)",
    en: "Categories (Comma-Separated)",
  },
  "setup.categoriesPlaceholder": {
    tr: "Şehir, Ülke, İsim...",
    de: "Stadt, Land, Name...",
    en: "City, Country, Name...",
  },
  "setup.categoriesHint": {
    tr: "* 4-6 kategori en iyi oyun deneyimini sağlar.",
    de: "* 4-6 Kategorien bieten die beste Spielerfahrung.",
    en: "* 4-6 categories give the best game experience.",
  },
  "setup.startButton": {
    tr: (r: string) => `LOBİYİ AÇ (${r} TUR) →`,
    de: (r: string) => `LOBBY STARTEN (${r} RUNDEN) →`,
    en: (r: string) => `OPEN LOBBY (${r} ROUNDS) →`,
  },
  "setup.starting": { tr: "BAŞLATILIYOR...", de: "WIRD GESTARTET...", en: "STARTING..." },
  "setup.statusTitle": { tr: "Sistem Durumu", de: "Systemstatus", en: "System Status" },
  "setup.statusWaiting": { tr: "BEKLEMEDE", de: "WARTEND", en: "STANDBY" },
  "setup.statusDesc": {
    tr: "Oyun henüz başlatılmadı. Lobi oluşturmak için ana paneli kullanın.",
    de: "Das Spiel wurde noch nicht gestartet. Nutze das Hauptpanel um die Lobby zu erstellen.",
    en: "The game hasn't started yet. Use the main panel to create the lobby.",
  },
  "setup.scoringTitle": { tr: "Puanlama", de: "Punktevergabe", en: "Scoring" },
  "setup.scoreUnique": { tr: "Benzersiz cevap", de: "Einzigartige Antwort", en: "Unique answer" },
  "setup.scoreShared": { tr: "Paylaşılan cevap", de: "Geteilte Antwort", en: "Shared answer" },
  "setup.scoreEarly": {
    tr: "Erken teslim bonusu",
    de: "Frühzeitiger Abgabe-Bonus",
    en: "Early submit bonus",
  },
  "setup.historyTitle": { tr: "Son Oyunlar", de: "Letzte Spiele", en: "Recent Games" },
  "setup.historyEmpty": {
    tr: "Geçmiş bulunamadı",
    de: "Kein Verlauf gefunden",
    en: "No history found",
  },
  "setup.errorNoCategory": {
    tr: "Lütfen en az bir kategori girin.",
    de: "Bitte geben Sie mindestens eine Kategorie ein.",
    en: "Please enter at least one category.",
  },
  "setup.errorCreate": {
    tr: "Oda oluşturulurken bir hata oluştu: ",
    de: "Fehler beim Erstellen des Raums: ",
    en: "An error occurred while creating the room: ",
  },
  "setup.errorFirebase": {
    tr: "⚠️ Firebase bağlantı hatası! Proje erişilemez durumda. .env.local dosyasındaki VITE_FIREBASE_API_KEY değerini kontrol edin.",
    de: "⚠️ Firebase Verbindungsfehler! Projekt nicht erreichbar. Überprüfen Sie VITE_FIREBASE_API_KEY in .env.local.",
    en: "⚠️ Firebase connection error! The project is unreachable. Check the VITE_FIREBASE_API_KEY value in your .env.local file.",
  },

  // ═══════════════════════════════════════════
  // HOST LOBBY
  // ═══════════════════════════════════════════
  "lobby.title": { tr: "ATEŞ YAKILDI!", de: "DAS FEUER BRENNT!", en: "THE FIRE IS LIT!" },
  "lobby.subtitle": {
    tr: (rounds: number) =>
      `Oyun başlıyor. Bu heyecan verici meydan okuma ${rounds} tur sürecek.`,
    de: (rounds: number) =>
      `Das Spiel beginnt. Diese Herausforderung dauert ${rounds} Runden.`,
    en: (rounds: number) =>
      `The game is starting. This exciting challenge will last ${rounds} rounds.`,
  },
  "lobby.roomCode": { tr: "ODA GİRİŞ KODU", de: "RAUM-CODE", en: "ROOM CODE" },
  "lobby.connect": { tr: "BAĞLAN", de: "VERBINDEN", en: "CONNECT" },
  "lobby.categories": { tr: "KATEGORİLER", de: "KATEGORIEN", en: "CATEGORIES" },
  "lobby.active": { tr: "AKTİF", de: "AKTIV", en: "ACTIVE" },
  "lobby.noCategories": {
    tr: "Kategori seçilmedi...",
    de: "Keine Kategorien gewählt...",
    en: "No categories selected...",
  },
  "lobby.newCategory": { tr: "Yeni Kategori...", de: "Neue Kategorie...", en: "New Category..." },
  "lobby.teamReady": { tr: "Takım Kayıtlı", de: "Teams Bereit", en: "Team Registered" },
  "lobby.playerReady": { tr: "Savaşçı Hazır", de: "Krieger Bereit", en: "Warrior Ready" },
  "lobby.startGame": { tr: "OYUNU BAŞLAT →", de: "SPIEL STARTEN →", en: "START GAME →" },
  "lobby.noCategory": { tr: "Kategori Eksik!", de: "Kategorien Fehlen!", en: "Missing Category!" },
  "lobby.networkConnected": { tr: "> AĞA_BAĞLANILDI", de: "> NETZWERK_VERBUNDEN", en: "> NETWORK_CONNECTED" },
  "lobby.waitingSystems": {
    tr: "Diğer sistemler bekleniyor. Veri akışı başlamak üzere...",
    de: "Warte auf andere Systeme. Datenfluss beginnt in Kürze...",
    en: "Waiting for other systems. Data flow starting shortly...",
  },

  // ═══════════════════════════════════════════
  // HOST PLAYING
  // ═══════════════════════════════════════════
  "playing.seconds": { tr: "Saniye", de: "Sekunden", en: "Seconds" },
  "playing.category": { tr: "KATEGORİ", de: "KATEGORIE", en: "CATEGORY" },
  "playing.answered": {
    tr: "Oyuncu Cevapladı",
    de: "Spieler haben geantwortet",
    en: "Players Answered",
  },

  // ═══════════════════════════════════════════
  // HOST REVIEW
  // ═══════════════════════════════════════════
  "review.cognitiveAccuracy": {
    tr: "Bilişsel Doğruluk",
    de: "Kognitive Genauigkeit",
    en: "Cognitive Accuracy",
  },
  "review.groupAverage": { tr: "Grup Ortalaması", de: "Gruppendurchschnitt", en: "Group Average" },
  "review.originalityDensity": {
    tr: "Özgünlük Yoğunluğu",
    de: "Originalitätsdichte",
    en: "Originality Density",
  },
  "review.uniquePerPlayer": {
    tr: "Unik Cevap / Oyuncu",
    de: "Einzigartige Antwort / Spieler",
    en: "Unique Answer / Player",
  },
  "review.mentalPerformance": {
    tr: "Zihinsel Performans",
    de: "Mentale Leistung",
    en: "Mental Performance",
  },
  "review.analyzing": {
    tr: "PUANLAR ANALİZ EDİLİYOR",
    de: "PUNKTE WERDEN ANALYSIERT",
    en: "ANALYZING SCORES",
  },
  "review.measuring": {
    tr: "Zihinlerin ateşi ölçülüyor...",
    de: "Das Feuer der Geister wird gemessen...",
    en: "Measuring the fire of minds...",
  },
  "review.roundSummary": {
    tr: (r: number) => `TUR ${r} ÖZETİ`,
    de: (r: number) => `RUNDE ${r} ZUSAMMENFASSUNG`,
    en: (r: number) => `ROUND ${r} SUMMARY`,
  },
  "review.systemAnalyzed": {
    tr: "Sistem Puanları Analiz Etti",
    de: "Das System hat die Punkte analysiert",
    en: "The System Has Analyzed the Scores",
  },
  "review.teamRanking": { tr: "Takım Sıralaması", de: "Team-Rangliste", en: "Team Ranking" },
  "review.overallRanking": { tr: "Genel Sıralama", de: "Gesamt-Rangliste", en: "Overall Ranking" },
  "review.thisRound": {
    tr: (p: number) => `Bu Tur: +${p} Puan`,
    de: (p: number) => `Diese Runde: +${p} Punkte`,
    en: (p: number) => `This Round: +${p} Points`,
  },
  "review.rank": {
    tr: (r: number) => `SIRA #${r}`,
    de: (r: number) => `RANG #${r}`,
    en: (r: number) => `RANK #${r}`,
  },
  "review.categoryAnalysis": {
    tr: "Kategori Analizi",
    de: "Kategorie-Analyse",
    en: "Category Analysis",
  },
  "review.approve": { tr: "ONAYLA", de: "BESTÄTIGEN", en: "APPROVE" },
  "review.reject": { tr: "REDDET", de: "ABLEHNEN", en: "REJECT" },
  "review.empty": { tr: "BOŞ", de: "LEER", en: "EMPTY" },
  "review.points": {
    tr: (p: number) => `+${p} Puan`,
    de: (p: number) => `+${p} Punkte`,
    en: (p: number) => `+${p} Points`,
  },
  "review.uniqueBonus": { tr: "(Benzersiz)", de: "(Einzigartig)", en: "(Unique)" },
  "review.hostRejected": { tr: "HOST REDDETTİ", de: "VOM HOST ABGELEHNT", en: "REJECTED BY HOST" },
  "review.invalidLetter": { tr: "GEÇERSİZ HARF", de: "UNGÜLTIGER BUCHSTABE", en: "INVALID LETTER" },
  "review.speedBonusTitle": {
    tr: "GÜMÜŞ FİŞEK YOLCUSU (HIZ BONUSU)",
    de: "SILBERKUGEL (GESCHWINDIGKEITSBONUS)",
    en: "SILVER BULLET RIDER (SPEED BONUS)",
  },
  "review.speedBonusDesc": {
    tr: (n: string) => `${n} önce ateşledi!`,
    de: (n: string) => `${n} hat zuerst gefeuert!`,
    en: (n: string) => `${n} fired first!`,
  },
  "review.seeResults": { tr: "SONUÇLARI GÖR →", de: "ERGEBNISSE ANSEHEN →", en: "SEE RESULTS →" },
  "review.nextRound": { tr: "SONRAKİ TURA GEÇ →", de: "NÄCHSTE RUNDE →", en: "NEXT ROUND →" },
  "review.persona.sprinter": { tr: "Hızlı Çita", de: "Sprinter", en: "Fast Cheetah" },
  "review.persona.innovator": { tr: "İnovatör", de: "Innovator", en: "Innovator" },
  "review.persona.sniper": { tr: "Keskin Nişancı", de: "Scharfschütze", en: "Sharpshooter" },
  "review.persona.strategist": { tr: "Stratejist", de: "Stratege", en: "Strategist" },
  "review.persona.ghost": { tr: "Gölge", de: "Schatten", en: "Shadow" },
  "review.silverBullet": { tr: "Gümüş Fişek", de: "Silberkugel", en: "Silver Bullet" },

  // ═══════════════════════════════════════════
  // PODIUM
  // ═══════════════════════════════════════════
  "podium.title": { tr: "ŞAMPİYONLAR", de: "CHAMPIONS", en: "CHAMPIONS" },
  "podium.awardsTitle": { tr: "OYUNUN EN'LERİ", de: "DIE BESTEN DES SPIELS", en: "BEST OF THE GAME" },
  "podium.creativeTitle": { tr: "MİTİK YARATICI", de: "MYTHISCHER KREATIVER", en: "MYTHIC CREATOR" },
  "podium.creativeDesc": {
    tr: "En Yenilikçi Karakter",
    de: "Innovativster Charakter",
    en: "Most Innovative Character",
  },
  "podium.creativeCount": {
    tr: "Benzersiz Cevap",
    de: "Einzigartige Antworten",
    en: "Unique Answers",
  },
  "podium.creativeNone": {
    tr: "Herkes kopyacıydı!",
    de: "Alle haben abgeschrieben!",
    en: "Everyone was a copycat!",
  },
  "podium.speedTitle": { tr: "ATEŞİN OĞLU", de: "SOHN DES FEUERS", en: "SON OF FIRE" },
  "podium.speedDesc": { tr: "Fırtına Gemi Kaptanı", de: "Sturmkapitän", en: "Storm Ship Captain" },
  "podium.speedCount": { tr: "Hız Bonusu", de: "Geschwindigkeitsbonus", en: "Speed Bonus" },
  "podium.speedNone": {
    tr: "Kimse acele etmedi.",
    de: "Niemand hat sich beeilt.",
    en: "Nobody rushed.",
  },
  "podium.ghostTitle": { tr: "LOBİ HAYALETİ", de: "LOBBY-GEIST", en: "LOBBY GHOST" },
  "podium.ghostDesc": {
    tr: "Boş Kağıt Uzmanı",
    de: "Experte für leere Blätter",
    en: "Blank Paper Expert",
  },
  "podium.ghostCount": { tr: "Boş Cevap", de: "Leere Antworten", en: "Blank Answers" },
  "podium.ghostNone": { tr: "Kağıtlar ful dolu!", de: "Alle Blätter voll!", en: "Every sheet was full!" },
  "podium.newGame": { tr: "Yeni Oyun Başlat", de: "Neues Spiel starten", en: "Start New Game" },

  // ═══════════════════════════════════════════
  "standings.pointsThisRound": { tr: "Bu Tur", de: "Diese Runde", en: "This Round" },

  // STANDINGS (Mid-game Leaderboard)
  // ═══════════════════════════════════════════
  "standings.title": { tr: "GÜNCEL PUAN DURUMU", de: "AKTUELLE PLATZIERUNG", en: "CURRENT STANDINGS" },
  "standings.nextRound": { tr: "SONRAKİ TUR", de: "NÄCHSTE RUNDE", en: "NEXT ROUND" },
  "standings.finishGame": { tr: "OYUNU BİTİR", de: "SPIEL BEENDEN", en: "FINISH GAME" },
  "standings.playerTitle": { tr: "PUAN DURUMU EKRANDA", de: "PUNKTESTAND AUF DEM BILDSCHIRM", en: "STANDINGS ON SCREEN" },
  "standings.playerDesc": {
    tr: "Liderlik tablosu için ana ekrana (TV) bak. Sonraki raunt birazdan başlayacak.",
    de: "Schau auf den Hauptbildschirm für die Rangliste. Die nächste Runde beginnt bald.",
    en: "Check the main screen (TV) for the leaderboard. The next round starts shortly.",
  },

  // ═══════════════════════════════════════════
  // AUTH & LEADERBOARD
  // ═══════════════════════════════════════════
  "auth.login": { tr: "Giriş Yap", de: "Anmelden", en: "Log In" },
  "auth.register": { tr: "Kayıt Ol", de: "Registrieren", en: "Register" },
  "auth.email": { tr: "E-posta", de: "E-Mail", en: "Email" },
  "auth.password": { tr: "Şifre", de: "Passwort", en: "Password" },
  "auth.noAccount": { tr: "Hesabın yok mu?", de: "Noch kein Konto?", en: "Don't have an account?" },
  "auth.haveAccount": {
    tr: "Zaten hesabın var mı?",
    de: "Hast du bereits ein Konto?",
    en: "Already have an account?",
  },
  "auth.welcomeBack": {
    tr: "Hoş Geldin, Savaşçı",
    de: "Willkommen zurück, Krieger",
    en: "Welcome Back, Warrior",
  },
  "auth.joinLeague": {
    tr: "Efsaneler Ligine Katıl",
    de: "Tritt der Legenden-Liga bei",
    en: "Join the Legends League",
  },
  "leaderboard.title": {
    tr: "HAFTALIK ŞAMPİYONLAR",
    de: "WÖCHENTLICHE CHAMPIONS",
    en: "WEEKLY CHAMPIONS",
  },
  "leaderboard.subtitle": {
    tr: "Zirvedeki Zihinler",
    de: "Die klügsten Köpfe an der Spitze",
    en: "The Sharpest Minds at the Top",
  },
  "leaderboard.rank": { tr: "SIRA", de: "RANG", en: "RANK" },
  "leaderboard.player": { tr: "OYUNCU", de: "SPIELER", en: "PLAYER" },
  "leaderboard.score": { tr: "TOPLAM PUAN", de: "GESAMTPUNKTZAHL", en: "TOTAL SCORE" },
  "leaderboard.back": { tr: "← GERİ DÖN", de: "← ZURÜCK", en: "← BACK" },
  "leaderboard.thisWeek": { tr: "BU HAFTA", de: "DIESE WOCHE", en: "THIS WEEK" },
  "leaderboard.allTime": { tr: "TÜM ZAMANLAR", de: "ALLE ZEITEN", en: "ALL TIME" },
  "podium.individual": { tr: "Bireysel", de: "Einzelspieler", en: "Solo" },

  // ═══════════════════════════════════════════
  // PLAYER JOIN
  // ═══════════════════════════════════════════
  "join.roomCode": { tr: "Oda Kodu", de: "Raum-Code", en: "Room Code" },
  "join.roomPlaceholder": { tr: "ÖRN: 4X9B", de: "z.B.: 4X9B", en: "E.G.: 4X9B" },
  "join.nickname": { tr: "Nickname", de: "Nickname", en: "Nickname" },
  "join.nicknamePlaceholder": { tr: "Efsane Oyuncu", de: "Legendärer Spieler", en: "Legendary Player" },
  "join.nicknamePlaceholderShort": { tr: "SAVAŞÇI", de: "KRIEGER", en: "WARRIOR" },
  "join.teamLabel": { tr: "Masa No / Takım Adı", de: "Tisch Nr. / Teamname", en: "Table No. / Team Name" },
  "join.teamPlaceholder": {
    tr: "Masa 5 / Mavi Takım",
    de: "Tisch 5 / Blaues Team",
    en: "Table 5 / Blue Team",
  },
  "join.teamPlaceholderShort": { tr: "TAKIM ADI", de: "TEAMNAME", en: "TEAM NAME" },
  "join.terminalHeader": { tr: "HENGAME_SYS // TERMİNAL_v2.1", de: "HENGAME_SYS // TERMINAL_v2.1", en: "HENGAME_SYS // TERMINAL_v2.1" },
  "join.terminalFooter": { tr: "HENGAME ARENA // NO SYSTEM IS SAFE", de: "HENGAME ARENA // KEIN SYSTEM IST SICHER", en: "HENGAME ARENA // NO SYSTEM IS SAFE" },
  "join.connecting": {
    tr: "BAĞLANILIYOR...",
    de: "VERBINDUNG WIRD HERGESTELLT...",
    en: "CONNECTING...",
  },
  "join.submit": { tr: "SAVAŞA KATIL", de: "AM KAMPF TEILNEHMEN", en: "JOIN THE BATTLE" },
  "join.errorNoRoom": {
    tr: "Oda bulunamadı. Lütfen TV ekranındaki kodu kontrol edin.",
    de: "Raum nicht gefunden. Bitte den Code auf dem TV-Bildschirm überprüfen.",
    en: "Room not found. Please check the code on the TV screen.",
  },
  "join.errorStarted": {
    tr: "Bu odaya şu an giriş yapılamaz (Oyun çoktan başlamış).",
    de: "Dieser Raum ist nicht mehr betretbar (Spiel hat bereits begonnen).",
    en: "This room can't be joined right now (the game has already started).",
  },
  "join.errorPlayer": {
    tr: "Oyuncu kaydı oluşturulamadı: ",
    de: "Spielerregistrierung fehlgeschlagen: ",
    en: "Could not create player profile: ",
  },
  "join.errorGeneral": {
    tr: "Beklenmeyen bir hata oluştu.",
    de: "Ein unerwarteter Fehler ist aufgetreten.",
    en: "An unexpected error occurred.",
  },
  "join.errorNickname": {
    tr: "Bu takma ad kullanılamaz. Lütfen başka bir ad seçin.",
    de: "Dieser Spitzname ist nicht zulässig. Bitte einen anderen wählen.",
    en: "This nickname isn't allowed. Please choose another one.",
  },

  // ═══════════════════════════════════════════
  // PLAYER GAME
  // ═══════════════════════════════════════════
  "game.roomClosed": { tr: "ODA KAPALI", de: "RAUM GESCHLOSSEN", en: "ROOM CLOSED" },
  "game.roomClosedDesc": {
    tr: "Bu oyun odası host tarafından kapatıldı.",
    de: "Dieser Raum wurde vom Moderator geschlossen.",
    en: "This game room was closed by the host.",
  },
  "game.backHome": { tr: "ANA SAYFAYA DÖN", de: "ZURÜCK ZUR STARTSEITE", en: "BACK TO HOME" },
  "game.player": { tr: "Oyuncu", de: "Spieler", en: "Player" },
  "game.submitting": { tr: "GÖNDERİLİYOR...", de: "WIRD GESENDET...", en: "SENDING..." },
  "game.submitEarly": {
    tr: "BİTİRDİM! (ERKEN BONUSU)",
    de: "FERTIG! (FRÜHBONUS)",
    en: "DONE! (EARLY BONUS)",
  },
  "game.earlyHint": {
    tr: "NE KADAR ERKEN, O KADAR PUAN!",
    de: "JE SCHNELLER, DESTO MEHR PUNKTE!",
    en: "THE EARLIER, THE MORE POINTS!",
  },
  "game.submitError": {
    tr: "Cevaplar gönderilemedi. Lütfen tekrar deneyin.",
    de: "Antworten konnten nicht gesendet werden. Bitte erneut versuchen.",
    en: "Could not submit answers. Please try again.",
  },

  // ═══════════════════════════════════════════
  // CATEGORY PRESETS (German defaults)
  // ═══════════════════════════════════════════
  "categories.default": {
    tr: "Şehir, Ülke, İsim, Eşya, Hayvan",
    de: "Stadt, Land, Name, Gegenstand, Tier",
    en: "City, Country, Name, Object, Animal",
  },
} as const;

type TranslationKey = keyof typeof translations;
type TranslationValue = string | ((...args: (string | number)[]) => string);

// ───────── STATE MANAGEMENT ─────────
// Açılış varsayılanı Almanca: bu ürün önce Almanya'daki mekanlara
// pazarlanıyor, host/oyuncu ilk açılışta ekstra tıklama yapmadan kendi
// dilini görmeli. Daha önce ziyaret edip başka bir dil seçmiş kullanıcının
// tercihi localStorage'dan (varsa) önceliklidir.
const DEFAULT_LOCALE: Locale = "de";

let currentLocale: Locale =
  typeof window !== "undefined"
    ? (localStorage.getItem("alaz_neon_locale") as Locale) || DEFAULT_LOCALE
    : DEFAULT_LOCALE;

// index.html varsayılan olarak lang="tr" ile geliyor; açılış dili farklıysa
// (artık Almanca) burada anında düzeltiyoruz. Kullanıcı daha önce başka bir
// dil seçtiyse açılışta onu yansıtır (bkz. setLocale'deki not).
if (typeof window !== "undefined") {
  document.documentElement.lang = currentLocale;
}

export function getLocale(): Locale {
  return currentLocale;
}

// `LanguageSwitcher` artık host header'dan oyuncu katılım ekranına kadar
// birçok yerde, HER SEFERİNDE KENDİ useLocale() çağrısıyla kullanılıyor.
// Eskiden useLocale() dili düz bir useState ile tutuyordu — bir bileşenin
// switchLocale çağırması yalnızca KENDİ yerel state'ini güncelliyordu,
// aynı sayfadaki BAŞKA bir useLocale() örneği (asıl çevrilen metni basan
// bileşen) bundan habersiz kalıp yeniden render olmuyordu: dil değişiyor
// gibi görünüyor ama ekrandaki metin eskisi kalıyordu. Bu dinleyici listesi
// useLocale()'in useSyncExternalStore ile paylaşılan tek bir kaynağa
// abone olmasını sağlıyor — DatabaseStatus.tsx'teki navigator.onLine
// deseniyle aynı çözüm.
const listeners = new Set<() => void>();

export function subscribeLocale(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("alaz_neon_locale", locale);
    // <html lang> arayüz için kozmetik değil: CSS `text-transform: uppercase`
    // dile göre çalışıyor ve arayüz büyük harf ağırlıklı. Yanlış dilde
    // "Giriş" → "GIRIŞ" (noktasız I) çıkıyor, Türkçede doğrusu "GİRİŞ".
    document.documentElement.lang = locale;
  }
  listeners.forEach((callback) => callback());
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
