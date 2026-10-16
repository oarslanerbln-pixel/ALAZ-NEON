/**
 * Şehir, Ülke ve Nehir isimleri havuzu (Almanca, Türkçe, İngilizce ve Uluslararası).
 *
 * Amaç:
 * 1. Oyuncu "Şehir" kategorisine "Almanya" veya "Deutschland" (ülke) yazdığında
 *    veya "Eşya" kategorisine "Berlin" yazdığında otomatik olarak fark etmek.
 * 2. Bilinen coğrafi varlıkların yanlış kategoriye girilmesini engellemek.
 */

export const WORLD_COUNTRIES: readonly string[] = [
  // Almanca
  "deutschland","türkei","österreich","schweiz","frankreich","italien","spanien","portugal",
  "england","großbritannien","niederlande","belgien","polen","tschechien","ungarn","schweden",
  "norwegen","dänemark","finnland","griechenland","russland","ukraine","rumänien","bulgarien",
  "serbien","kroatien","bosnien","slowenien","slowakei","albanien","nordmazedonien","zypern",
  "irland","island","kanada","mexiko","brasilien","argentinien","chile","kolumbien","peru",
  "ägypten","marokko","tunesien","südafrika","nigeria","kenia","china","japan","südkorea",
  "nordkorea","indien","pakistan","indonesien","thailand","vietnam","philippinen","singapur",
  "australien","neuseeland","saudi-arabien","emirate","israel","iran","irak","syrien","georgien",
  "armenien","aserbaidschan","kasachstan","usbekistan",

  // Türkçe
  "türkiye","almanya","avusturya","isviçre","fransa","italya","ispanya","portekiz",
  "ingiltere","birleşik krallık","hollanda","belçika","polonya","çekya","çek cumhuriyeti",
  "macaristan","isveç","norveç","danimarka","finlandiya","yunanistan","rusya","ukrayna",
  "romanya","bulgaristan","sırbistan","hırvatistan","bosna hersek","slovenya","slovakya",
  "arnavutluk","kuzey makedonya","kıbrıs","irlanda","izlanda","abd","amerika","kanada",
  "meksika","brezilya","arjantin","şili","kolombiya","peru","mısır","fas","tunus",
  "güney afrika","nijerya","kenya","çin","japonya","güney kore","kuzey kore","hindistan",
  "pakistan","endonezya","tayland","vietnam","filipinler","singapur","avustralya",
  "yeni zelanda","suudi arabistan","birleşik arap emirlikleri","israil","iran","ırak",
  "suriye","gürcistan","ermenistan","azerbaycan","kazakistan","özbekistan",

  // İngilizce
  "germany","turkey","austria","switzerland","france","italy","spain","portugal",
  "united kingdom","britain","netherlands","belgium","poland","czechia","czech republic",
  "hungary","sweden","norway","denmark","finland","greece","russia","ukraine",
  "romania","bulgaria","serbia","croatia","bosnia","slovenia","slovakia","albania",
  "north macedonia","cyprus","ireland","iceland","usa","united states","canada","mexico",
  "brazil","argentina","chile","colombia","egypt","morocco","tunisia","south africa",
  "nigeria","kenya","china","japan","south korea","north korea","india","pakistan",
  "indonesia","thailand","philippines","singapore","australia","new zealand",
  "saudi arabia","united arab emirates","israel","iraq","syria","georgia","armenia",
  "azerbaijan","kazakhstan","uzbekistan",
];

export const WORLD_CITIES: readonly string[] = [
  // Almanya
  "berlin","hamburg","münchen","köln","frankfurt","stuttgart","düsseldorf","dortmund",
  "essen","leipzig","bremen","dresden","hannover","nürnberg","duisburg","bochum",
  "wuppertal","bielefeld","bonn","münster","karlsruhe","mannheim","augsburg","wiesbaden",
  "gelsenkirchen","mönchengladbach","braunschweig","chemnitz","kiel","aachen","halle",
  "magdeburg","freiburg","krefeld","lübeck","mainz","erfurt","rostock","kassel","hagen",
  "saarbrücken","potsdam","ludwigshafen","osnabrück","oldenburg","heidelberg","darmstadt",

  // Türkiye
  "istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","şanlıurfa",
  "kocaeli","mersin","diyarbakır","hatay","manisa","kayseri","samsun","balıkesir",
  "kahramanmaraş","van","aydın","denizli","sakarya","tekirdağ","muğla","eskişehir",
  "mardin","malatya","trabzon","erzurum","ordu","afyonkarahisar","afyon","sivas","batman",
  "tokat","zonguldak","elazığ","kütahya","çanakkale","osmaniye","çorum","giresun","isparta",
  "yozgat","muş","edirne","aksaray","kastamonu","düzce","uşak","kırklareli","niğde",
  "amasya","rize","bolu","nevşehir","yalova","kars","kilis","hakkari","siirt","karaman",
  "şırnak","kırıkkale","bartın","ardahan","iğdır","karabük","çankırı","artvin","gümüşhane",
  "bilecik","sinop","tunceli","bayburt",

  // Avrupa & Dünya Başkentleri ve Metropolleri
  "paris","london","rom","roma","rome","madrid","wien","vienna","viyana","bern","zürich",
  "genf","geneva","brüssel","brussels","amsterdam","warschau","warsaw","varşova","prag",
  "prague","budapest","budapeşte","stockholm","oslo","kopenhagen","copenhagen","kopenhag",
  "helsinki","athen","athens","atina","lissabon","lisbon","lizbon","dublin","zagreb",
  "belgrad","belgrade","sarajevo","saraybosna","bukarest","bucharest","bükreş","sofia",
  "sofya","kiew","kyiv","kiev","moskau","moscow","moskova","tokio","tokyo","peking",
  "beijing","seoul","bangkok","singapur","singapore","sydney","melbourne","new york",
  "los angeles","chicago","washington","miami","san francisco","toronto","vancouver",
  "montreal","kairo","cairo","kahire","dubai","abu dhabi","doha","riyad","riyadh",
  "teheran","tehran","bagdad","baghdad","bağdat","damaskus","damascus","şam",
  "baku","bakü","tiflis","tbilisi","eriwan","yerevan","astana","taschkent","tashkent",
];

export const WORLD_RIVERS: readonly string[] = [
  // Almanca & Avrupa
  "rhein","donau","elbe","oder","weser","main","spree","mosel","neckar","inn","isar",
  "ruhr","havel","lahn","saale","trave","eider","werra","fulda",

  // Türkiye
  "fırat","dicle","kızılırmak","yeşilırmak","sakarya","seyhan","ceyhan","meriç","gediz",
  "büyük menderes","küçük menderes","çoruh","araz","aras","susurluk","bakırçay",

  // Dünya
  "nil","amazon","amazonas","mississippi","missouri","colorado","themse","thames",
  "seine","loire","rhone","tiber","wolga","volga","don","dnyepr","ural","ganges",
  "indus","jangtse","yangtze","mekong","kongo","zambezi",
];
