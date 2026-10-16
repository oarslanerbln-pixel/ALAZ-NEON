/**
 * Almanca yaygın CINS ISIM listesi.
 *
 * İki işe birden yarıyor (bkz. lib/answerLanguage.ts ve lib/categoryValidation.ts):
 *  1. Dil ve kategori kontrolü — soyut kavramların (ör. Irrtum) eşya
 *     kategorisine yazılmasını veya başka dil kelimelerini otomatik yakalar.
 *  2. Yazım hatası — kelime hiçbir listede yok ama oyun dilindeki bir
 *     kelimeye bir-iki harf uzaklıktaysa, yazım hatası sayılıp kısmi puan
 *     alıyor ("Vgel" → "Vögel").
 */

export const DE_ANIMALS: readonly string[] = [
  "hund","katze","maus","ratte","pferd","kuh","schwein","schaf","ziege","huhn","hahn","ente","gans","vogel","vögel","adler","eule","falke","taube","spatz","storch","fisch","hai","wal","delfin","krebs","hummer","muschel","frosch","kröte","schlange","eidechse","schildkröte","krokodil","löwe","tiger","bär","wolf","fuchs","hase","kaninchen","hirsch","reh","elch","affe","elefant","giraffe","zebra","nilpferd","nashorn","kamel","känguru","koala","panda","pinguin","robbe","biene","wespe","ameise","fliege","mücke","spinne","schmetterling","käfer","wurm","schnecke","igel","eichhörnchen","maulwurf","fledermaus","esel","kalb","lamm","ferkel","welpe","küken",
];

export const DE_FOOD: readonly string[] = [
  "brot","brötchen","butter","käse","milch","sahne","joghurt","quark","ei","eier","fleisch","wurst","schinken","speck","huhn","fisch","reis","nudeln","kartoffel","gemüse","obst","apfel","birne","banane","orange","zitrone","traube","erdbeere","himbeere","kirsche","pfirsich","pflaume","melone","ananas","mango","tomate","gurke","zwiebel","knoblauch","karotte","möhre","salat","kohl","spinat","erbse","bohne","linse","pilz","mais","paprika","kürbis","nuss","mandel","honig","zucker","salz","pfeffer","öl","essig","mehl","teig","kuchen","torte","keks","schokolade","bonbon","eis","pudding","marmelade","suppe","soße","salz","kaffee","tee","wasser","saft","limonade","kakao","frühstück","mittagessen","abendessen","nachtisch","vorspeise","hauptgericht",
];

export const DE_OBJECTS: readonly string[] = [
  "tisch","stuhl","sessel","sofa","bett","schrank","regal","lampe","spiegel","teppich","vorhang","kissen","decke","matratze","tür","fenster","wand","boden","dach","treppe","zimmer","küche","bad","keller","garten","balkon","garage","haus","wohnung","schlüssel","schloss","messer","gabel","löffel","teller","tasse","glas","flasche","topf","pfanne","kanne","schüssel","brett","besen","eimer","seife","handtuch","bürste","kamm","schere","nadel","faden","knopf","hammer","nagel","säge","zange","schraube","leiter","werkzeug","koffer","tasche","rucksack","geldbeutel","uhr","brille","buch","heft","stift","bleistift","papier","schere","kleber","radiergummi","lineal","tafel","computer","handy","telefon","kamera","fernseher","radio","kühlschrank","ofen","herd","waschmaschine","staubsauger",
];

export const DE_CLOTHING: readonly string[] = [
  "hemd","hose","rock","kleid","jacke","mantel","pullover","schal","mütze","hut","handschuh","socke","schuh","stiefel","gürtel","krawatte","anzug","bluse","shirt","jeans","tasche","knopf","reißverschluss",
];

