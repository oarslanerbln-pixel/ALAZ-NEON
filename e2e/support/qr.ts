import { createRequire } from "node:module";
import type { BrowserContext, Locator } from "@playwright/test";

const require = createRequire(import.meta.url);
const JSQR_PATH = require.resolve("jsqr/dist/jsQR.js");

/**
 * TV'de görünen QR'ı ekran görüntüsünden çözer — bir misafirin telefon
 * kamerasının yaptığı gibi. DOM'daki `value` özelliğine güvenmiyoruz: QR'ın
 * piksellerinin gerçekten doğru adresi taşıdığını görmek istiyoruz.
 *
 * Çözme işi aynı bağlamda açılan boş bir sayfada jsQR ile yapılır.
 */
export async function decodeQrFromScreen(context: BrowserContext, qr: Locator): Promise<string> {
  const png = await qr.screenshot({ animations: "disabled" });
  const page = await context.newPage();
  try {
    await page.setContent("<!doctype html><title>qr</title>");
    await page.addScriptTag({ path: JSQR_PATH });
    const text = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      // Sessiz bölge: QR'ın çevresine beyaz kenar ekle, sonra çöz.
      const pad = 24;
      const canvas = document.createElement("canvas");
      canvas.width = img.width + pad * 2;
      canvas.height = img.height + pad * 2;
      const g = canvas.getContext("2d")!;
      g.fillStyle = "#fff";
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.drawImage(img, pad, pad);
      const data = g.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = (window as unknown as {
        jsQR: (d: Uint8ClampedArray, w: number, h: number) => { data: string } | null;
      }).jsQR;
      return jsQR(data.data, canvas.width, canvas.height)?.data ?? null;
    }, png.toString("base64"));
    if (!text) throw new Error("QR ekrandan çözülemedi");
    return text;
  } finally {
    await page.close();
  }
}
