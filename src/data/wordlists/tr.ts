/**
 * Türkçe yaygın CINS ISIM listesi.
 *
 * İki işe birden yarıyor (bkz. lib/answerLanguage.ts ve lib/categoryValidation.ts):
 *  1. Dil ve kategori kontrolü — soyut kavramların (ör. Fikir/Hata) eşya
 *     kategorisine yazılmasını veya yabancı dildeki kelimeleri otomatik yakalar.
 *  2. Yazım hatası — kelime hiçbir listede yok ama oyun dilindeki bir
 *     kelimeye bir-iki harf uzaklıktaysa, yazım hatası sayılıp kısmi puan
 *     alıyor ("kpek" → "köpek").
 */

export const TR_ANIMALS: readonly string[] = [
  "köpek","kedi","fare","sıçan","at","inek","domuz","koyun","keçi","tavuk","horoz","ördek","kaz","kuş","kuşlar","kartal","baykuş","şahin","güvercin","serçe","leylek","balık","köpekbalığı","balina","yunus","yengeç","istakoz","midye","kurbağa","yılan","kertenkele","kaplumbağa","timsah","aslan","kaplan","ayı","kurt","tilki","tavşan","geyik","karaca","maymun","fil","zürafa","zebra","suaygırı","gergedan","deve","kanguru","koala","panda","penguen","fok","arı","eşekarısı","karınca","sinek","sivrisinek","örümcek","kelebek","böcek","solucan","salyangoz","kirpi","sincap","köstebek","yarasa","eşek","buzağı","kuzu","yavru","civciv","katır","manda","ceylan",
];

export const TR_FOOD: readonly string[] = [
  "ekmek","simit","tereyağı","peynir","süt","krema","yoğurt","çökelek","yumurta","et","sucuk","salam","pastırma","tavuk","balık","pirinç","makarna","patates","sebze","meyve","elma","armut","muz","portakal","limon","üzüm","çilek","ahududu","kiraz","şeftali","erik","kavun","karpuz","ananas","mango","domates","salatalık","soğan","sarımsak","havuç","marul","lahana","ıspanak","bezelye","fasulye","mercimek","mantar","mısır","biber","kabak","fındık","badem","ceviz","bal","şeker","tuz","karabiber","yağ","sirke","un","hamur","kek","pasta","kurabiye","çikolata","şekerleme","dondurma","muhallebi","reçel","çorba","sos","kahve","çay","su","meyvesuyu","limonata","ayran","kakao","kahvaltı","öğlenyemeği","akşamyemeği","tatlı","meze","börek","pide","lahmacun","kebap","pilav","köfte","dolma","sarma","baklava","lokum","helva",
];

export const TR_OBJECTS: readonly string[] = [
  "masa","sandalye","koltuk","kanepe","yatak","dolap","raf","lamba","ayna","halı","perde","yastık","battaniye","şilte","kapı","pencere","duvar","zemin","çatı","merdiven","oda","mutfak","banyo","bodrum","bahçe","balkon","garaj","ev","daire","anahtar","kilit","bıçak","çatal","kaşık","tabak","fincan","bardak","şişe","tencere","tava","cezve","kase","tahta","süpürge","kova","sabun","havlu","fırça","tarak","makas","iğne","iplik","düğme","çekiç","çivi","testere","pense","vida","merdiven","alet","valiz","çanta","sırtçantası","cüzdan","saat","gözlük","kitap","defter","kalem","kurşunkalem","kağıt","yapıştırıcı","silgi","cetvel","tahta","bilgisayar","telefon","kamera","televizyon","radyo","buzdolabı","fırın","ocak","çamaşırmakinesi","elektriksüpürgesi",
];

export const TR_CLOTHING: readonly string[] = [
  "gömlek","pantolon","etek","elbise","ceket","palto","kazak","atkı","bere","şapka","eldiven","çorap","ayakkabı","çizme","kemer","kravat","takım","bluz","tişört","kot","fermuar",
];