export const DE_NATURE: readonly string[] = [
  "baum","blume","blatt","wurzel","zweig","ast","gras","busch","strauch","wald","wiese","feld","berg","tal","hügel","fluss","see","meer","bach","quelle","insel","strand","sand","stein","felsen","erde","boden","himmel","wolke","regen","schnee","eis","wind","sturm","blitz","donner","nebel","sonne","mond","stern","sommer","winter","herbst","frühling","morgen","abend","nacht","tag","woche","monat","jahr","stunde","minute","rose","tulpe","nelke","lilie","eiche","tanne","birke","buche","kiefer","palme","kaktus","moos","pilz",
];

export const DE_JOBS: readonly string[] = [
  "arzt","ärztin","lehrer","lehrerin","bäcker","metzger","koch","kellner","kellnerin","barista","verkäufer","polizist","feuerwehrmann","soldat","richter","anwalt","ingenieur","techniker","maler","schreiner","tischler","gärtner","bauer","fischer","jäger","pilot","fahrer","schaffner","friseur","schneider","schuster","apotheker","krankenschwester","pfleger","professor","student","schüler","kind","mann","frau","junge","mädchen","baby","eltern","mutter","vater","bruder","schwester","großmutter","großvater","onkel","tante","cousin","freund","nachbar","gast","besitzer","chef","mitarbeiter","kollege",
];

export const DE_BODY: readonly string[] = [
  "kopf","haar","auge","augen","ohr","nase","mund","zahn","zähne","zunge","lippe","hals","schulter","arm","hand","finger","daumen","bauch","rücken","bein","knie","fuß","zeh","herz","lunge","magen","haut","knochen","blut","gehirn",
];

export const DE_TRANSPORT_CITY: readonly string[] = [
  "auto","bus","zug","bahn","straßenbahn","fahrrad","motorrad","roller","lastwagen","schiff","boot","flugzeug","hubschrauber","rakete","straße","weg","gasse","platz","brücke","tunnel","bahnhof","flughafen","hafen","haltestelle","ampel","schild","zaun","mauer","kirche","schule","krankenhaus","apotheke","bäckerei","metzgerei","supermarkt","laden","geschäft","markt","museum","theater","kino","bibliothek","park","spielplatz","stadion","hotel","restaurant","café","kneipe","bank","post","rathaus",
];

export const DE_ABSTRACT: readonly string[] = [
  "arbeit","geld","preis","zeit","leben","liebe","glück","angst","freude","trauer","hoffnung","traum","idee","plan","frage","antwort","wort","satz","sprache","musik","lied","tanz","spiel","sport","kunst","farbe","form","zahl","name","brief","zeitung","geschichte","märchen","witz","regel","gesetz","freiheit","frieden","krieg","reise","urlaub","fest","geburtstag","hochzeit","geschenk","überraschung","problem","lösung","kraft","macht","wissen","schule","prüfung","note","klasse","gruppe","team","verein","feuer","rauch","licht","schatten","lärm","stille","duft","geschmack","gefühl",
  // Ek soyut kavramlar / zihinsel & duygusal terimler
  "irrtum","gedanke","wahrheit","lüge","mut","wut","stolz","ehre","respekt","glaube","seele","geist","sinn","zweck","schuld","scham","neid","eifersucht","sehnsucht","geduld","erfolg","misserfolg","vernunft","verstand","phantasie","fantasie","illusion","zufall","schicksal","ordnung","chaos","begriff","thema","ursache","wirkung","zustand","vorteil","nachteil","erinnerung","erfahrung","meinung","absicht","zweifel","entscheidung","möglichkeit","geheimnis","gefahr","sicherheit","vertrauen","misstrauen","ruhe","stress","stimmung",
];

export const DE_COLORS: readonly string[] = [
  "rot","blau","grün","gelb","schwarz","weiß","grau","braun","rosa","lila","orange","gold","silber",
];

export const DE_WORDS: readonly string[] = [
  ...DE_ANIMALS,
  ...DE_FOOD,
  ...DE_OBJECTS,
  ...DE_CLOTHING,
  ...DE_NATURE,
  ...DE_JOBS,
  ...DE_BODY,
  ...DE_TRANSPORT_CITY,
  ...DE_ABSTRACT,
  ...DE_COLORS,
];
