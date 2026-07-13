from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Ensure the output directory exists
        os.makedirs('/home/jules/verification', exist_ok=True)

        # Take a full page screenshot
        page.screenshot(path='/home/jules/verification/homepage_fixed.png', full_page=True)
        browser.close()

if __name__ == '__main__':
    run()
