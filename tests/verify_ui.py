from playwright.sync_api import sync_playwright
import time
import subprocess
import os

# Start the frontend server in the background
server_process = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd="frontend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Wait for server to start
time.sleep(5)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the local server
        page.goto("http://localhost:3000")

        # Wait for elements to be visible
        page.wait_for_selector("text=MediSade")

        # Take a screenshot
        os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
        screenshot_path = "/home/jules/verification/screenshots/ui-verify.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Check disclaimer
        disclaimer = page.locator("text=Bu bir tıbbi tavsiye değildir").is_visible()
        print(f"Disclaimer visible: {disclaimer}")

        # Check upload button
        upload_button = page.locator("text=Rapor Seç veya Kamerayı Aç").is_visible()
        print(f"Upload button visible: {upload_button}")

        # Check dashboard
        dashboard = page.locator("text=Günlük İlaç Takibi").is_visible()
        print(f"Dashboard visible: {dashboard}")

        browser.close()
finally:
    # Kill the server
    server_process.terminate()
    server_process.wait()
