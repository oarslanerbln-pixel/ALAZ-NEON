import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { loadLocale } from "../lib/i18n";

// Extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Uygulamada tr/en sözlükleri seçilince tembel iniyor (lib/i18n.ts). Testler
// dili eşzamanlı değiştirip hemen t() çağırıyor; sözlükleri baştan yükle ki
// setLocale anında uygulansın.
await Promise.all([loadLocale("tr"), loadLocale("en")]);
