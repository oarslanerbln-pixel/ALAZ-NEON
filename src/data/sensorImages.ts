export interface SensorImage {
  id: string;
  url: string;
  answer: string;
  category: string;
}

export const SENSOR_IMAGES: SensorImage[] = [
  {
    id: "si-1",
    url: "https://images.unsplash.com/photo-1542314831-c6a420458604?q=80&w=2000&auto=format&fit=crop",
    answer: "Kahve",
    category: "İçecek",
  },
  {
    id: "si-2",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop",
    answer: "Çip / Anakart",
    category: "Teknoloji",
  },
  {
    id: "si-3",
    url: "https://images.unsplash.com/photo-1494253109108-2e30c049369b?q=80&w=2000&auto=format&fit=crop",
    answer: "Limon",
    category: "Meyve",
  },
  {
    id: "si-4",
    url: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?q=80&w=2000&auto=format&fit=crop",
    answer: "Fotoğraf Makinesi",
    category: "Eşya",
  },
  {
    id: "si-5",
    url: "https://images.unsplash.com/photo-1533038590840-1c798b14a51e?q=80&w=2000&auto=format&fit=crop",
    answer: "Pizza",
    category: "Yemek",
  },
  {
    id: "si-6",
    url: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?q=80&w=2000&auto=format&fit=crop",
    answer: "Egzersiz / Ağırlık",
    category: "Spor",
  },
  {
    id: "si-7",
    url: "https://images.unsplash.com/photo-1507676184212-d0c30a5144f8?q=80&w=2000&auto=format&fit=crop",
    answer: "Mikrofon",
    category: "Müzik / Eşya",
  },
  {
    id: "si-8",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop",
    answer: "Gökkuşağı",
    category: "Doğa",
  },
  {
    id: "si-9",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop",
    answer: "Astronot",
    category: "Uzay",
  },
  {
    id: "si-10",
    url: "https://images.unsplash.com/photo-1444464666168-49b626f49cb9?q=80&w=2000&auto=format&fit=crop",
    answer: "Papatya",
    category: "Çiçek / Doğa",
  },
  {
    id: "si-11",
    url: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=2000&auto=format&fit=crop",
    answer: "Tren",
    category: "Ulaşım",
  },
  {
    id: "si-12",
    url: "https://images.unsplash.com/photo-1618365908648-e71bd5716cba?q=80&w=2000&auto=format&fit=crop",
    answer: "Kitap",
    category: "Eğitim / Eşya",
  },
  {
    id: "si-13",
    url: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=2000&auto=format&fit=crop",
    answer: "Kaktüs",
    category: "Bitki",
  },
  {
    id: "si-14",
    url: "https://images.unsplash.com/photo-1520113412646-dfeb547d2f95?q=80&w=2000&auto=format&fit=crop",
    answer: "Çilek",
    category: "Meyve",
  },
  {
    id: "si-15",
    url: "https://images.unsplash.com/photo-1573059224875-f1404306b3e2?q=80&w=2000&auto=format&fit=crop",
    answer: "Şemsiye",
    category: "Eşya",
  },
  {
    id: "si-16",
    url: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=2000&auto=format&fit=crop",
    answer: "Gözlük",
    category: "Moda",
  },
  {
    id: "si-17",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2000&auto=format&fit=crop",
    answer: "Odun / Ateş",
    category: "Doğa",
  },
  {
    id: "si-18",
    url: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2000&auto=format&fit=crop",
    answer: "Hamburger",
    category: "Yemek",
  },
  {
    id: "si-19",
    url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2000&auto=format&fit=crop",
    answer: "Oyun Kolu",
    category: "Eğlence / Teknoloji",
  },
  {
    id: "si-20",
    url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=2000&auto=format&fit=crop",
    answer: "Bisiklet",
    category: "Araç / Spor",
  }
];

export function getRandomSensorImage(usedIds: string[] = []): SensorImage {
  let available = SENSOR_IMAGES.filter(img => !usedIds.includes(img.id));
  if (available.length === 0) {
    available = SENSOR_IMAGES;
  }
  return available[Math.floor(Math.random() * available.length)];
}
