import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(record_video_dir="/home/jules/verification/videos/")
        page = await context.new_page()

        print("Testing High Contrast Layout...")
        await page.goto("http://localhost:3000/")
        # await page.wait_for_load_state("networkidle")
        await page.screenshot(path="/home/jules/verification/screenshots/homepage.png")

        print("Testing UploadDocument Animation...")
        # Start scan animation
        await page.click("button:has-text('Kamera ile Yükle')")
        await page.screenshot(path="/home/jules/verification/screenshots/upload_document_scanning.png")

        # Wait for animation to finish
        await asyncio.sleep(3.5)

        print("Testing Medication Dashboard...")
        # Toggle a medication state
        await page.locator("div[role='button']").first.click()
        await page.screenshot(path="/home/jules/verification/screenshots/medication_dashboard_toggled.png")

        await context.close()
        await browser.close()
        print("Done!")

asyncio.run(main())
