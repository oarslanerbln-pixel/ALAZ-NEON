import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collectionGroup, doc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { createLogger } from "../lib/logger";
import { DEFAULT_VENUE_ID } from "../lib/venues";
import { useVenue } from "../contexts/VenueContextCore";

const log = createLogger("useIsStaff");

export interface StaffState {
  /** Oturum çözülene kadar undefined; sonra hesap ya da null. */
  user: User | null | undefined;
  /** Hesap SEÇİLİ mekanın personeli mi. Oturum/kayıt çözülene kadar undefined. */
  isStaff: boolean | undefined;
  /** Hesabın personeli olduğu mekanlar; çözülene kadar undefined. */
  venues: string[] | undefined;
  /** Mekanda sahip mi (personel ekleyip çıkarabilir). */
  isOwner: boolean;
}

/**
 * "Bu hesap bu mekanın personeli mi?" sorusunun tek cevap yeri
 * (docs/design/3.1-cok-mekan.md).
 *
 * - Üyelik `venues/{v}/staff/{uid}` kayıtlarından gelir (collection group
 *   sorgusu; kural yalnızca kişinin kendi kayıtlarını okutuyor). Bu kayıtları
 *   istemciden yalnızca mekanın sahibi yazabiliyor, sahibi HENGAME ekibi
 *   atıyor (firestore.rules).
 * - Geçiş (aşama A): eski global `staff/{uid}` kaydı `default` mekanın
 *   personeli sayılır.
 * - Hesap seçili mekanın personeli değilse ve tek bir mekanı varsa o mekan
 *   kendiliğinden seçilir; birden çoksa ekran VenueSwitcher gösterir.
 *
 * Önceden yetki `providerData`'da "password" sağlayıcısı aranarak veriliyordu;
 * /register herkese açık olduğu için bu "kayıt olan herkes personeldir"
 * demekti. Hata hâlinde yetki VERİLMEZ: güvenlik kararı kapalı tarafa düşer.
 */
export function useIsStaff(): StaffState {
  const { venueId, selectVenue } = useVenue();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  /** Cevabın hangi hesap için olduğu: hesap değişince eski cevap yeni hesaba sızmasın. */
  const [legacy, setLegacy] = useState<{ uid: string; staff: boolean } | null>(null);
  const [memberships, setMemberships] = useState<{ uid: string; venues: { id: string; role: string }[] } | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const stopLegacy = onSnapshot(
      doc(db, "staff", uid),
      (snap) => setLegacy({ uid, staff: snap.exists() }),
      (err) => {
        log.error("Personel kaydı okunamadı:", err);
        setLegacy({ uid, staff: false });
      },
    );
    const stopVenues = onSnapshot(
      query(collectionGroup(db, "staff"), where("uid", "==", uid)),
      (snap) =>
        setMemberships({
          uid,
          venues: snap.docs
            .map((d) => ({ id: d.ref.parent.parent?.id ?? "", role: String(d.data().role ?? "staff") }))
            .filter((v) => v.id),
        }),
      (err) => {
        log.error("Mekan üyelikleri okunamadı:", err);
        setMemberships({ uid, venues: [] });
      },
    );
    return () => {
      stopLegacy();
      stopVenues();
    };
  }, [user]);

  const resolved = !!user && legacy?.uid === user.uid && memberships?.uid === user.uid;
  const venues = useMemo(
    () =>
      resolved && legacy && memberships
        ? [...new Set([...memberships.venues.map((v) => v.id), ...(legacy.staff ? [DEFAULT_VENUE_ID] : [])])]
        : undefined,
    [resolved, legacy, memberships],
  );

  // Seçili mekanın personeli değil ama tek mekanı varsa onu seç.
  useEffect(() => {
    if (venues && venues.length === 1 && venues[0] !== venueId) selectVenue(venues[0]);
  }, [venues, venueId, selectVenue]);

  const isStaff = user === undefined ? undefined : user === null ? false : venues ? venues.includes(venueId) : undefined;
  const isOwner = resolved && !!memberships?.venues.some((v) => v.id === venueId && v.role === "owner");
  return { user, isStaff, venues, isOwner };
}
