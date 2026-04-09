import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000")

        print("Checking for disclaimer...")
        disclaimer = await page.locator("text=Bu bir tıbbi tavsiye değildir").count()
        assert disclaimer > 0, "Disclaimer not found!"
        print(f"Found {disclaimer} disclaimer(s).")

        print("Checking for medication items...")
        med_items = await page.locator("[role='button']").count()
        assert med_items > 0, "No medication buttons found!"
        print(f"Found {med_items} medication button(s).")

        print("Checking for file input...")
        file_input = await page.locator("input[type='file']").count()
        assert file_input > 0, "No file input found!"
        print(f"Found {file_input} file input(s).")

        await browser.close()
        print("UI Verification Passed successfully!")

asyncio.run(main())