export const TR_NATURE: readonly string[] = [
  "ağaç","çiçek","yaprak","kök","dal","çimen","çalı","orman","çayır","tarla","dağ","vadi","tepe","nehir","göl","deniz","dere","kaynak","ada","plaj","kum","taş","kaya","toprak","gökyüzü","bulut","yağmur","kar","buz","rüzgar","fırtına","şimşek","gökgürültüsü","sis","güneş","ay","yıldız","yaz","kış","sonbahar","ilkbahar","sabah","akşam","gece","gün","hafta","ay","yıl","saat","dakika","gül","lale","karanfil","zambak","meşe","çam","huş","kayın","palmiye","kaktüs","yosun",
];

export const TR_JOBS: readonly string[] = [
  "doktor","hemşire","öğretmen","fırıncı","kasap","aşçı","garson","barista","satıcı","polis","itfaiyeci","asker","hakim","avukat","mühendis","teknisyen","boyacı","marangoz","bahçıvan","çiftçi","balıkçı","avcı","pilot","şoför","biletçi","berber","kuaför","terzi","ayakkabıcı","eczacı","profesör","öğrenci","çocuk","adam","kadın","oğlan","kız","bebek","anne","baba","kardeş","abla","ağabey","büyükanne","büyükbaba","amca","teyze","kuzen","arkadaş","komşu","misafir","patron","çalışan","meslektaş",
];

export const TR_BODY: readonly string[] = [
  "kafa","baş","saç","göz","gözler","kulak","burun","ağız","diş","dişler","dil","dudak","boyun","omuz","kol","el","parmak","başparmak","karın","sırt","bacak","diz","ayak","kalp","akciğer","mide","deri","kemik","kan","beyin",
];

export const TR_TRANSPORT_CITY: readonly string[] = [
  "araba","otobüs","tren","tramvay","bisiklet","motosiklet","scooter","kamyon","gemi","tekne","uçak","helikopter","roket","sokak","yol","cadde","meydan","köprü","tünel","istasyon","havalimanı","liman","durak","trafikışığı","tabela","çit","duvar","cami","kilise","okul","hastane","eczane","fırın","kasap","market","dükkan","mağaza","pazar","müze","tiyatro","sinema","kütüphane","park","oyunparkı","stadyum","otel","restoran","kafe","banka","postane","belediye",
];

export const TR_ABSTRACT: readonly string[] = [
  "iş","para","fiyat","zaman","hayat","aşk","sevgi","mutluluk","korku","sevinç","üzüntü","umut","rüya","fikir","plan","soru","cevap","kelime","cümle","dil","müzik","şarkı","dans","oyun","spor","sanat","renk","şekil","sayı","isim","mektup","gazete","hikaye","masal","şaka","kural","kanun","özgürlük","barış","savaş","yolculuk","tatil","bayram","doğumgünü","düğün","hediye","sürpriz","sorun","çözüm","güç","kuvvet","bilgi","sınav","not","sınıf","grup","takım","dernek","ateş","duman","ışık","gölge","gürültü","sessizlik","koku","tat","duygu",
  // Ek soyut kavramlar / zihinsel & duygusal terimler
  "hata","yanılgı","kusur","düşünce","huzur","keder","ümit","hayal","söz","yasa","hürriyet","sulh","harp","kudret","ilim","his","doğru","gerçek","hakikat","yalan","cesaret","öfke","gurur","onur","şeref","saygı","inanç","iman","ruh","can","akıl","zihin","anlam","mana","amaç","gaye","hedef","suç","günah","utanç","kıskançlık","hasret","özlem","sabır","başarı","zafer","mantık","şans","kader","talih","düzen","kaos","kavga","konu","sebep","neden","sonuç","durum","fayda","zarar","hatıra","anı","tecrübe","deneyim","niyet","şüphe","kuşku","karar","imkan","olasılık","fırsat","sır","tehlike","güven","stres",
];

export const TR_COLORS: readonly string[] = [
  "kırmızı","mavi","yeşil","sarı","siyah","beyaz","gri","kahverengi","pembe","mor","turuncu","altın","gümüş",
];

export const TR_WORDS: readonly string[] = [
  ...TR_ANIMALS,
  ...TR_FOOD,
  ...TR_OBJECTS,
  ...TR_CLOTHING,
  ...TR_NATURE,
  ...TR_JOBS,
  ...TR_BODY,
  ...TR_TRANSPORT_CITY,
  ...TR_ABSTRACT,
  ...TR_COLORS,
];
