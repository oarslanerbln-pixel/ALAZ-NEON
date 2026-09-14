/**
 * Almanca yaygın CINS ISIM listesi.
 *
 * İki işe birden yarıyor (bkz. lib/answerLanguage.ts):
 *  1. Dil kontrolü — cevap başka bir dilin listesindeyse ve bu listede
 *     değilse, oyunun dilinde yazılmamış demektir.
 *  2. Yazım hatası — cevap hiçbir listede yok ama oyun dilindeki bir
 *     kelimeye bir-iki harf uzaklıktaysa, yazım hatası sayılıp kısmi puan
 *     alıyor ("Vgel" → "Vögel").
 *
 * Bilerek yalnızca cins isimler: özel isim kategorileri (Stadt, Land, Name,
 * Marke...) dil kontrolünden zaten muaf, çünkü özel isimler uluslararası.
 * Liste kapsayıcı DEĞİL; kapsamadığı kelime sessizce geçer. Yanlış pozitif
 * riskine karşı son söz yine host'ta (inceleme ekranı).
 */
export const DE_WORDS: readonly string[] = [
  // Hayvanlar
  "hund","katze","maus","ratte","pferd","kuh","schwein","schaf","ziege","huhn","hahn","ente","gans","vogel","vögel","adler","eule","falke","taube","spatz","storch","fisch","hai","wal","delfin","krebs","hummer","muschel","frosch","kröte","schlange","eidechse","schildkröte","krokodil","löwe","tiger","bär","wolf","fuchs","hase","kaninchen","hirsch","reh","elch","affe","elefant","giraffe","zebra","nilpferd","nashorn","kamel","känguru","koala","panda","pinguin","robbe","biene","wespe","ameise","fliege","mücke","spinne","schmetterling","käfer","wurm","schnecke","igel","eichhörnchen","maulwurf","fledermaus","esel","kalb","lamm","ferkel","welpe","küken",
  // Yiyecek & içecek
  "brot","brötchen","butter","käse","milch","sahne","joghurt","quark","ei","eier","fleisch","wurst","schinken","speck","huhn","fisch","reis","nudeln","kartoffel","gemüse","obst","apfel","birne","banane","orange","zitrone","traube","erdbeere","himbeere","kirsche","pfirsich","pflaume","melone","ananas","mango","tomate","gurke","zwiebel","knoblauch","karotte","möhre","salat","kohl","spinat","erbse","bohne","linse","pilz","mais","paprika","kürbis","nuss","mandel","honig","zucker","salz","pfeffer","öl","essig","mehl","teig","kuchen","torte","keks","schokolade","bonbon","eis","pudding","marmelade","suppe","soße","salz","kaffee","tee","wasser","saft","limonade","kakao","frühstück","mittagessen","abendessen","nachtisch","vorspeise","hauptgericht",
  // Nesne & ev
  "tisch","stuhl","sessel","sofa","bett","schrank","regal","lampe","spiegel","teppich","vorhang","kissen","decke","matratze","tür","fenster","wand","boden","dach","treppe","zimmer","küche","bad","keller","garten","balkon","garage","haus","wohnung","schlüssel","schloss","messer","gabel","löffel","teller","tasse","glas","flasche","topf","pfanne","kanne","schüssel","brett","besen","eimer","seife","handtuch","bürste","kamm","schere","nadel","faden","knopf","hammer","nagel","säge","zange","schraube","leiter","werkzeug","koffer","tasche","rucksack","geldbeutel","uhr","brille","buch","heft","stift","bleistift","papier","schere","kleber","radiergummi","lineal","tafel","computer","handy","telefon","kamera","fernseher","radio","kühlschrank","ofen","herd","waschmaschine","staubsauger",
  // Kıyafet
  "hemd","hose","rock","kleid","jacke","mantel","pullover","schal","mütze","hut","handschuh","socke","schuh","stiefel","gürtel","krawatte","anzug","bluse","shirt","jeans","tasche","knopf","reißverschluss",
  // Doğa
  "baum","blume","blatt","wurzel","zweig","ast","gras","busch","strauch","wald","wiese","feld","berg","tal","hügel","fluss","see","meer","bach","quelle","insel","strand","sand","stein","felsen","erde","boden","himmel","wolke","regen","schnee","eis","wind","sturm","blitz","donner","nebel","sonne","mond","stern","sommer","winter","herbst","frühling","morgen","abend","nacht","tag","woche","monat","jahr","stunde","minute","rose","tulpe","nelke","lilie","eiche","tanne","birke","buche","kiefer","palme","kaktus","moos","pilz",
  // Meslek & insan
  "arzt","ärztin","lehrer","lehrerin","bäcker","metzger","koch","kellner","kellnerin","barista","verkäufer","polizist","feuerwehrmann","soldat","richter","anwalt","ingenieur","techniker","maler","schreiner","tischler","gärtner","bauer","fischer","jäger","pilot","fahrer","schaffner","friseur","schneider","schuster","apotheker","krankenschwester","pfleger","professor","student","schüler","kind","mann","frau","junge","mädchen","baby","eltern","mutter","vater","bruder","schwester","großmutter","großvater","onkel","tante","cousin","freund","nachbar","gast","besitzer","chef","mitarbeiter","kollege",
  // Vücut
  "kopf","haar","auge","augen","ohr","nase","mund","zahn","zähne","zunge","lippe","hals","schulter","arm","hand","finger","daumen","bauch","rücken","bein","knie","fuß","zeh","herz","lunge","magen","haut","knochen","blut","gehirn",
  // Ulaşım & şehir
  "auto","bus","zug","bahn","straßenbahn","fahrrad","motorrad","roller","lastwagen","schiff","boot","flugzeug","hubschrauber","rakete","straße","weg","gasse","platz","brücke","tunnel","bahnhof","flughafen","hafen","haltestelle","ampel","schild","zaun","mauer","kirche","schule","krankenhaus","apotheke","bäckerei","metzgerei","supermarkt","laden","geschäft","markt","museum","theater","kino","bibliothek","park","spielplatz","stadion","hotel","restaurant","café","kneipe","bank","post","rathaus",
  // Soyut & diğer
  "arbeit","geld","preis","zeit","leben","liebe","glück","angst","freude","trauer","hoffnung","traum","idee","plan","frage","antwort","wort","satz","sprache","musik","lied","tanz","spiel","sport","kunst","farbe","form","zahl","name","brief","zeitung","geschichte","märchen","witz","regel","gesetz","freiheit","frieden","krieg","reise","urlaub","fest","geburtstag","hochzeit","geschenk","überraschung","problem","lösung","kraft","macht","wissen","schule","prüfung","note","klasse","gruppe","team","verein","feuer","rauch","licht","schatten","lärm","stille","duft","geschmack","gefühl",
  // Renkler & sıfat-isimler
  "rot","blau","grün","gelb","schwarz","weiß","grau","braun","rosa","lila","orange","gold","silber",
];
