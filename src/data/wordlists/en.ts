/**
 * İngilizce yaygın CINS ISIM listesi.
 *
 * İki işe birden yarıyor (bkz. lib/answerLanguage.ts ve lib/categoryValidation.ts):
 *  1. Dil ve kategori kontrolü — soyut kavramların (ör. Idea/Mistake) eşya
 *     kategorisine yazılmasını veya yabancı dildeki kelimeleri otomatik yakalar.
 *  2. Yazım hatası — kelime hiçbir listede yok ama oyun dilindeki bir
 *     kelimeye bir-iki harf uzaklıktaysa, yazım hatası sayılıp kısmi puan
 *     alıyor ("tabl" → "table").
 */

export const EN_ANIMALS: readonly string[] = [
  "dog","cat","mouse","rat","horse","cow","pig","sheep","goat","chicken","rooster","duck","goose","bird","birds","eagle","owl","hawk","pigeon","sparrow","stork","fish","shark","whale","dolphin","crab","lobster","mussel","frog","toad","snake","lizard","turtle","tortoise","crocodile","lion","tiger","bear","wolf","fox","hare","rabbit","deer","elk","monkey","elephant","giraffe","zebra","hippo","rhino","camel","kangaroo","koala","panda","penguin","seal","bee","wasp","ant","fly","mosquito","spider","butterfly","beetle","worm","snail","hedgehog","squirrel","mole","bat","donkey","calf","lamb","puppy","kitten","chick","mule",
];

export const EN_FOOD: readonly string[] = [
  "bread","roll","butter","cheese","milk","cream","yogurt","egg","eggs","meat","sausage","ham","bacon","rice","pasta","noodle","potato","vegetable","fruit","apple","pear","banana","orange","lemon","grape","strawberry","raspberry","cherry","peach","plum","melon","watermelon","pineapple","mango","tomato","cucumber","onion","garlic","carrot","lettuce","cabbage","spinach","pea","bean","lentil","mushroom","corn","pepper","pumpkin","nut","almond","walnut","honey","sugar","salt","oil","vinegar","flour","dough","cake","pie","cookie","biscuit","chocolate","candy","icecream","pudding","jam","soup","sauce","coffee","tea","water","juice","lemonade","cocoa","breakfast","lunch","dinner","dessert","starter","snack",
];

export const EN_OBJECTS: readonly string[] = [
  "table","chair","armchair","sofa","bed","wardrobe","shelf","lamp","mirror","carpet","curtain","pillow","blanket","mattress","door","window","wall","floor","roof","stairs","room","kitchen","bathroom","basement","garden","balcony","garage","house","flat","apartment","key","lock","knife","fork","spoon","plate","cup","glass","bottle","pot","pan","kettle","bowl","board","broom","bucket","soap","towel","brush","comb","scissors","needle","thread","button","hammer","nail","saw","pliers","screw","ladder","tool","suitcase","bag","backpack","wallet","watch","clock","glasses","book","notebook","pen","pencil","paper","glue","eraser","ruler","computer","phone","camera","television","radio","fridge","oven","stove","washer","vacuum",
];

export const EN_CLOTHING: readonly string[] = [
  "shirt","trousers","pants","skirt","dress","jacket","coat","sweater","scarf","cap","hat","glove","sock","shoe","boot","belt","tie","suit","blouse","tshirt","jeans","zipper",
];

export const EN_NATURE: readonly string[] = [
  "tree","flower","leaf","root","branch","grass","bush","forest","meadow","field","mountain","valley","hill","river","lake","sea","ocean","stream","spring","island","beach","sand","stone","rock","soil","earth","sky","cloud","rain","snow","ice","wind","storm","lightning","thunder","fog","sun","moon","star","summer","winter","autumn","spring","morning","evening","night","day","week","month","year","hour","minute","rose","tulip","lily","oak","pine","birch","beech","palm","cactus","moss",
];

export const EN_JOBS: readonly string[] = [
  "doctor","nurse","teacher","baker","butcher","cook","chef","waiter","waitress","barista","seller","police","firefighter","soldier","judge","lawyer","engineer","technician","painter","carpenter","gardener","farmer","fisherman","hunter","pilot","driver","barber","hairdresser","tailor","pharmacist","professor","student","pupil","child","man","woman","boy","girl","baby","parent","mother","father","brother","sister","grandmother","grandfather","uncle","aunt","cousin","friend","neighbour","neighbor","guest","owner","boss","employee","colleague",
];

export const EN_BODY: readonly string[] = [
  "head","hair","eye","eyes","ear","nose","mouth","tooth","teeth","tongue","lip","neck","shoulder","arm","hand","finger","thumb","belly","stomach","back","leg","knee","foot","toe","heart","lung","skin","bone","blood","brain",
];

export const EN_TRANSPORT_CITY: readonly string[] = [
  "car","bus","train","tram","bicycle","bike","motorcycle","scooter","truck","ship","boat","plane","aeroplane","airplane","helicopter","rocket","street","road","lane","square","bridge","tunnel","station","airport","harbour","harbor","stop","trafficlight","sign","fence","wall","church","mosque","school","hospital","pharmacy","bakery","supermarket","shop","store","market","museum","theatre","theater","cinema","library","park","playground","stadium","hotel","restaurant","cafe","bank","post","townhall",
];

export const EN_ABSTRACT: readonly string[] = [
  "work","money","price","time","life","love","luck","fear","joy","sadness","hope","dream","idea","plan","question","answer","word","sentence","language","music","song","dance","game","sport","art","colour","color","shape","number","name","letter","newspaper","story","tale","joke","rule","law","freedom","peace","war","journey","trip","holiday","vacation","feast","birthday","wedding","gift","present","surprise","problem","solution","power","strength","knowledge","exam","grade","class","group","team","club","fire","smoke","light","shadow","noise","silence","smell","taste","feeling",
  // Ek soyut kavramlar / zihinsel & duygusal terimler
  "mistake","error","thought","truth","lie","courage","anger","pride","honor","honour","respect","faith","belief","soul","spirit","mind","meaning","purpose","guilt","shame","envy","jealousy","patience","success","failure","reason","logic","imagination","illusion","order","chaos","concept","topic","cause","effect","memory","experience","opinion","intention","doubt","decision","possibility","opportunity","secret","danger","safety","trust","distrust","stress",
];

export const EN_COLORS: readonly string[] = [
  "red","blue","green","yellow","black","white","grey","gray","brown","pink","purple","orange","gold","silver",
];

export const EN_WORDS: readonly string[] = [
  ...EN_ANIMALS,
  ...EN_FOOD,
  ...EN_OBJECTS,
  ...EN_CLOTHING,
  ...EN_NATURE,
  ...EN_JOBS,
  ...EN_BODY,
  ...EN_TRANSPORT_CITY,
  ...EN_ABSTRACT,
  ...EN_COLORS,
];
