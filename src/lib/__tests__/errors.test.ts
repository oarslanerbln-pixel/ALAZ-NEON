import { describe, expect, it } from "vitest";
import { errorMessage, isAlreadyExists } from "../errors";

/** FirestoreError'ın kurucusu dışa kapalı; SDK'nın fırlattığı biçim: kodlu Error. */
const firestoreError = (code: string, message: string) => Object.assign(new Error(message), { name: "FirebaseError", code });

describe("isAlreadyExists", () => {
  it("onayı kaybolan addDoc'un yeniden denemesini tanır", () => {
    expect(isAlreadyExists(firestoreError("already-exists", "entity already exists"))).toBe(true);
  });

  it("başka Firestore hatalarını başarı saymaz", () => {
    expect(isAlreadyExists(firestoreError("permission-denied", "no"))).toBe(false);
    expect(isAlreadyExists(firestoreError("unavailable", "offline"))).toBe(false);
  });

  it("kodsuz değerlerde false döner", () => {
    expect(isAlreadyExists(new Error("already-exists"))).toBe(false);
    expect(isAlreadyExists("already-exists")).toBe(false);
    expect(isAlreadyExists(null)).toBe(false);
    expect(isAlreadyExists(undefined)).toBe(false);
  });
});

describe("errorMessage", () => {
  it("Error, metin ve message alanlı nesneden okunur mesaj üretir", () => {
    expect(errorMessage(new Error("a"))).toBe("a");
    expect(errorMessage("b")).toBe("b");
    expect(errorMessage({ message: "c" })).toBe("c");
  });
});
