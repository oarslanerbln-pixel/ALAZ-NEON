/**
 * HENGAME ARENA — Internationalization (i18n) System
 * Supports: German (de), Turkish (tr), English (en)
 */

export type Locale = "tr" | "de" | "en";

const translations = {
  // ═══════════════════════════════════════════
  // LANDING PAGE
  // ═══════════════════════════════════════════
  "common.back": { tr: "ANA SAYFA", de: "STARTSEITE", en: "HOME" },
  // Dashboard'daki çıkış düğmesi odayı kapatıyor: "ana sayfa" demek yanıltıyordu.
  "common.endNight": { tr: "GECEYİ BİTİR", de: "NACHT BEENDEN", en: "END NIGHT" },
  "common.returnToLobby": { tr: "LOBİYE DÖN", de: "ZUR LOBBY", en: "LOBBY" },
  "common.confirmReturnLobby": { tr: "Mevcut oyunu bitirip lobiye dönmek istiyor musunuz?", de: "Möchtest du das aktuelle Spiel beenden und zur Lobby zurückkehren?", en: "Do you want to end the game and return to lobby?" },
  "common.confirmExitHome": {
    tr: "Ana sayfaya dönülsün mü? Oda açık kalır, misafirler düşmez; ana sayfadaki \"Son odaya devam\" ile aynı koda geri dönebilirsiniz.",
    de: "Zur Startseite wechseln? Der Raum bleibt offen und die Gäste bleiben verbunden; mit \"Letzten Raum fortsetzen\" kommst du zum selben Code zurück.",
    en: "Go to the home screen? The room stays open and guests stay connected; use \"Resume last room\" to get back to the same code.",
  },
  "landing.resumeRoom": {
    tr: (code: string) => `SON ODAYA DEVAM · ${code}`,
    de: (code: string) => `LETZTEN RAUM FORTSETZEN · ${code}`,
    en: (code: string) => `RESUME LAST ROOM · ${code}`,
  },
  "landing.resumeRoomHint": {
    tr: "Misafirler QR'ı yeniden okutmak zorunda kalmaz",
    de: "Gäste müssen den QR-Code nicht erneut scannen",
    en: "Guests don't need to scan the QR code again",
  },
  "common.confirmEndNight": {
    tr: "Geceyi bitirip odayı kapatmak istediğinizden emin misiniz? Misafirler oyundan çıkarılacak.",
    de: "Möchtest du den Abend beenden und den Raum schließen? Die Gäste werden aus dem Spiel entfernt.",
    en: "End the night and close the room? Guests will be removed from the game.",
  },
  "common.leaveGame": { tr: "AYRIL", de: "VERLASSEN", en: "LEAVE" },
  "common.confirmLeaveGame": { tr: "Oyundan ayrılmak istediğinizden emin misiniz?", de: "Bist du sicher, dass du das Spiel verlassen möchtest?", en: "Are you sure you want to leave the game?" },
  "common.cancel": { tr: "İPTAL", de: "ABBRECHEN", en: "CANCEL" },
  "common.offline": { tr: "BAĞLANTI KOPTU, YENİDEN BAĞLANILIYOR...", de: "VERBINDUNG VERLOREN, VERBINDE NEU...", en: "CONNECTION LOST, RECONNECTING..." },
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
  "landing.subtitle": {
    tr: "Ready for the ultimate mythical challenge?",
    de: "Bereit für die ultimative Herausforderung?",
    en: "Ready for the ultimate mythical challenge?",
  },
  "attract.scanToJoin": { tr: "QR KODU OKUT", de: "QR-CODE SCANNEN", en: "SCAN QR CODE" },

  // ═══════════════════════════════════════════
  // HOST SETUP
  // ═══════════════════════════════════════════
  "setup.title": { tr: "OTURUM AYARLARI", de: "SITZUNGSEINSTELLUNGEN", en: "SESSION SETTINGS" },
  "setup.subtitle": {
    tr: "Tüm oyunlar için geçerli varsayılan süreyi ve tur sayısını belirle.",
    de: "Lege die Standardzeit und Rundenanzahl für alle Spiele fest.",
    en: "Set the default time and round count for all games.",
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
  "setup.startNight": { tr: "GECEYİ BAŞLAT →", de: "SITZUNG STARTEN →", en: "START NIGHT →" },
  "setup.scoringTitle": { tr: "Puanlama", de: "Punktevergabe", en: "Scoring" },
  "setup.scoreUnique": { tr: "Benzersiz cevap", de: "Einzigartige Antwort", en: "Unique answer" },
  "setup.scoreShared": { tr: "Paylaşılan cevap", de: "Geteilte Antwort", en: "Shared answer" },
  "setup.scoreEarly": {
    tr: "Erken teslim bonusu",
    de: "Frühzeitiger Abgabe-Bonus",
    en: "Early submit bonus",
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
  "lobby.nightTitle": { tr: "Gecenin sıralaması", de: "Rangliste des Abends", en: "Tonight's standings" },
  "lobby.nightRank": {
    tr: (r: number, n: number) => `${r}. / ${n}`,
    de: (r: number, n: number) => `Platz ${r} / ${n}`,
    en: (r: number, n: number) => `#${r} of ${n}`,
  },
  "lobby.nightPoints": {
    tr: (n: number) => `${n} gece puanı`,
    de: (n: number) => `${n} Nachtpunkte`,
    en: (n: number) => `${n} night points`,
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
  "lobby.readyTitle": { tr: "Hazırsın!", de: "Du bist dabei!", en: "You're in!" },
  "lobby.readyBody": {
    tr: "Oyun TV'de başlayınca bu ekran kumandana dönüşecek.",
    de: "Sobald das Spiel auf dem TV startet, wird dieser Bildschirm zu deinem Controller.",
    en: "When the game starts on the TV, this screen becomes your controller.",
  },
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
  "finale.title": { tr: "Gecenin Şampiyonu", de: "Champion des Abends", en: "Champion of the Night" },
  "finale.open": { tr: "Gecenin finali", de: "Finale des Abends", en: "Night finale" },
  "finale.points": {
    tr: (n: number) => `${n} gece puanı`,
    de: (n: number) => `${n} Nachtpunkte`,
    en: (n: number) => `${n} night points`,
  },
  "finale.empty": { tr: "Bu gece henüz puan dağıtılmadı.", de: "Heute Abend wurden noch keine Punkte vergeben.", en: "No points awarded tonight yet." },
  "finale.back": { tr: "Geri dön", de: "Zurück", en: "Back" },
  "finale.endNight": { tr: "Geceyi bitir", de: "Abend beenden", en: "End the night" },
  "podium.nightPoints": {
    tr: (n: number) => `+${n} gece puanı`,
    de: (n: number) => `+${n} Nachtpunkte`,
    en: (n: number) => `+${n} night points`,
  },
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
  "auth.email": { tr: "E-posta", de: "E-Mail", en: "Email" },
  "auth.password": { tr: "Şifre", de: "Passwort", en: "Password" },
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
  // ═══════════════════════════════════════════
  // GİRİŞ SAYFASI DÖNÜŞÜ & PODYUM
  // ═══════════════════════════════════════════
  "leaderboard.back": { tr: "ANA SAYFAYA DÖN", de: "ZUR STARTSEITE", en: "BACK TO HOME" },
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
  "join.welcomeBack": {
    tr: (name: string) => `TEKRAR HOŞ GELDİN, ${name}`,
    de: (name: string) => `WILLKOMMEN ZURÜCK, ${name}`,
    en: (name: string) => `WELCOME BACK, ${name}`,
  },
  "join.resuming": {
    tr: "Puanınla kaldığın yerden devam ediyorsun...",
    de: "Du machst mit deinen Punkten weiter...",
    en: "Picking up where you left off, points included...",
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

  // ═══════════════════════════════════════════
  // COMMON / SHELL
  // ═══════════════════════════════════════════
  "common.loading": { tr: "YÜKLENİYOR...", de: "WIRD GELADEN...", en: "LOADING..." },

  // ═══════════════════════════════════════════
  // ROOM STATUS (siyah ekran yerine oda yükleme/hata durumları)
  // ═══════════════════════════════════════════
  "roomStatus.loadingTitle": { tr: "ODA YÜKLENİYOR", de: "RAUM WIRD GELADEN", en: "LOADING ROOM" },
  "roomStatus.loadingBody": {
    tr: "Firestore bağlantısı kuruluyor...",
    de: "Firestore-Verbindung wird aufgebaut...",
    en: "Establishing Firestore connection...",
  },
  "roomStatus.notfoundTitle": { tr: "ODA BULUNAMADI", de: "RAUM NICHT GEFUNDEN", en: "ROOM NOT FOUND" },
  "roomStatus.notfoundBody": {
    tr: "Bu oda silinmiş olabilir ya da adres hatalı. Yeni bir oda açman gerekiyor.",
    de: "Dieser Raum wurde eventuell gelöscht oder die Adresse ist falsch. Erstelle einen neuen Raum.",
    en: "This room may have been deleted, or the link is wrong. You'll need to open a new room.",
  },
  "roomStatus.errorTitle": { tr: "BAĞLANTI HATASI", de: "VERBINDUNGSFEHLER", en: "CONNECTION ERROR" },
  "roomStatus.errorBody": {
    tr: "Firestore'a erişilemedi. Güvenlik kuralları, internet bağlantısı veya kota sınırını kontrol et.",
    de: "Firestore konnte nicht erreicht werden. Prüfe Sicherheitsregeln, Internetverbindung oder Kontingent.",
    en: "Couldn't reach Firestore. Check the security rules, your internet connection, or the quota limit.",
  },
  "roomStatus.newRoom": { tr: "Yeni Oda Aç", de: "Neuen Raum erstellen", en: "Open New Room" },
  "roomStatus.retry": { tr: "Tekrar Dene", de: "Erneut versuchen", en: "Retry" },
  // Misafir telefonu için aynı durumlar — host metinleri (Firestore, kurallar,
  // "yeni oda aç") misafire bir şey ifade etmiyor.
  "roomStatus.playerLoadingBody": {
    tr: "Oyuna bağlanılıyor...",
    de: "Verbindung zum Spiel wird hergestellt...",
    en: "Connecting to the game...",
  },
  "roomStatus.playerNotfoundBody": {
    tr: "Bu oda artık yok ya da bağlantı eski. Masadaki QR kodu yeniden okut.",
    de: "Diesen Raum gibt es nicht mehr oder der Link ist veraltet. Scanne den QR-Code am Tisch erneut.",
    en: "This room no longer exists or the link is outdated. Scan the QR code at your table again.",
  },
  "roomStatus.playerErrorBody": {
    tr: "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.",
    de: "Keine Verbindung möglich. Prüfe dein Internet und versuche es erneut.",
    en: "Couldn't connect. Check your internet and try again.",
  },
  "roomStatus.playerMissingTitle": { tr: "KAYDIN BULUNAMADI", de: "SPIELER NICHT GEFUNDEN", en: "PLAYER NOT FOUND" },
  "roomStatus.playerMissingBody": {
    tr: "Bu odadaki oyuncu kaydına ulaşılamadı. Aynı kodla yeniden katılabilirsin.",
    de: "Dein Spielerprofil in diesem Raum wurde nicht gefunden. Du kannst mit demselben Code erneut beitreten.",
    en: "We couldn't find your player entry in this room. You can rejoin with the same code.",
  },
  "roomStatus.joinRoom": { tr: "Odaya Katıl", de: "Raum beitreten", en: "Join Room" },

  // ═══════════════════════════════════════════
  // MISC CHROME (XP bar, emoji toolbar, hold button, player header)
  // ═══════════════════════════════════════════
  "xpBar.roundProgress": { tr: "TUR İLERLEMESİ", de: "RUNDENFORTSCHRITT", en: "ROUND PROGRESS" },
  "playerHeader.critical": { tr: "⚡ KRİTİK", de: "⚡ KRITISCH", en: "⚡ CRITICAL" },
  "playerHeader.active": { tr: "◉ AKTİF", de: "◉ AKTIV", en: "◉ ACTIVE" },
  "playerHeader.points": { tr: "PUAN", de: "PUNKTE", en: "POINTS" },
  "playerHeader.round": { tr: "TUR", de: "RUNDE", en: "ROUND" },
  "playerHeader.letter": { tr: "HARF", de: "BUCHSTABE", en: "LETTER" },
  // Ses düğmesi ikon-only: ekran okuyucu için erişilebilir ada ihtiyacı var.
  // Etiket eylemi anlatıyor ("sesi aç"), durumu değil — düğmeye basınca ne
  // olacağını söylemek, o anki durumu okumaktan daha yararlı.
  "common.soundOn": { tr: "Sesi aç", de: "Ton einschalten", en: "Turn sound on" },
  "common.soundOff": { tr: "Sesi kapat", de: "Ton ausschalten", en: "Turn sound off" },
  // Dil seçicinin düğmeleri kendi dillerinde ("Deutsch", "Türkçe"),
  // yani gruba gelen ekran okuyucu bunların ne olduğunu ancak grup
  // adından anlıyor.
  "common.languageSwitcher": { tr: "Arayüz dili", de: "Anzeigesprache", en: "Interface language" },
  "playerHeader.submittingAnswers": {
    tr: "Cevaplar Gönderiliyor...",
    de: "Antworten werden gesendet...",
    en: "Sending answers...",
  },

  // ═══════════════════════════════════════════
  // SHAREABLE RECAP CARD (paylaşılabilir gece özeti)
  // ═══════════════════════════════════════════
  "recap.title": { tr: "GECENİN ENLERİ", de: "HIGHLIGHTS DES ABENDS", en: "BEST OF THE NIGHT" },
  "recap.aiVerdict": { tr: "Jules AI Kararı", de: "Jules-KI-Urteil", en: "Jules AI Verdict" },
  "recap.joinCta": { tr: "Sen de katıl!", de: "Mach auch mit!", en: "Join in too!" },

  // ═══════════════════════════════════════════
  // PLAYER PROFILE CARD
  // ═══════════════════════════════════════════
  "profile.idCard": { tr: "HENGAME ID CARD", de: "HENGAME AUSWEIS", en: "HENGAME ID CARD" },
  "profile.totalScore": { tr: "Toplam Puan", de: "Gesamtpunktzahl", en: "Total Score" },
  "profile.logout": { tr: "ÇIKIŞ YAP", de: "ABMELDEN", en: "LOG OUT" },
  "profile.tier.BRONZE": { tr: "BRONZ LİG", de: "BRONZE-LIGA", en: "BRONZE LEAGUE" },
  "profile.tier.SILVER": { tr: "GÜMÜŞ LİG", de: "SILBER-LIGA", en: "SILVER LEAGUE" },
  "profile.tier.GOLD": { tr: "ALTIN LİG", de: "GOLD-LIGA", en: "GOLD LEAGUE" },
  "profile.tier.PLATINUM": { tr: "PLATİN LİG", de: "PLATIN-LIGA", en: "PLATINUM LEAGUE" },
  "profile.tier.NEON": { tr: "NEON LİG", de: "NEON-LIGA", en: "NEON LEAGUE" },
  "profile.tier.LEGEND": { tr: "EFSANE LİG", de: "LEGENDEN-LIGA", en: "LEGEND LEAGUE" },

  // ═══════════════════════════════════════════
  // REWARDS
  // ═══════════════════════════════════════════
  "rewards.none": {
    tr: "KULLANILABİLİR ÖDÜL BULUNMUYOR",
    de: "KEINE VERFÜGBAREN PRÄMIEN",
    en: "NO REWARDS AVAILABLE",
  },
  "rewards.active": { tr: "AKTİF ÖDÜLLER", de: "AKTIVE PRÄMIEN", en: "ACTIVE REWARDS" },
  "rewards.use": { tr: "KULLAN", de: "EINLÖSEN", en: "USE" },
  "rewards.close": { tr: "Kapat", de: "Schließen", en: "Close" },
  "rewards.codeLabel": { tr: "Ödül Kodu", de: "Prämiencode", en: "Reward Code" },
  "rewards.showAtCounter": {
    tr: "Barda bu ekranı göster",
    de: "Zeig diesen Bildschirm an der Bar",
    en: "Show this screen at the counter",
  },
  "rewards.validUntil": {
    tr: (date: string) => `Son geçerlilik: ${date}`,
    de: (date: string) => `Gültig bis: ${date}`,
    en: (date: string) => `Valid until: ${date}`,
  },

  // ═══════════════════════════════════════════
  // REVIEW — otomatik ret sebepleri (host'a kısa etiket)
  // ═══════════════════════════════════════════
  "review.autoRejectProfane": { tr: "UYGUNSUZ İÇERİK", de: "UNANGEMESSENER INHALT", en: "INAPPROPRIATE CONTENT" },
  "review.autoRejectTooShort": { tr: "ÇOK KISA", de: "ZU KURZ", en: "TOO SHORT" },
  "review.autoRejectRepeatedLetters": { tr: "TEKRARLANAN HARF", de: "WIEDERHOLTER BUCHSTABE", en: "REPEATED LETTER" },
  "review.autoRejectKeyboardMash": { tr: "KLAVYE EZMESİ", de: "TASTATUR-WIRRWARR", en: "KEYBOARD MASH" },
  "review.autoRejectRepeatedPattern": { tr: "TEKRARLANAN KALIP", de: "WIEDERHOLTES MUSTER", en: "REPEATED PATTERN" },
  "review.autoRejectNoVowel": { tr: "ÜNLÜ HARF YOK", de: "KEIN VOKAL", en: "NO VOWEL" },
  "review.autoRejectConsonantRun": { tr: "ÜNSÜZ YIĞILMASI", de: "KONSONANTENHÄUFUNG", en: "CONSONANT PILEUP" },
  "review.autoRejectSuspicious": { tr: "ŞÜPHELİ CEVAP", de: "VERDÄCHTIGE ANTWORT", en: "SUSPICIOUS ANSWER" },
  "review.autoRejectForeign": {
    tr: (lang: string) => `OYUNUN DİLİNDE DEĞİL (${lang})`,
    de: (lang: string) => `NICHT IN DER SPIELSPRACHE (${lang})`,
    en: (lang: string) => `NOT IN THE GAME LANGUAGE (${lang})`,
  },
  "review.typoLabel": {
    tr: (suggestion: string) => `YAZIM HATASI → ${suggestion}`,
    de: (suggestion: string) => `TIPPFEHLER → ${suggestion}`,
    en: (suggestion: string) => `TYPO → ${suggestion}`,
  },
  "review.typoHalfPoints": { tr: "YARIM PUAN", de: "HALBE PUNKTE", en: "HALF POINTS" },
  "lang.tr": { tr: "Türkçe", de: "Türkisch", en: "Turkish" },
  "lang.de": { tr: "Almanca", de: "Deutsch", en: "German" },
  "lang.en": { tr: "İngilizce", de: "Englisch", en: "English" },
  "review.jokerPenalty": { tr: "-10 PUAN CEZASI", de: "-10 PUNKTE STRAFE", en: "-10 POINT PENALTY" },
  "review.autoRejectWrongCategory": { tr: "YANLIŞ KATEGORİ", de: "FALSCHE KATEGORIE", en: "WRONG CATEGORY" },
  "review.categoryReject.abstractNotObject": {
    tr: "SOYUT KAVRAM (EŞYA DEĞİL)",
    de: "ABSTRAKT (KEIN GEGENSTAND)",
    en: "ABSTRACT (NOT AN OBJECT)",
  },
  "review.categoryReject.animalNotObject": {
    tr: "HAYVAN (EŞYA DEĞİL)",
    de: "TIER (KEIN GEGENSTAND)",
    en: "ANIMAL (NOT AN OBJECT)",
  },
  "review.categoryReject.placeNotObject": {
    tr: "ŞEHİR/ÜLKE (EŞYA DEĞİL)",
    de: "ORT / STADT (KEIN GEGENSTAND)",
    en: "PLACE / CITY (NOT AN OBJECT)",
  },
  "review.categoryReject.objectNotAnimal": {
    tr: "EŞYA (HAYVAN DEĞİL)",
    de: "GEGENSTAND (KEIN TIER)",
    en: "OBJECT (NOT AN ANIMAL)",
  },
  "review.categoryReject.abstractNotAnimal": {
    tr: "SOYUT KAVRAM (HAYVAN DEĞİL)",
    de: "ABSTRAKT (KEIN TIER)",
    en: "ABSTRACT (NOT AN ANIMAL)",
  },
  "review.categoryReject.placeNotAnimal": {
    tr: "ŞEHİR/ÜLKE (HAYVAN DEĞİL)",
    de: "ORT / STADT (KEIN TIER)",
    en: "PLACE / CITY (NOT AN ANIMAL)",
  },
  "review.categoryReject.countryNotCity": {
    tr: "ÜLKE (ŞEHİR DEĞİL)",
    de: "LAND (KEINE STADT)",
    en: "COUNTRY (NOT A CITY)",
  },
  "review.categoryReject.animalNotCity": {
    tr: "HAYVAN (ŞEHİR DEĞİL)",
    de: "TIER (KEINE STADT)",
    en: "ANIMAL (NOT A CITY)",
  },
  "review.categoryReject.objectNotCity": {
    tr: "EŞYA (ŞEHİR DEĞİL)",
    de: "GEGENSTAND (KEINE STADT)",
    en: "OBJECT (NOT A CITY)",
  },
  "review.categoryReject.abstractNotCity": {
    tr: "SOYUT KAVRAM (ŞEHİR DEĞİL)",
    de: "ABSTRAKT (KEINE STADT)",
    en: "ABSTRACT (NOT A CITY)",
  },
  "review.categoryReject.cityNotCountry": {
    tr: "ŞEHİR (ÜLKE DEĞİL)",
    de: "STADT (KEIN LAND)",
    en: "CITY (NOT A COUNTRY)",
  },
  "review.categoryReject.animalNotCountry": {
    tr: "HAYVAN (ÜLKE DEĞİL)",
    de: "TIER (KEIN LAND)",
    en: "ANIMAL (NOT A COUNTRY)",
  },
  "review.categoryReject.objectNotCountry": {
    tr: "EŞYA (ÜLKE DEĞİL)",
    de: "GEGENSTAND (KEIN LAND)",
    en: "OBJECT (NOT A COUNTRY)",
  },
  "review.categoryReject.abstractNotCountry": {
    tr: "SOYUT KAVRAM (ÜLKE DEĞİL)",
    de: "ABSTRAKT (KEIN LAND)",
    en: "ABSTRACT (NOT A COUNTRY)",
  },
  "review.categoryReject.animalNotPlant": {
    tr: "HAYVAN (BİTKİ DEĞİL)",
    de: "TIER (KEINE PFLANZE)",
    en: "ANIMAL (NOT A PLANT)",
  },
  "review.categoryReject.objectNotPlant": {
    tr: "EŞYA (BİTKİ DEĞİL)",
    de: "GEGENSTAND (KEINE PFLANZE)",
    en: "OBJECT (NOT A PLANT)",
  },
  "review.categoryReject.abstractNotPlant": {
    tr: "SOYUT KAVRAM (BİTKİ DEĞİL)",
    de: "ABSTRAKT (KEINE PFLANZE)",
    en: "ABSTRACT (NOT A PLANT)",
  },
  "review.categoryReject.objectNotName": {
    tr: "EŞYA (KİŞİ ADI DEĞİL)",
    de: "GEGENSTAND (KEIN NAME)",
    en: "OBJECT (NOT A PERSON NAME)",
  },
  "review.categoryReject.abstractNotName": {
    tr: "SOYUT KAVRAM (KİŞİ ADI DEĞİL)",
    de: "ABSTRAKT (KEIN NAME)",
    en: "ABSTRACT (NOT A PERSON NAME)",
  },
  "review.categoryReject.genericWrongCategory": {
    tr: "YANLIŞ KATEGORİ",
    de: "FALSCHE KATEGORIE",
    en: "WRONG CATEGORY",
  },

  // ═══════════════════════════════════════════
  // HOST HEADER / LOBBY EXTRAS
  // ═══════════════════════════════════════════
  "hostHeader.endEarly": { tr: "ERKEN BİTİR", de: "VORZEITIG BEENDEN", en: "END EARLY" },
  "hostHeader.voiceOn": { tr: "Spikeri aç", de: "Moderator einschalten", en: "Turn announcer on" },
  "hostHeader.voiceOff": { tr: "Spikeri kapat", de: "Moderator ausschalten", en: "Turn announcer off" },
  "hostHeader.roundLabel": {
    tr: (r: number, total: number) => `TUR ${r} / ${total}`,
    de: (r: number, total: number) => `RUNDE ${r} / ${total}`,
    en: (r: number, total: number) => `ROUND ${r} / ${total}`,
  },
  "hostHeader.roomCode": { tr: "Oda Kodu", de: "Raum-Code", en: "Room Code" },
  "hostLobby.cancelCountdown": {
    tr: "Geri Sayımı İptal Et",
    de: "Countdown abbrechen",
    en: "Cancel Countdown",
  },

  // ═══════════════════════════════════════════
  // LANDING PAGE — rol seçimi ve mod vitrin kartları
  // ═══════════════════════════════════════════
  "landing.loginCta": { tr: "SİSTEME GİRİŞ YAP", de: "IM SYSTEM ANMELDEN", en: "LOG INTO THE SYSTEM" },
  "landing.hostSectionLabel": { tr: "GECE OTURUMU (HOST)", de: "ABENDSESSION (HOST)", en: "NIGHT SESSION (HOST)" },
  "landing.hostSectionTitle": { tr: "YÖNETİCİ", de: "MODERATOR", en: "HOST" },
  "landing.hostSectionDesc": {
    tr: "Kafe gecesini başlat ve oyuncuları davet et.",
    de: "Starte den Café-Abend und lade Spieler ein.",
    en: "Start the café night and invite players.",
  },
  "landing.modeArenaDesc": {
    tr: "Klasik kelime oyununun hiper-modern versiyonu.",
    de: "Die hypermoderne Version des klassischen Wortspiels.",
    en: "The hyper-modern take on the classic word game.",
  },
  "landing.modeQuizDesc": {
    tr: "Zeka, hız ve bilginin çarpıştığı arena.",
    de: "Die Arena, in der Köpfchen, Tempo und Wissen aufeinandertreffen.",
    en: "The arena where wits, speed, and knowledge collide.",
  },
  "landing.modeBombDesc": {
    tr: "Bomba elinde patlamadan kelimeyi bul!",
    de: "Finde das Wort, bevor dir die Bombe in der Hand hochgeht!",
    en: "Find the word before the bomb goes off in your hand!",
  },

  // ═══════════════════════════════════════════
  // HOST DASHBOARD — mod seçim kartları (Landing'den biraz daha uzun metin)
  // ═══════════════════════════════════════════
  "dashboard.modeArenaDesc": {
    tr: "Klasik kelime oyununun hiper-modern versiyonu. Kelime yeteneğini test et.",
    de: "Die hypermoderne Version des klassischen Wortspiels. Teste dein Wortgeschick.",
    en: "The hyper-modern take on the classic word game. Test your wordplay skills.",
  },
  "dashboard.modeQuizDesc": {
    tr: "Genel kültürünü kanıtla. Zeka, hız ve bilginin çarpıştığı arena.",
    de: "Beweise dein Allgemeinwissen. Die Arena, in der Köpfchen, Tempo und Wissen aufeinandertreffen.",
    en: "Prove your general knowledge. The arena where wits, speed, and knowledge collide.",
  },
  "dashboard.modeBombDesc": {
    tr: "Bomba elinde patlamadan kelimeyi bul! Adrenalin dolu bomb party modu.",
    de: "Finde das Wort, bevor dir die Bombe hochgeht! Der adrenalingeladene Bomb-Party-Modus.",
    en: "Find the word before the bomb goes off! The adrenaline-packed bomb party mode.",
  },
  "dashboard.joinNight": { tr: "Geceye Katıl", de: "Am Abend teilnehmen", en: "Join the Night" },
  "dashboard.playersCount": {
    tr: (n: number) => `Oyuncular (${n})`,
    de: (n: number) => `Spieler (${n})`,
    en: (n: number) => `Players (${n})`,
  },
  "dashboard.waiting": { tr: "Bekleniyor...", de: "Warten...", en: "Waiting..." },
  "dashboard.pointsSuffix": {
    tr: (p: number) => `${p} Puan`,
    de: (p: number) => `${p} Punkte`,
    en: (p: number) => `${p} Points`,
  },
  "dashboard.startGame": { tr: "Oyun Başlat", de: "Spiel starten", en: "Start Game" },
  "dashboard.startSession": { tr: "Oturumu Başlat", de: "Session starten", en: "Start Session" },
  "dashboard.comingSoon": { tr: "ÇOK YAKINDA", de: "BALD VERFÜGBAR", en: "COMING SOON" },
  "dashboard.comingSoonBadge": { tr: "🔒 ÇOK YAKINDA", de: "🔒 BALD VERFÜGBAR", en: "🔒 COMING SOON" },
  "dashboard.modeSlingshotDesc": {
    tr: "Dokunmatik sapanı ger, falsoyu ver ve 90'a as! 3D stadyum penaltı şöleni.",
    de: "Zieh die Touch-Schleuder, gib Effet und triff in den Winkel! Das 3D-Stadion-Elfmeterschießen.",
    en: "Pull the touch slingshot, add curve, and hit the top corner! 3D stadium shootout.",
  },

  // YÖRÜNGE SAPANI — TV ve misafir telefonu
  "slingshot.title": { tr: "YÖRÜNGE SAPANI", de: "YÖRÜNGE SAPANI", en: "YÖRÜNGE SAPANI" },
  "slingshot.introEyebrow": { tr: "HENGAME STADYUM DÜELLOSU", de: "HENGAME STADION-DUELL", en: "HENGAME STADIUM DUEL" },
  "slingshot.introBody": {
    tr: "Telefonunuzdaki sapanı parmağınızla geriye doğru çekin, falso açısını verin ve TV kalesine fırlatın! 90'a asan maçın yıldızı olur!",
    de: "Zieh die Schleuder auf deinem Handy mit dem Finger zurück, gib Effet und schieß aufs TV-Tor! Wer in den Winkel trifft, ist der Star des Abends!",
    en: "Pull back the slingshot on your phone, add curve and fire at the TV goal! Hit the top corner and you're the star of the night!",
  },
  "slingshot.introReady": {
    tr: "Stadyum ışıkları açılıyor... ŞUTLARINIZI HAZIRLAYIN!",
    de: "Flutlicht an... MACHT EUCH BEREIT!",
    en: "Floodlights on... GET YOUR SHOTS READY!",
  },
  "slingshot.arenaEyebrow": { tr: "HENGAME MAÇ ÖNÜ DÜELLOSU", de: "HENGAME DUELL VOR DEM ANPFIFF", en: "HENGAME PRE-MATCH DUEL" },
  "slingshot.shooter": {
    tr: (name: string) => `${name} ŞUT ÇEKİYOR`,
    de: (name: string) => `${name} SCHIESST`,
    en: (name: string) => `${name} SHOOTS`,
  },
  "slingshot.wind": { tr: "RÜZGAR", de: "WIND", en: "WIND" },
  "slingshot.windRight": {
    tr: (speed: number) => `+${speed} m/s SAĞ`,
    de: (speed: number) => `+${speed} m/s RECHTS`,
    en: (speed: number) => `+${speed} m/s RIGHT`,
  },
  "slingshot.goals": {
    tr: (n: number) => `${n} GOL`,
    de: (n: number) => (n === 1 ? "1 TOR" : `${n} TORE`),
    en: (n: number) => (n === 1 ? "1 GOAL" : `${n} GOALS`),
  },
  "slingshot.goal": { tr: "GOOOOOL! ⚽", de: "TOOOOOR! ⚽", en: "GOOOOAL! ⚽" },
  "slingshot.goalPoints": {
    tr: (n: number) => `+${n} PUAN KAZANILDI`,
    de: (n: number) => `+${n} PUNKTE`,
    en: (n: number) => `+${n} POINTS`,
  },
  "slingshot.saved": { tr: "KALECİ UZANDI! 🧤", de: "GEHALTEN! 🧤", en: "SAVED! 🧤" },
  "slingshot.crossbar": { tr: "DİREKTEN DÖNDÜ! 💥", de: "AN DEN PFOSTEN! 💥", en: "OFF THE POST! 💥" },
  "slingshot.out": { tr: "AUTA GİTTİ 💨", de: "DANEBEN 💨", en: "WIDE 💨" },
  "slingshot.arenaHint": {
    tr: "Telefonda topu geriye doğru çek, rüzgarı ve falsoyu hesaplayıp fırlat!",
    de: "Zieh den Ball am Handy zurück, rechne Wind und Effet ein und schieß!",
    en: "Pull the ball back on your phone, factor in wind and curve, and shoot!",
  },
  "slingshot.revealEyebrow": { tr: "DÜELLO TAMAMLANDI", de: "DUELL BEENDET", en: "DUEL COMPLETE" },
  "slingshot.revealTitle": { tr: "ALTIN AYAK SIRALAMASI", de: "RANGLISTE GOLDENER SCHUH", en: "GOLDEN BOOT STANDINGS" },
  "slingshot.playAgain": { tr: "⚽ Tekrar Penaltı At", de: "⚽ Nochmal schießen", en: "⚽ Shoot again" },
  "slingshot.backToLobby": { tr: "🏠 Lobiye Dön", de: "🏠 Zur Lobby", en: "🏠 Back to lobby" },
  "slingshot.playerIntroBody": {
    tr: "Ekrana dokun, sapanı geriye doğru çek ve falsoyu vererek TV kalesine fırlat!",
    de: "Tippe aufs Display, zieh die Schleuder zurück, gib Effet und schieß aufs TV-Tor!",
    en: "Tap the screen, pull the slingshot back, add curve and fire at the TV goal!",
  },
  "slingshot.watchTv": {
    tr: "TV Ekranına Bakın — Maç Başlıyor...",
    de: "Schau auf den TV — gleich geht's los...",
    en: "Watch the TV — kick-off soon...",
  },
  "slingshot.penaltyShot": { tr: "PENALTI ŞUTU", de: "ELFMETER", en: "PENALTY SHOT" },
  "slingshot.angle": { tr: "AÇI", de: "WINKEL", en: "ANGLE" },
  "slingshot.power": { tr: "GÜÇ", de: "KRAFT", en: "POWER" },
  "slingshot.pullHint": { tr: "Topu Geriye Çek & Bırak", de: "Ball zurückziehen & loslassen", en: "Pull the ball back & release" },
  "slingshot.reloading": { tr: "Top hazırlanıyor…", de: "Ball wird geladen…", en: "Reloading…" },
  "slingshot.curveLeft": { tr: "SOL FALSO", de: "EFFET LINKS", en: "LEFT CURVE" },
  "slingshot.curveRight": { tr: "SAĞ FALSO", de: "EFFET RECHTS", en: "RIGHT CURVE" },
  "slingshot.spin": { tr: "FALSO", de: "EFFET", en: "SPIN" },
  "slingshot.playerRevealEyebrow": { tr: "PENALTI DÜELLOSU BİTTİ", de: "ELFMETERSCHIESSEN VORBEI", en: "SHOOTOUT OVER" },
  "slingshot.playerRevealTitle": { tr: "MÜKEMMEL ŞUTLAR!", de: "STARKE SCHÜSSE!", en: "GREAT SHOTS!" },
  "slingshot.yourScore": { tr: "Toplam Puanın", de: "Deine Punkte", en: "Your score" },
  "slingshot.rankingOnTv": {
    tr: "Sıralama TV ekranında gösteriliyor.",
    de: "Die Rangliste läuft auf dem TV.",
    en: "Standings are on the TV.",
  },

  // ═══════════════════════════════════════════
  // OYUN EKRANLARI — ortak
  // ═══════════════════════════════════════════
  "common.followMainScreen": { tr: "Ana Ekranı Takip Et", de: "Achte auf den Hauptbildschirm", en: "Watch the main screen" },

  // ═══════════════════════════════════════════
  // AUTH — sayfa başlıkları
  // ═══════════════════════════════════════════
  "auth.loginHeading": { tr: "SİSTEME GİRİŞ", de: "SYSTEM-ANMELDUNG", en: "SYSTEM LOGIN" },

  // ═══════════════════════════════════════════
  // PLAYER GAME — harf/tur geçiş ekranı
  // ═══════════════════════════════════════════
  "game.determiningLetter": { tr: "HARF BELİRLENİYOR...", de: "BUCHSTABE WIRD BESTIMMT...", en: "DETERMINING LETTER..." },
  "game.starting": { tr: "OYUN BAŞLIYOR!", de: "DAS SPIEL BEGINNT!", en: "GAME STARTING!" },
  "game.watchMainScreen": {
    tr: "Lütfen Ana Ekrana Bakın...",
    de: "Bitte auf den Hauptbildschirm schauen...",
    en: "Please watch the main screen...",
  },
  "game.roundHint": {
    tr: (round: number, total: number) =>
      `Tur ${round} / ${total} • Hızlı yazan ekstra bonus puan kazanır!`,
    de: (round: number, total: number) =>
      `Runde ${round} / ${total} • Wer schnell tippt, bekommt einen Extra-Bonus!`,
    en: (round: number, total: number) =>
      `Round ${round} / ${total} • Type fast for an extra bonus!`,
  },

  // ═══════════════════════════════════════════
  // WAITING ROOM (PlayerLobby — katılım sonrası bekleme ekranı)
  // ═══════════════════════════════════════════
  "waitingRoom.categoriesTitle": {
    tr: "BU TURDAKİ KATEGORİLER",
    de: "KATEGORIEN DIESER RUNDE",
    en: "THIS ROUND'S CATEGORIES",
  },
  "waitingRoom.playersConnected": {
    tr: (n: number) => `${n} oyuncu bağlandı`,
    de: (n: number) => `${n} Spieler verbunden`,
    en: (n: number) => `${n} players connected`,
  },
  "waitingRoom.timerLabel": {
    tr: (s: string) => `⏱ ${s}sn`,
    de: (s: string) => `⏱ ${s}s`,
    en: (s: string) => `⏱ ${s}s`,
  },
  "waitingRoom.roundsLabel": {
    tr: (n: string) => `🏁 ${n} tur`,
    de: (n: string) => `🏁 ${n} Runden`,
    en: (n: string) => `🏁 ${n} rounds`,
  },
  "tips.early": {
    tr: "Erken gönder → Erken bonus puan kazan!",
    de: "Früh abschicken → Frühbonus kassieren!",
    en: "Submit early → Earn an early bonus!",
  },
  "tips.uniqueBonus": {
    tr: "Benzersiz cevap → 20 puan. Ortak cevap → 10 puan.",
    de: "Einzigartige Antwort → 20 Punkte. Geteilte Antwort → 10 Punkte.",
    en: "Unique answer → 20 points. Shared answer → 10 points.",
  },
  "tips.joker": {
    tr: "JOKER ile bir kategoride puanını 2 katına çıkar.",
    de: "Verdopple mit dem JOKER deine Punkte in einer Kategorie.",
    en: "Use the JOKER to double your points in one category.",
  },
  "tips.ranking": {
    tr: "Her turda sıralama değişir. Son tura kadar mücadele et!",
    de: "Die Rangliste ändert sich jede Runde. Kämpfe bis zur letzten Runde!",
    en: "Rankings shift every round. Fight until the final round!",
  },
  "tips.validLetter": {
    tr: "Harfle başlayan her geçerli cevap sayılır.",
    de: "Jede gültige Antwort mit dem richtigen Buchstaben zählt.",
    en: "Every valid answer starting with the letter counts.",
  },

  // ═══════════════════════════════════════════
  // TUTORIAL — HOST (TV ekranı, oyun başlamadan önce)
  // ═══════════════════════════════════════════
  "tutorial.howToPlay": { tr: "Nasıl Oynanır?", de: "Spielanleitung", en: "How to Play?" },
  "tutorial.startGame": { tr: "OYUNU BAŞLAT", de: "SPIEL STARTEN", en: "START GAME" },
  "tutorial.next": { tr: "SONRAKİ", de: "WEITER", en: "NEXT" },
  "tutorial.host.scattegories.1.title": {
    tr: "HARFİ GÖR, KELİMELERİ BUL",
    de: "BUCHSTABE SEHEN, WÖRTER FINDEN",
    en: "SEE THE LETTER, FIND THE WORDS",
  },
  "tutorial.host.scattegories.1.desc": {
    tr: "Her turun başında rastgele bir harf seçilir. Amacın, o harfle başlayan ve kategorilere uygun kelimeleri en hızlı şekilde bulmak.",
    de: "Zu Beginn jeder Runde wird ein zufälliger Buchstabe gezogen. Finde so schnell wie möglich Wörter, die mit ihm beginnen und zu den Kategorien passen.",
    en: "A random letter is drawn at the start of each round. Your goal: find words starting with it that fit the categories, as fast as you can.",
  },
  "tutorial.host.scattegories.2.title": {
    tr: "KOPYA YOK, YARATICILIK ŞART",
    de: "NICHT ABSCHREIBEN, KREATIV SEIN",
    en: "NO COPYING, CREATIVITY REQUIRED",
  },
  "tutorial.host.scattegories.2.desc": {
    tr: "Başkasıyla aynı kelimeyi yazarsan az puan alırsın. Sadece sana özel, benzersiz kelimeler ekstra puan kazandırır!",
    de: "Schreibst du dasselbe Wort wie jemand anderes, gibt es weniger Punkte. Nur einzigartige Wörter bringen den Extra-Bonus!",
    en: "Writing the same word as someone else scores less. Only unique words earn the bonus!",
  },
  "tutorial.host.quiz.1.title": { tr: "BİLGİNİ KANITLA", de: "BEWEISE DEIN WISSEN", en: "PROVE YOUR KNOWLEDGE" },
  "tutorial.host.quiz.1.desc": {
    tr: "Ekranda beliren soruları oku ve en hızlı şekilde doğru şıkkı seç. Zaman daralıyor!",
    de: "Lies die Fragen auf dem Bildschirm und wähle so schnell wie möglich die richtige Antwort. Die Zeit läuft!",
    en: "Read the questions on screen and pick the right answer as fast as you can. Time is running out!",
  },
  "tutorial.host.quiz.2.title": { tr: "HIZ VE DİKKAT", de: "TEMPO UND AUFMERKSAMKEIT", en: "SPEED AND FOCUS" },
  "tutorial.host.quiz.2.desc": {
    tr: "Soru zorlaştıkça ve sen ne kadar hızlı cevaplarsan o kadar yüksek puan alırsın. Yanlış cevapta puan yok!",
    de: "Je schwerer die Frage und je schneller du antwortest, desto mehr Punkte. Für falsche Antworten gibt es nichts!",
    en: "The harder the question and the faster you answer, the more points you get. Wrong answers score nothing!",
  },
  "tutorial.host.bomb.1.title": { tr: "BOMBAYI ELİNDEN AT!", de: "WIRF DIE BOMBE WEITER!", en: "PASS THE BOMB!" },
  "tutorial.host.bomb.1.desc": {
    tr: "Bomba sana geldiğinde telefonun titrer ve ekran kızarır. Hemen kategoriye uygun bir kelime yaz ve gönder!",
    de: "Wenn die Bombe bei dir landet, vibriert dein Handy und der Bildschirm wird rot. Tippe sofort ein passendes Wort und schick es ab!",
    en: "When the bomb reaches you, your phone vibrates and the screen turns red. Type a matching word and send it, fast!",
  },
  "tutorial.host.bomb.2.title": {
    tr: "KULLANILMIŞ KELİME YASAK",
    de: "BEREITS GENUTZTE WÖRTER VERBOTEN",
    en: "NO REUSING WORDS",
  },
  "tutorial.host.bomb.2.desc": {
    tr: "Daha önce yazılan bir kelimeyi yazamazsın! Süre dolduğunda bomba kimin elindeyse bir canı gider.",
    de: "Ein bereits genanntes Wort zählt nicht! Wer die Bombe beim Ablauf der Zeit hält, verliert ein Leben.",
    en: "A word already used doesn't count! Whoever holds the bomb when time runs out loses a life.",
  },

  // ═══════════════════════════════════════════
  // TUTORIAL — PLAYER (telefon ekranı)
  // ═══════════════════════════════════════════
  "tutorial.watchBigScreen": { tr: "Dev ekrana da bakın", de: "Schaut auch auf den großen Bildschirm", en: "Watch the big screen too" },
  "tutorial.waitingHost": {
    tr: "Oyun Yöneticisi Bekleniyor...",
    de: "Warte auf den Spielleiter...",
    en: "Waiting for the host...",
  },
  "tutorial.player.scattegories.1.title": {
    tr: "KLAVYE HIZINI HAZIRLA!",
    de: "MACH DEINE TIPPFINGER BEREIT!",
    en: "GET YOUR TYPING FINGERS READY!",
  },
  "tutorial.player.scattegories.1.desc": {
    tr: "Ana ekranda harf belirdiğinde, telefonun senin oyun kumandan olacak. Panik yapma, odaklan.",
    de: "Sobald der Buchstabe auf dem Hauptbildschirm erscheint, wird dein Handy zum Controller. Keine Panik, konzentrier dich.",
    en: "When the letter appears on the main screen, your phone becomes your controller. Don't panic, focus.",
  },
  "tutorial.player.scattegories.2.title": { tr: "KUTUCUKLARI DOLDUR", de: "FÜLL DIE FELDER AUS", en: "FILL IN THE BOXES" },
  "tutorial.player.scattegories.2.desc": {
    tr: "Kategorilere uygun en ilginç kelimeleri yaz ve süre bitmeden 'GÖNDER' butonuna bas!",
    de: "Tippe die originellsten passenden Wörter und drück vor Ablauf der Zeit auf 'SENDEN'!",
    en: "Type the most interesting matching words and hit 'SEND' before time runs out!",
  },
  "tutorial.player.quiz.1.title": {
    tr: "SORU EKRANDA, CEVAP BURADA",
    de: "FRAGE AUF DEM BILDSCHIRM, ANTWORT HIER",
    en: "QUESTION ON SCREEN, ANSWER HERE",
  },
  "tutorial.player.quiz.1.desc": {
    tr: "Sorular ana ekranda (TV) görünecek. Sen telefonundan A, B, C veya D şıklarından birini seçeceksin.",
    de: "Die Fragen erscheinen auf dem Hauptbildschirm (TV). Du wählst auf deinem Handy A, B, C oder D.",
    en: "Questions appear on the main screen (TV). You pick A, B, C, or D on your phone.",
  },
  "tutorial.player.quiz.2.title": { tr: "EN HIZLI SEN TIKLA!", de: "SEI DER SCHNELLSTE!", en: "TAP FASTEST!" },
  "tutorial.player.quiz.2.desc": {
    tr: "Doğru cevabı ne kadar hızlı seçersen o kadar çok puan alırsın. Hızlı ol!",
    de: "Je schneller du die richtige Antwort wählst, desto mehr Punkte. Sei schnell!",
    en: "The faster you pick the right answer, the more points you get. Be quick!",
  },
  "tutorial.player.bomb.1.title": { tr: "BOMBA SANA GELİRSE...", de: "WENN DIE BOMBE BEI DIR LANDET...", en: "IF THE BOMB REACHES YOU..." },
  "tutorial.player.bomb.1.desc": {
    tr: "Ekranın aniden KIRMIZI olacak ve telefonun titreyecek. Panik yapma, sakin kal!",
    de: "Dein Bildschirm wird plötzlich ROT und dein Handy vibriert. Keine Panik, bleib ruhig!",
    en: "Your screen suddenly turns RED and your phone vibrates. Don't panic, stay calm!",
  },
  "tutorial.player.bomb.2.title": { tr: "HEMEN YAZ VE AT!", de: "SOFORT TIPPEN UND WEITERGEBEN!", en: "TYPE AND PASS IT ON!" },
  "tutorial.player.bomb.2.desc": {
    tr: "Kategoriye uygun, DAHA ÖNCE YAZILMAMIŞ bir kelime yaz ve BOMBAYI AT butonuna basarak kurtul!",
    de: "Tippe ein passendes, NOCH NICHT GENANNTES Wort und drück auf BOMBE WEITERGEBEN, um dich zu retten!",
    en: "Type a matching word that hasn't been used yet, then hit PASS THE BOMB to save yourself!",
  },

  // ═══════════════════════════════════════════
  // BOMB PARTY
  // ═══════════════════════════════════════════
  "bomb.category": { tr: "KATEGORİ", de: "KATEGORIE", en: "CATEGORY" },
  "bomb.activating": { tr: "BOMBA AKTİFLEŞİYOR...", de: "BOMBE WIRD SCHARF GEMACHT...", en: "ARMING BOMB..." },
  "bomb.exploded": { tr: "BOMBA PATLADI!", de: "BOMBE EXPLODIERT!", en: "BOMB EXPLODED!" },
  "bomb.livesLost": { tr: "CAN KAYBEDEN", de: "LEBEN VERLOREN", en: "LOST A LIFE" },
  "bomb.eliminated": { tr: "ELENDİ", de: "AUSGESCHIEDEN", en: "ELIMINATED" },
  "bomb.whoseTurn": { tr: "Sıra Kimde?", de: "Wer ist dran?", en: "Whose Turn?" },
  "bomb.rejectWord": {
    tr: "KELİMEYİ REDDET & CEZALANDIR",
    de: "WORT ABLEHNEN & BESTRAFEN",
    en: "REJECT WORD & PENALIZE",
  },
  "bomb.eliminatedYou": { tr: "ELENDİN", de: "DU BIST AUSGESCHIEDEN", en: "YOU'RE ELIMINATED" },
  "bomb.watchOthers": {
    tr: "Diğer oyuncuların patlamasını izle!",
    de: "Schau zu, wie die anderen hochgehen!",
    en: "Watch the others blow up!",
  },
  "bomb.changingHands": { tr: "Bomba yeni sahibine geçiyor…", de: "Die Bombe wechselt den Besitzer…", en: "The bomb is changing hands…" },
  "bomb.preparing": { tr: "BOMBA HAZIRLANIYOR", de: "BOMBE WIRD VORBEREITET", en: "PREPARING BOMB" },
  "bomb.explodedShort": { tr: "PATLADI!", de: "EXPLODIERT!", en: "EXPLODED!" },
  "bomb.watchMainScreen": {
    tr: "Lütfen dev ekrana bakınız.",
    de: "Bitte auf den großen Bildschirm schauen.",
    en: "Please watch the big screen.",
  },
  "bomb.gameOver": { tr: "OYUN BİTTİ", de: "SPIEL VORBEI", en: "GAME OVER" },
  "bomb.resultsOnScreen": { tr: "Sonuçlar ekranda!", de: "Ergebnisse auf dem Bildschirm!", en: "Results are on screen!" },
  "bomb.categoryLabel": {
    tr: (letter: string) => `Kategori: ${letter}`,
    de: (letter: string) => `Kategorie: ${letter}`,
    en: (letter: string) => `Category: ${letter}`,
  },
  "bomb.yourTurn": { tr: "BOMBA SENDE!", de: "DU HAST DIE BOMBE!", en: "YOU HAVE THE BOMB!" },
  "bomb.wordPlaceholder": { tr: "KELİME YAZ", de: "WORT EINGEBEN", en: "TYPE A WORD" },
  "bomb.typeAndThrow": {
    tr: "Geçerli bir kelime yaz ve bombayı fırlat!",
    de: "Schreib ein gültiges Wort und wirf die Bombe weiter!",
    en: "Type a valid word and throw the bomb!",
  },
  "bomb.atAnotherTable": { tr: "Bomba başka masada!", de: "Die Bombe ist an einem anderen Tisch!", en: "The bomb is at another table!" },
  "bomb.lastWord": { tr: "SON SÖYLENEN KELİME", de: "ZULETZT GESAGTES WORT", en: "LAST WORD SAID" },
  "bomb.throwing": { tr: "ATIYOR...", de: "WIRD GEWORFEN...", en: "THROWING..." },
  "bomb.throwBomb": { tr: "BOMBAYI AT!", de: "BOMBE WERFEN!", en: "THROW THE BOMB!" },
  "bomb.elsewhereLabel": { tr: "BOMBA", de: "BOMBE", en: "BOMB" },
  "bomb.elsewhere": { tr: "BAŞKASINDA", de: "BEI JEMAND ANDEREM", en: "WITH SOMEONE ELSE" },
  "bomb.waitYourTurn": {
    tr: "Sıranın sana gelmesini bekle...",
    de: "Warte, bis du dran bist...",
    en: "Wait for your turn...",
  },
  "bomb.toastWordUsed": {
    tr: "Bu kelime zaten kullanıldı!",
    de: "Dieses Wort wurde bereits verwendet!",
    en: "This word has already been used!",
  },
  "bomb.toastProfane": {
    tr: "Uygunsuz kelime kabul edilmiyor!",
    de: "Unangemessene Wörter werden nicht akzeptiert!",
    en: "Inappropriate words aren't accepted!",
  },
  "bomb.toastGibberish": {
    tr: "Gerçek bir kelime yaz!",
    de: "Schreib ein echtes Wort!",
    en: "Write a real word!",
  },
  "bomb.toastError": { tr: "Bir hata oluştu!", de: "Ein Fehler ist aufgetreten!", en: "An error occurred!" },
  "bomb.generalCategory": { tr: "GENEL", de: "ALLGEMEIN", en: "GENERAL" },
  "bomb.livesShort": {
    tr: (n: string | number) => `${n} CAN`,
    de: (n: string | number) => `${n} LEBEN`,
    en: (n: string | number) => `${n} ${Number(n) === 1 ? "LIFE" : "LIVES"}`,
  },
  "bomb.rosterTitle": {
    tr: (n: string | number) => `⚡ OYUNCULAR (${n})`,
    de: (n: string | number) => `⚡ SPIELER (${n})`,
    en: (n: string | number) => `⚡ PLAYERS (${n})`,
  },
  "bomb.rejectHint": { tr: "Bombayı geri gönderir", de: "Bombe geht zurück", en: "Sends the bomb back" },
  "bomb.wordChain": {
    tr: (n: string | number) => `🔥 KELİME ZİNCİRİ (${n})`,
    de: (n: string | number) => `🔥 WORTKETTE (${n})`,
    en: (n: string | number) => `🔥 WORD CHAIN (${n})`,
  },
  "bomb.waitingFirstWord": { tr: "İlk kelime bekleniyor…", de: "Warte auf das erste Wort…", en: "Waiting for the first word…" },

  // ═══════════════════════════════════════════
  // INTRO CINEMATICS (HostIntro + HostQuizIntro ortak "hacker" açılışı)
  // ═══════════════════════════════════════════
  "intro.howToPlay": { tr: "NASIL OYNANIR", de: "SO WIRD GESPIELT", en: "HOW TO PLAY" },
  "intro.phonesReady": { tr: "TELEFONLAR HAZIR", de: "HANDYS BEREIT", en: "PHONES READY" },
  "intro.liveBroadcast": { tr: "CANLI YAYIN", de: "LIVE ÜBERTRAGUNG", en: "LIVE BROADCAST" },
  "intro.getReady": { tr: "HAZIRLANIN // OYUN BAŞLIYOR!", de: "BEREIT MACHEN // SPIEL STARTET!", en: "GET READY // GAME STARTING!" },
  "intro.arenaTip": {
    tr: "Hedef harfle en hızlı ve özgün kelimeleri yaz, hız bonusunu kap!",
    de: "Schreibe die schnellsten und einzigartigsten Wörter, hol dir den Speed-Bonus!",
    en: "Type the fastest and most unique words, claim the speed bonus!",
  },
  "intro.quiz.titleShort": { tr: "QUIZ", de: "QUIZ", en: "QUIZ" },
  "intro.quiz.step1": { tr: "Soru TV'de, şıklar telefonunda", de: "Frage auf dem TV, Antworten auf dem Handy", en: "Question on the TV, answers on your phone" },
  "intro.quiz.step2": { tr: "Hızlı cevap, daha çok puan", de: "Schnell antworten, mehr Punkte", en: "Answer fast, score more" },
  "intro.quiz.step3": { tr: "En çok puanı toplayan kazanır", de: "Wer die meisten Punkte hat, gewinnt", en: "Most points wins" },
  "intro.arena.titleShort": { tr: "ARENA", de: "ARENA", en: "ARENA" },
  "intro.arena.step1": { tr: "Her turda bir harf çıkar", de: "Jede Runde bringt einen Buchstaben", en: "Each round reveals a letter" },
  "intro.arena.step2": { tr: "Her kategoriye o harfle cevap yaz", de: "Schreib zu jeder Kategorie eine Antwort mit diesem Buchstaben", en: "Answer every category with that letter" },
  "intro.arena.step3": { tr: "Kimsenin yazmadığı cevap daha çok puan getirir", de: "Einzigartige Antworten bringen mehr Punkte", en: "Unique answers score more" },
  "intro.arena.title": { tr: "HENGAME ARENA", de: "HENGAME ARENA", en: "HENGAME ARENA" },
  "intro.arena.subtitle": { tr: "ATEŞ SERBEST", de: "FEUER FREI", en: "FIRE AT WILL" },
  "arena.spinnerProtocol": { tr: "HENGAME ARENA", de: "HENGAME ARENA", en: "HENGAME ARENA" },
  "arena.spinnerResolving": { tr: "KUANTUM ÇEKİRDEK KİLİTLENİYOR...", de: "QUANTUM-KERN WIRD GESPERRT...", en: "LOCKING QUANTUM CORE..." },
  "arena.spinnerLocked": { tr: "HEDEF HARF KİLİTLENDİ!", de: "ZIELBUCHSTABE ARRETIERT!", en: "TARGET LETTER LOCKED!" },
  "arena.progress": {
    tr: (c: string | number, total: string | number) => `${c} / ${total} Kategori Hazır`,
    de: (c: string | number, total: string | number) => `${c} / ${total} Kategorien bereit`,
    en: (c: string | number, total: string | number) => `${c} / ${total} Categories ready`,
  },
  "arena.allReady": { tr: "TÜM CEVAPLAR HAZIR! ⚡", de: "ALLE ANTWORTEN BEREIT! ⚡", en: "ALL ANSWERS READY! ⚡" },
  "arena.speedBonusActive": { tr: "HIZ BONUSU İÇİN KİLİTLE! 🚀", de: "FÜR SPEED-BONUS ARRETIEREN! 🚀", en: "LOCK IN FOR SPEED BONUS! 🚀" },
  "arena.letterMatch": { tr: "Harf Eşleşti", de: "Buchstabe passt", en: "Letter matches" },
  "arena.letterMismatch": {
    tr: (letter: string) => `"${letter}" ile başlamalı`,
    de: (letter: string) => `Muss mit "${letter}" beginnen`,
    en: (letter: string) => `Must start with "${letter}"`,
  },
  "arena.jokerActiveBadge": { tr: "2X JOKER AKTİF", de: "2X JOKER AKTIV", en: "2X JOKER ACTIVE" },
  "intro.quiz.title": { tr: "HENGAME QUIZ", de: "HENGAME QUIZ", en: "HENGAME QUIZ" },
  "intro.quiz.subtitle": { tr: "ZİHİNLER ÇARPIŞIYOR", de: "KÖPFE PRALLEN AUFEINANDER", en: "MINDS COLLIDE" },

  // ═══════════════════════════════════════════
  // QUIZ (HostQuizDisplay + PlayerQuizController)
  // ═══════════════════════════════════════════
  "quiz.title": { tr: "HENGÂME QUIZ", de: "HENGAME QUIZ", en: "HENGAME QUIZ" },
  "quiz.subtitle": { tr: "SİBER BİLGİ SAVAŞI", de: "CYBER QUIZ BATTLE", en: "CYBER QUIZ BATTLE" },
  "quiz.questionCounter": {
    tr: (c: string | number, total: string | number) => `SORU ${c} / ${total}`,
    de: (c: string | number, total: string | number) => `FRAGE ${c} / ${total}`,
    en: (c: string | number, total: string | number) => `QUESTION ${c} / ${total}`,
  },
  "quiz.questionOf": {
    tr: (c: string | number, total: string | number) => `Soru ${c} / ${total}`,
    de: (c: string | number, total: string | number) => `Frage ${c} / ${total}`,
    en: (c: string | number, total: string | number) => `Question ${c} / ${total}`,
  },
  "quiz.loading": { tr: "SORU YÜKLENİYOR...", de: "FRAGE WIRD GELADEN...", en: "LOADING QUESTION..." },
  "quiz.startTimer": { tr: "SÜREYİ BAŞLAT", de: "TIMER STARTEN", en: "START TIMER" },
  "quiz.endTimer": { tr: "SÜREYİ BİTİR", de: "TIMER BEENDEN", en: "END TIMER" },
  "quiz.correctAnswer": { tr: "DOĞRU CEVAP", de: "RICHTIGE ANTWORT", en: "CORRECT ANSWER" },
  "quiz.revealPending": { tr: "Cevaplar kilitlendi…", de: "Antworten gesperrt…", en: "Answers locked…" },
  "quiz.seeRanking": { tr: "SIRALAMAYI GÖR", de: "RANGLISTE ANZEIGEN", en: "SEE RANKING" },
  "quiz.currentRanking": { tr: "LİDER TABLOSU", de: "AKTUELLE RANGLISTE", en: "CURRENT LEADERBOARD" },
  "quiz.pts": { tr: "PUAN", de: "PKT", en: "PTS" },
  "quiz.nextQuestion": { tr: "SIRADAKİ SORU →", de: "NÄCHSTE FRAGE →", en: "NEXT QUESTION →" },
  "quiz.finishGame": { tr: "OYUNU TAMAMLA 🏆", de: "SPIEL BEENDEN 🏆", en: "FINISH GAME 🏆" },
  "quiz.champion": { tr: "HENGÂME ŞAMPİYONU", de: "HENGAME CHAMPION", en: "HENGAME CHAMPION" },
  "quiz.newGame": { tr: "YENİ OYUN BAŞLAT", de: "NEUES SPIEL STARTEN", en: "START NEW GAME" },
  "quiz.timeLeft": { tr: "Kalan süre", de: "Verbleibende Zeit", en: "Time left" },
  "quiz.watchMainScreen": {
    tr: "TV ekranına odaklan, sorular açılmak üzere!",
    de: "Schau auf den TV-Bildschirm, die Fragen starten gleich!",
    en: "Watch the TV screen, questions are about to begin!",
  },
  "quiz.getReady": { tr: "HAZIRLAN!", de: "MACH DICH BEREIT!", en: "GET READY!" },
  "quiz.answerSaved": { tr: "CEVAP KİLİTLENDİ 🔒", de: "ANTWORT GESPEICHERT 🔒", en: "ANSWER LOCKED 🔒" },
  "quiz.lockedWait": {
    tr: "Cevabın Kilitlendi · TV Ekranını Takip Et",
    de: "Antwort eingeloggt · Schau auf den TV",
    en: "Answer Locked · Watch the TV Screen",
  },
  "quiz.speedLockBadge": {
    tr: (sec: string | number) => `⚡ ${sec}s İÇİNDE KİLİTLENDİ`,
    de: (sec: string | number) => `⚡ IN ${sec}s EINGELOGGT`,
    en: (sec: string | number) => `⚡ LOCKED IN ${sec}s`,
  },
  "quiz.result": { tr: "TUR SONUCU", de: "RUNDENERGEBNIS", en: "ROUND RESULT" },
  "quiz.ranking": { tr: "SIRALAMA", de: "RANGLISTE", en: "RANKING" },
  "quiz.followRankingOnScreen": {
    tr: "TV ekranındaki sıralamanı takip et!",
    de: "Verfolge deinen Rang auf dem Hauptbildschirm!",
    en: "Follow your rank on the main screen!",
  },
  "quiz.yourScore": { tr: "Toplam Puanın:", de: "Deine Gesamtpunkte:", en: "Your Total Score:" },
  "quiz.gameOver": { tr: "OYUN BİTTİ", de: "SPIEL VORBEI", en: "GAME OVER" },
  "quiz.finalScore": { tr: "FİNAL PUANIN", de: "ENDSTAND", en: "FINAL SCORE" },
  "quiz.liveAnswered": {
    tr: (ans: string | number, tot: string | number) => `⚡ ${ans} / ${tot} OYUNCU KİLİTLEDİ`,
    de: (ans: string | number, tot: string | number) => `⚡ ${ans} / ${tot} SPIELER BEREIT`,
    en: (ans: string | number, tot: string | number) => `⚡ ${ans} / ${tot} PLAYERS LOCKED`,
  },
  "quiz.fastestPlayer": { tr: "⚡ TURUN EN HIZLISI", de: "⚡ SCHNELLSTER DER RUNDE", en: "⚡ SPEED DEMON OF THE ROUND" },
  "quiz.funFactTitle": { tr: "💡 BİLİYOR MUYDUNUZ?", de: "💡 WUSSTEST DU SCHON?", en: "💡 DID YOU KNOW?" },
  "quiz.streakActive": {
    tr: (mult: string | number) => `🔥 ${mult}X KOMBO SERİSİ!`,
    de: (mult: string | number) => `🔥 ${mult}X COMBO-SERIE!`,
    en: (mult: string | number) => `🔥 ${mult}X COMBO STREAK!`,
  },
  "quiz.finalRoundDouble": {
    tr: "💥 FİNAL TURU: 2X ÇİFT PUAN ÇILGINLIĞI!",
    de: "💥 FINALE RUNDE: 2X DOPPELTE PUNKTE!",
    en: "💥 FINAL ROUND: 2X DOUBLE POINTS!",
  },
  "quiz.voteDistribution": { tr: "OY DAĞILIMI", de: "STIMMENVERTEILUNG", en: "VOTE BREAKDOWN" },
  "quiz.podium1st": { tr: "🥇 ŞAMPİYON", de: "🥇 CHAMPION", en: "🥇 CHAMPION" },
  "quiz.podium2nd": { tr: "🥈 İKİNCİ", de: "🥈 2. PLATZ", en: "🥈 2ND PLACE" },
  "quiz.podium3rd": { tr: "🥉 ÜÇÜNCÜ", de: "🥉 3. PLATZ", en: "🥉 3RD PLACE" },
  "quiz.badgeSpeedDemon": { tr: "⚡ Şimşek Parmak", de: "⚡ Blitz-Finger", en: "⚡ Lightning Fingers" },
  "quiz.badgeStreakMaster": { tr: "🔥 Alev Makinesi", de: "🔥 Flammen-Meister", en: "🔥 Streak Master" },
  "quiz.badgeSharpMind": { tr: "🎯 Keskin Zeka", de: "🎯 Scharfer Verstand", en: "🎯 Sharp Mind" },
  "quiz.playerCorrect": { tr: "HARİKA! DOĞRU CEVAP! 🎯", de: "PERFEKT! RICHTIGE ANTWORT! 🎯", en: "PERFECT! CORRECT ANSWER! 🎯" },
  "quiz.playerWrong": { tr: "YANLIŞ CEVAP! 💀", de: "FALSCHE ANTWORT! 💀", en: "WRONG ANSWER! 💀" },
  "quiz.speedBonus": {
    tr: (pts: string | number) => `+${pts} Hız Bonusu`,
    de: (pts: string | number) => `+${pts} Tempo-Bonus`,
    en: (pts: string | number) => `+${pts} Speed Bonus`,
  },
  "quiz.finalDouble": { tr: "💥 2X FİNAL", de: "💥 2X FINALE", en: "💥 2X FINAL" },
  "quiz.voteCount": {
    tr: (n: string | number) => `${n} oyuncu`,
    de: (n: string | number) => `${n} Spieler`,
    en: (n: string | number) => `${n} ${Number(n) === 1 ? "player" : "players"}`,
  },
  "quiz.streakFire": { tr: "ALEV", de: "FEUER", en: "ON FIRE" },
  "common.morePlayers": {
    tr: (n: string | number) => `+${n} oyuncu daha`,
    de: (n: string | number) => `+${n} weitere Spieler`,
    en: (n: string | number) => `+${n} more players`,
  },
  "quiz.waitingForTimer": { tr: "Soru TV ekranında gösteriliyor, süre başlamak üzere...", de: "Frage wird auf dem TV gezeigt, Timer startet gleich...", en: "Question is shown on TV, timer starting soon..." },

  "host.champion": { tr: "ŞAMPİYON", de: "CHAMPION", en: "CHAMPION" },
  "host.winnerPrize": { tr: "KAZANAN ÖDÜL", de: "GEWINN", en: "WINNER PRIZE" },
  "host.redTeam": { tr: "Kırmızı Takım", de: "Team Rot", en: "Red Team" },
  "host.blueTeam": { tr: "Mavi Takım", de: "Team Blau", en: "Blue Team" },
  "gameCategory.knowledge": { tr: "Bilgi", de: "Wissen", en: "Knowledge" },
  "gameCategory.reflex": { tr: "Refleks", de: "Reflex", en: "Reflex" },
  "gameCategory.team": { tr: "Takım", de: "Team", en: "Team" },
  "gameCategory.social": { tr: "Sosyal", de: "Sozial", en: "Social" },
  "gameCategory.reward": { tr: "Ödül", de: "Preis", en: "Prize" },
  "dashboard.rankUp": {
    tr: (n: number) => `${n} sıra yükseldi`,
    de: (n: number) => `${n} Plätze aufgestiegen`,
    en: (n: number) => `Up ${n} places`,
  },
  "dashboard.rankDown": {
    tr: (n: number) => `${n} sıra düştü`,
    de: (n: number) => `${n} Plätze abgerutscht`,
    en: (n: number) => `Down ${n} places`,
  },
  "dashboard.step1": { tr: "ADIM 1", de: "SCHRITT 1", en: "STEP 1" },
  "dashboard.joinTitle": { tr: "Oyuna katıl", de: "Spiel beitreten", en: "Join the game" },
  "dashboard.joinBody": {
    tr: "Telefonunun kamerasıyla QR kodu okut ya da oda kodunu gir.",
    de: "Scanne den QR-Code mit deiner Handykamera oder gib den Raum-Code ein.",
    en: "Scan the QR code with your phone camera or enter the room code.",
  },
  "dashboard.rewardsNeedStaff": {
    tr: "Ödüller kapalı: bu TV mekan hesabıyla giriş yapmadı",
    de: "Prämien aus: Dieser TV ist nicht mit dem Betriebskonto angemeldet",
    en: "Rewards off: this TV isn't signed in with the venue account",
  },
  "dashboard.kioskExit": { tr: "Çıkmak için ekrana dokunun", de: "Zum Beenden auf den Bildschirm tippen", en: "Tap the screen to exit" },
  "host.step2": { tr: "ADIM 2: ", de: "SCHRITT 2: ", en: "STEP 2: " },
  "host.selectGame": { tr: "OYUN SEÇ", de: "SPIEL WÄHLEN", en: "SELECT GAME" },
  "host.joinGame": { tr: "Oyuna Katıl", de: "Spiel Beitreten", en: "Join Game" },
  "host.login": { tr: "GİRİŞ YAP", de: "ANMELDEN", en: "LOGIN" },
  "host.word": { tr: "KELİME", de: "WORT", en: "WORD" },
  "host.luck": { tr: "ŞANS", de: "GLÜCK", en: "LUCK" },
  "host.red": { tr: "KIRMIZI", de: "ROT", en: "RED" },
  "host.blue": { tr: "MAVİ", de: "BLAU", en: "BLUE" },

  // ═══════════════════════════════════════════
  // PLAYER REVIEW (cevap gönderim/inceleme bekleme ekranı)
  // ═══════════════════════════════════════════
  "playerReview.title": { tr: "DEĞERLENDİRME", de: "AUSWERTUNG", en: "REVIEW" },
  "playerReview.answersSent": { tr: "Cevaplar Gönderildi", de: "Antworten gesendet", en: "Answers Sent" },
  "playerReview.reviewing": { tr: "Cevaplanır İnceleniyor...", de: "Antworten werden geprüft...", en: "Reviewing answers..." },
  "playerReview.dataTransferred": { tr: "VERİ AKTARILDI", de: "DATEN ÜBERTRAGEN", en: "DATA TRANSFERRED" },
  "playerReview.watchMainScreen": {
    tr: "Lütfen ana ekranı takip ediniz.",
    de: "Bitte den Hauptbildschirm im Blick behalten.",
    en: "Please keep an eye on the main screen.",
  },

  // ═══════════════════════════════════════════
  // PLAYER STANDINGS (mobil sıralama ekranı)
  // ═══════════════════════════════════════════
  "playerStandings.ranking": { tr: "SIRA", de: "RANG", en: "RANKING" },
  "playerStandings.score": { tr: "PUAN", de: "PUNKTE", en: "SCORE" },
  "playerStandings.leaderboard": { tr: "LİDERLİK TABLOSU", de: "RANGLISTE", en: "LEADERBOARD" },
  "playerStandings.watchMainScreen": {
    tr: "Lütfen ana ekranı takip ediniz.",
    de: "Bitte den Hauptbildschirm im Blick behalten.",
    en: "Please keep an eye on the main screen.",
  },

  // ═══════════════════════════════════════════
  // PLAYER PLAYING (cevap giriş ekranı ek metinler)
  // ═══════════════════════════════════════════
  "game.inputPlaceholder": {
    tr: (letter: string) => `${letter} ile başlayan...`,
    de: (letter: string) => `Beginnt mit ${letter}...`,
    en: (letter: string) => `Starting with ${letter}...`,
  },
  "game.jokerLabel": { tr: "JOKER (x2)", de: "JOKER (x2)", en: "JOKER (x2)" },
  "game.adBreakTitle": { tr: "REKLAM ARASI", de: "WERBEPAUSE", en: "AD BREAK" },
  "game.adBreakDesc": {
    tr: "Sponsorumuzdan kısa bir mesaj, lütfen ana ekrana bakın",
    de: "Kurze Nachricht von unserem Sponsor, bitte schauen Sie auf den Hauptbildschirm",
    en: "A short message from our sponsor, please look at the main screen",
  },

  // ═══════════════════════════════════════════
  // HOST PLAYING (TV süre bitiş ve grid ek metinler)
  // ═══════════════════════════════════════════
  "playing.timeUp": { tr: "SÜRE BİTTİ", de: "ZEIT ABGELAUFEN", en: "TIME'S UP" },

  // ═══════════════════════════════════════════
  // HOST LOBBY (countdown ekranı metinleri)
  // ═══════════════════════════════════════════
  "hostLobby.countdownTitle": {
    tr: "Oyun Birazdan Başlıyor",
    de: "Das Spiel beginnt gleich",
    en: "Game Starting Soon",
  },
  "hostLobby.joinWithCode": { tr: "Kodla Katıl", de: "Mit Code beitreten", en: "Join with Code" },
  "hostLobby.wait5min": { tr: "5 Dk Bekle", de: "5 Min warten", en: "Wait 5 Min" },
  "hostLobby.wait10min": { tr: "10 Dk Bekle", de: "10 Min warten", en: "Wait 10 Min" },

  // ═══════════════════════════════════════════
  // HOST HEADER (reklam arası butonu)
  // ═══════════════════════════════════════════
  "hostHeader.adBreak": { tr: "Reklam Arası", de: "Werbepause", en: "Ad Break" },

  // ═══════════════════════════════════════════
  // HOST AD BREAK (sponsor ve skip butonları)
  // ═══════════════════════════════════════════
  "adBreak.sponsor": { tr: "Sponsor", de: "Sponsor", en: "Sponsor" },
  "adBreak.skip": { tr: "Geç (Skip)", de: "Überspringen (Skip)", en: "Skip" },

  // ═══════════════════════════════════════════
  // HOST DISPLAY (oyun bitirme onay diyaloğu)
  // ═══════════════════════════════════════════
  "host.confirmEndGame": {
    tr: "Oyunu şimdi bitirmek istediğinize emin misiniz? (Tüm sonuçlar toplanıp şampiyon ekranına geçilecek)",
    de: "Möchten Sie das Spiel wirklich jetzt beenden? (Alle Ergebnisse werden gesammelt und der Champion-Bildschirm wird angezeigt)",
    en: "Are you sure you want to end the game now? (All results will be tallied and the champion screen will be shown)",
  },

  // ═══════════════════════════════════════════
  // GAME SETTINGS MODAL (HIGH READABILITY & CLARITY)
  // ═══════════════════════════════════════════
  "gameSettings.presets": { tr: "📁 HIZLI KATEGORİ ŞABLONLARI", de: "📁 KATEGORIE-VORLAGEN", en: "📁 CATEGORY PRESETS" },
  "gameSettings.categories": { tr: "✍️ KATEGORİLER (VİRGÜLLE AYIRIN)", de: "✍️ KATEGORIEN (KOMMAGETRENNT)", en: "✍️ CATEGORIES (COMMA-SEPARATED)" },
  "gameSettings.roundTime": { tr: "⏱️ TUR SÜRESİ", de: "⏱️ RUNDENDAUER", en: "⏱️ ROUND DURATION" },
  "gameSettings.totalRounds": { tr: "🔄 TUR SAYISI", de: "🔄 RUNDENANZAHL", en: "🔄 TOTAL ROUNDS" },
  "gameSettings.roundsSuffix": { tr: "Tur", de: "Runden", en: "Rounds" },
  "gameSettings.secondsSuffix": { tr: "Sn", de: "Sek", en: "Sec" },
  "gameSettings.quizPool": { tr: "🎯 SORU KATEGORİLERİ", de: "🎯 FRAGEN-KATEGORIEN", en: "🎯 QUESTION CATEGORIES" },
  "gameSettings.quizQuestionsCount": { tr: "❓ SORU SAYISI", de: "❓ ANZAHL DER FRAGEN", en: "❓ NUMBER OF QUESTIONS" },
  "gameSettings.quizQuestionsSuffix": { tr: "Soru", de: "Fragen", en: "Questions" },
  "gameSettings.quizTimePerQuestion": { tr: "⏱️ CEVAP SÜRESİ", de: "⏱️ ANTWORTZEIT PRO FRAGE", en: "⏱️ TIME PER QUESTION" },
  "gameSettings.startSession": { tr: "OYUNU BAŞLAT", de: "SPIEL STARTEN", en: "START GAME" },
  "gameSettings.cancel": { tr: "İPTAL", de: "ABBRECHEN", en: "CANCEL" },

  // ═══════════════════════════════════════════
  // B2B MARKETING (PITCH PAGE)
  // ═══════════════════════════════════════════
  "b2b.heroTitle": { 
    tr: "Mekanınızın Eğlence Potansiyelini Katlayın", 
    de: "Maximieren Sie das Unterhaltungspotenzial Ihrer Location", 
    en: "Maximize Your Venue's Entertainment Potential" 
  },
  "b2b.heroSubtitle": {
    tr: "Müşterilerinizin içeride geçirdiği süreyi (Dwell Time) eşsiz bir dijital deneyimle artırın. Sipariş oranlarınızı ve müşteri sadakatini katlayın.",
    de: "Erhöhen Sie die Verweildauer (Dwell Time) Ihrer Gäste mit einem einzigartigen digitalen Erlebnis. Steigern Sie Ihre Bestellraten und Kundenbindung.",
    en: "Increase your guests' dwell time with a unique digital experience. Multiply your order rates and customer loyalty."
  },
  "b2b.problemTitle": { tr: "PROBLEM", de: "DAS PROBLEM", en: "THE PROBLEM" },
  "b2b.problemDesc": {
    tr: "Misafirler kısa süre vakit geçirip telefonlarına bakıyor ve mekandan erken ayrılıyorlar.",
    de: "Gäste verbringen wenig Zeit, schauen auf ihre Handys und verlassen die Location frühzeitig.",
    en: "Guests spend little time, look at their phones, and leave the venue early."
  },
  "b2b.solutionTitle": { tr: "ÇÖZÜM: HENGAME", de: "DIE LÖSUNG: HENGAME", en: "THE SOLUTION: HENGAME" },
  "b2b.solutionDesc": {
    tr: "Televizyonlarınızı dev bir interaktif oyun konsoluna dönüştürün. Müşterileriniz sadece kendi telefonlarından (uygulama indirmeden) oyuna dahil olur.",
    de: "Verwandeln Sie Ihre Fernseher in eine riesige interaktive Spielekonsole. Ihre Gäste nehmen einfach mit ihren eigenen Smartphones teil (ohne App-Download).",
    en: "Transform your TVs into a giant interactive game console. Guests join simply using their own smartphones (no app download)."
  },
  "b2b.feature1Title": { tr: "🚫 UYGULAMA İNDİRMEK YOK", de: "🚫 KEIN APP-DOWNLOAD", en: "🚫 NO APP DOWNLOAD" },
  "b2b.feature1Desc": {
    tr: "Misafirler masalarındaki veya TV'deki QR kodu okutarak anında oyuna başlar.",
    de: "Gäste scannen den QR-Code auf ihren Tischen oder am TV und spielen sofort mit.",
    en: "Guests scan the QR code on their tables or on the TV and start playing instantly."
  },
  "b2b.feature2Title": { tr: "⚡ GERÇEK ZAMANLI SENKRONİZASYON", de: "⚡ ECHTZEIT-SYNCHRONISATION", en: "⚡ REAL-TIME SYNCHRONIZATION" },
  "b2b.feature2Desc": {
    tr: "Milisaniyelik hızla tüm ekranlar senkronize çalışır. %100 bulut tabanlı altyapı.",
    de: "Alle Bildschirme synchronisieren sich in Millisekunden. 100% cloudbasierte Infrastruktur.",
    en: "All screens synchronize in milliseconds. 100% cloud-based infrastructure."
  },
  "b2b.feature3Title": { tr: "📺 HER TV'YE UYUMLU", de: "📺 KOMPATIBEL MIT JEDEM TV", en: "📺 COMPATIBLE WITH ANY TV" },
  "b2b.feature3Desc": {
    tr: "Sadece bir internet bağlantısı ve Chromecast veya Smart TV tarayıcısı yeterlidir.",
    de: "Alles was Sie brauchen ist eine Internetverbindung und einen Chromecast oder Smart TV-Browser.",
    en: "All you need is an internet connection and a Chromecast or Smart TV browser."
  },
  "b2b.roiTitle": { tr: "YATIRIM GETİRİSİ (ROI)", de: "RETURN ON INVESTMENT (ROI)", en: "RETURN ON INVESTMENT (ROI)" },
  "b2b.roiDesc": {
    tr: "Oyuncular arası rekabet, mekana bağlılığı ve ekstra siparişleri tetikler.",
    de: "Der Wettbewerb zwischen den Spielern fördert die Kundenbindung und löst zusätzliche Bestellungen aus.",
    en: "Competition between players fosters loyalty and triggers extra orders."
  },
  "b2b.ctaButton": { tr: "DEMO RANDEVUSU İSTE", de: "DEMO-TERMIN VEREINBAREN", en: "REQUEST A DEMO" }
} as const;

export type TranslationKey = keyof typeof translations;
type TranslationValue = string | ((...args: (string | number)[]) => string);

// ───────── STATE MANAGEMENT ─────────
// Açılış varsayılanı Almanca: bu ürün önce Almanya'daki mekanlara
// pazarlanıyor, host/oyuncu ilk açılışta ekstra tıklama yapmadan kendi
// dilini görmeli. Daha önce ziyaret edip başka bir dil seçmiş kullanıcının
// tercihi localStorage'dan (varsa) önceliklidir.
const DEFAULT_LOCALE: Locale = "de";

let currentLocale: Locale = DEFAULT_LOCALE;
try {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
    const saved = localStorage.getItem("alaz_neon_locale") as Locale | null;
    if (saved) currentLocale = saved;
  }
} catch {
  // localStorage access may fail in restricted/test environments
}

// index.html varsayılan olarak lang="tr" ile geliyor; açılış dili farklıysa
// (artık Almanca) burada anında düzeltiyoruz. Kullanıcı daha önce başka bir
// dil seçtiyse açılışta onu yansıtır (bkz. setLocale'deki not).
if (typeof window !== "undefined" && typeof document !== "undefined") {
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
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && typeof localStorage.setItem === "function") {
      localStorage.setItem("alaz_neon_locale", locale);
    }
    if (typeof document !== "undefined") {
      // <html lang> arayüz için kozmetik değil: CSS `text-transform: uppercase`
      // dile göre çalışıyor ve arayüz büyük harf ağırlıklı. Yanlış dilde
      // "Giriş" → "GIRIŞ" (noktasız I) çıkıyor, Türkçede doğrusu "GİRİŞ".
      document.documentElement.lang = locale;
    }
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((callback) => callback());
}

/**
 * Get a translated string by key.
 * Supports both plain strings and function-based translations for interpolation.
 */
export function t(key: TranslationKey, ...args: (string | number)[]): string {
  const entry = translations[key];
  if (!entry) {
    // Kod tabanında `t("bir.anahtar", "Yedek Metin")` deseni yaygın: çağıran
    // taraf ikinci argümanı YEDEK metin sanıyor, oysa o interpolasyon
    // argümanı. Anahtar tanımlıyken zararsız, ama bir yazım hatasında ekrana
    // ham anahtar ("player.unityTitle") basılırdı. Niyete uyuyoruz: anahtar
    // yoksa ve metin bir yedek verilmişse onu döndür.
    const fallback = args[0];
    return typeof fallback === "string" ? fallback : key;
  }

  const val = entry[currentLocale] as TranslationValue;
  if (typeof val === "function") {
    return val(...args);
  }
  return val;
}

// Expose for reactive React usage
export const i18n = { t, getLocale, setLocale };
