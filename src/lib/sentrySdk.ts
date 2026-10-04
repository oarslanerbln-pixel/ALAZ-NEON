/**
 * Sentry SDK'sının uygulamanın kullandığı yüzeyi. lib/monitoring.ts bunu
 * tembel yüklüyor; `import("@sentry/react")` doğrudan yazılsaydı paketleyici
 * ad alanının tamamını (replay, feedback, tracing …) ~156 KB gzip olarak
 * paketliyordu. Adlandırılmış içe aktarma ağaç sallamayı koruyor.
 */
export { captureException, init, setTags } from "@sentry/react";
