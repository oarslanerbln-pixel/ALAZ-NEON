import type { LeagueTier, UserProfile } from "../types/database";

const LEAGUES: readonly LeagueTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "NEON", "LEGEND"];

/**
 * Firestore'daki profil kaydını eksiksiz bir UserProfile'a çevirir.
 *
 * Kayıt eksik olabilir: katılım ekranı, profil dinleyicisi tam profili
 * yazmadan önce takma adı `setDoc(…, { merge: true })` ile yazarsa yalnızca
 * `nickname` alanı olan bir kayıt oluşur; dinleyici kaydı "var" gördüğü için
 * tam profili bir daha yazmaz. Eskiden bu kayıt olduğu gibi kullanılıyor ve
 * profil kartı `phone_number.replace` üzerinde çöküyordu (uçtan uca testler
 * yakaladı). Eksik alanlar artık okuma anında varsayılanla dolduruluyor;
 * kural istemcinin bu alanları sonradan yazmasına zaten izin vermiyor.
 */
export function normalizeProfile(uid: string, data: Record<string, unknown> | undefined): UserProfile {
  const d = data ?? {};
  const league = d.current_league;
  return {
    uid,
    phone_number: typeof d.phone_number === "string" ? d.phone_number : "",
    nickname:
      typeof d.nickname === "string" && d.nickname.trim() !== ""
        ? d.nickname
        : `PLAYER_${uid.substring(0, 4)}`,
    total_lifetime_score: typeof d.total_lifetime_score === "number" ? d.total_lifetime_score : 0,
    current_league:
      typeof league === "string" && (LEAGUES as readonly string[]).includes(league)
        ? (league as LeagueTier)
        : "BRONZE",
    created_at: typeof d.created_at === "number" ? d.created_at : 0,
    last_active: typeof d.last_active === "number" ? d.last_active : 0,
  };
}
