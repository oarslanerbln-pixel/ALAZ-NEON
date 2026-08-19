import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import type { UserProfile } from "../types/database";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // `auth.currentUser` is a plain mutable field, not React state — using it
  // as an effect dependency doesn't make the effect re-run when auth
  // actually resolves, it only re-runs if something ELSE happens to
  // re-render this component at the right moment. On a fresh page load
  // (Firebase restores the session asynchronously) that meant this hook
  // could get stuck on "not logged in" until an unrelated re-render bailed
  // it out. Subscribing via onAuthStateChanged is the reactive fix.
  useEffect(() => {
    // Declared before onAuthStateChanged runs so the callback always has a
    // real object to write onto, regardless of whether Firebase happens to
    // invoke it synchronously or asynchronously.
    const profileUnsub: { current: (() => void) | undefined } = { current: undefined };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // A user switch (or sign-out) invalidates whatever profile listener
      // was attached to the previous user.
      profileUnsub.current?.();
      profileUnsub.current = undefined;

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const uid = user.uid;
      const phone_number = user.phoneNumber || "";
      const userRef = doc(db, "users", uid);

      profileUnsub.current = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          setProfile({ uid, ...docSnap.data() } as UserProfile);
          setLoading(false);
        } else {
          // Create initial profile if it doesn't exist
          const newProfile: Omit<UserProfile, "uid"> = {
            phone_number,
            nickname: `PLAYER_${uid.substring(0, 4)}`,
            total_lifetime_score: 0,
            current_league: "BRONZE",
            created_at: Date.now(),
            last_active: Date.now(),
          };
          await setDoc(userRef, newProfile);
          setProfile({ uid, ...newProfile } as UserProfile);
          setLoading(false);
        }
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      });
    });

    return () => {
      profileUnsub.current?.();
      unsubscribeAuth();
    };
  }, []);

  const updateNickname = async (newNickname: string) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, { nickname: newNickname }, { merge: true });
  };

  return { profile, loading, updateNickname };
}
