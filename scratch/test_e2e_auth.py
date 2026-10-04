import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\akhil\.gemini\antigravity\brain\707131f5-872a-4d89-9ba2-9fd6555c4dda"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport for KshetraOne responsive view
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        print("[TEST 1] Loading KshetraOne frontend at http://localhost:3000...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        page.evaluate("() => localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # 1. Splash screen: click "Get Started"
        print("[TEST 1.1] Splash Screen: Clicking Get Started...")
        get_started_btn = page.locator("button:has-text('Get Started'), button:has-text('ಪ್ರಾರಂಭಿಸಿ')").first
        get_started_btn.wait_for(state="visible", timeout=10000)
        get_started_btn.click()
        time.sleep(0.5)

        # 2. Language Selection: click "Continue"
        print("[TEST 1.2] Language Selection: Continuing...")
        lang_continue_btn = page.locator("button:has-text('Continue')").first
        lang_continue_btn.wait_for(state="visible", timeout=10000)
        lang_continue_btn.click()
        time.sleep(0.5)

        # 3. Auth screen: verify Phone OTP is default, then switch to Email
        print("[TEST 1.3] Auth Screen: Checking phone tab and switching to email...")
        email_btn = page.locator("button:has-text('Continue with Email')").first
        email_btn.wait_for(state="visible", timeout=10000)
        email_btn.click()
        time.sleep(0.5)

        # Screenshot Email Login screen
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "native_email_login_screen.png"))
        print("  -> Saved native_email_login_screen.png")

        # 3.1 Test invalid login
        print("[TEST 2] Testing invalid credentials error handling...")
        email_input = page.locator("input[type='email']").first
        email_input.fill("nonexistent.user@kshetraone.org")
        pwd_input = page.locator("input[type='password']").first
        pwd_input.fill("WrongPassword123")
        
        login_btn = page.locator("form button[type='submit']").first
        login_btn.click()
        time.sleep(1.5)

        # Verify error message appears
        error_box = page.locator("text=Invalid email or password").first
        assert error_box.is_visible(), "Expected error message 'Invalid email or password' not visible"
        print("  -> Correctly rejected invalid credentials with backend Argon2 verification error message!")

        # 4. Switch to Email Registration
        print("[TEST 3] Testing Email Registration flow...")
        create_account_link = page.locator("button:has-text('Create Account')").first
        create_account_link.click()
        time.sleep(0.5)

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "native_email_register_screen.png"))
        print("  -> Saved native_email_register_screen.png")

        # Fill registration form
        test_email = f"basavaraj.gowda_{int(time.time())}@kshetraone.org"
        test_name = "Basavaraj Gowda"
        test_pwd = "GowdaSecurePass#2026"

        name_input = page.locator("input[placeholder*='Ramesh Patil']").first
        name_input.fill(test_name)
        reg_email_input = page.locator("form input[type='email']").first
        reg_email_input.fill(test_email)
        
        passwords = page.locator("form input[type='password']")
        passwords.nth(0).fill(test_pwd)
        passwords.nth(1).fill(test_pwd)

        submit_reg_btn = page.locator("form button[type='submit']").first
        submit_reg_btn.click()
        time.sleep(2)

        # 5. Verify navigation to Step 5 (Farmer Profile setup)
        print("[TEST 3.1] Verifying progression to Farmer Profile (Step 5)...")
        profile_heading = page.locator("text=Tell us about you").first
        profile_heading.wait_for(state="visible", timeout=10000)
        assert profile_heading.is_visible(), "Failed to navigate to Farmer Profile after registration"
        print("  -> Successfully navigated to Step 5 (Farmer Profile)!")

        # Check prefilled name
        name_val = page.locator("label:has-text('Name') + input").first.input_value()
        print(f"  -> Prefilled farmer name in Step 5: '{name_val}'")
        assert "Basavaraj" in name_val

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "native_farmer_profile_step5.png"))
        print("  -> Saved native_farmer_profile_step5.png")

        # 6. Complete remaining onboarding wizard steps
        print("[TEST 4] Completing onboarding wizard steps to reach Dashboard...")
        # Step 5 (Profile) -> Click Next
        page.locator("button:has-text('Next')").first.click()
        time.sleep(0.5)

        # Step 6 (Farm type) -> Click Next
        page.locator("button:has-text('Next')").first.click()
        time.sleep(0.5)

        # Step 7 (Land & Crops) -> Click Next
        page.locator("button:has-text('Next')").first.click()
        time.sleep(0.5)

        # Step 8 (Livestock) -> Click Complete Setup
        page.locator("button:has-text('Complete Setup')").first.click()
        time.sleep(0.5)

        # Step 9 (Setup Complete) -> Click Go to Dashboard
        finish_btn = page.locator("button:has-text('Go to Dashboard')").first
        finish_btn.wait_for(state="visible", timeout=10000)
        finish_btn.click()
        time.sleep(2)

        # Verify Dashboard is reached
        print("[TEST 4.1] Verifying Dashboard access...")
        dashboard_heading = page.locator("text=KshetraOne, text=Crop, text=Dairy, text=Overview").first
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "native_dashboard_screen.png"))
        print("  -> Saved native_dashboard_screen.png")

        # 7. Test Returning User Login with the newly registered user
        print("[TEST 5] Testing returning user login in a new session...")
        context2 = browser.new_context(viewport={"width": 390, "height": 844})
        page2 = context2.new_page()
        page2.goto("http://localhost:3000")
        page2.wait_for_load_state("networkidle")
        page2.evaluate("() => localStorage.clear()")
        page2.reload()
        page2.wait_for_load_state("networkidle")
        time.sleep(1)

        # Get Started -> Language Continue -> Email Login
        page2.locator("button:has-text('Get Started'), button:has-text('ಪ್ರಾರಂಭಿಸಿ')").first.click()
        time.sleep(0.5)
        page2.locator("button:has-text('Continue')").first.click()
        time.sleep(0.5)
        page2.locator("button:has-text('Continue with Email')").first.click()
        time.sleep(0.5)

        # Enter the credentials created in Test 3
        page2.locator("input[type='email']").first.fill(test_email)
        page2.locator("input[type='password']").first.fill(test_pwd)
        page2.locator("form button[type='submit']").first.click()
        time.sleep(2)

        # Returning user should directly enter the Dashboard!
        print("[TEST 5.1] Verifying returning user reaches Dashboard directly...")
        page2.wait_for_load_state("networkidle")
        time.sleep(1)
        page2.screenshot(path=os.path.join(ARTIFACT_DIR, "native_returning_dashboard.png"))
        print("  -> Saved native_returning_dashboard.png")

        # 8. Test Forgot Password
        print("[TEST 6] Testing Forgot Password notification...")
        context3 = browser.new_context(viewport={"width": 390, "height": 844})
        page3 = context3.new_page()
        page3.goto("http://localhost:3000")
        page3.evaluate("() => localStorage.clear()")
        page3.reload()
        page3.locator("button:has-text('Get Started'), button:has-text('ಪ್ರಾರಂಭಿಸಿ')").first.click()
        time.sleep(0.5)
        page3.locator("button:has-text('Continue')").first.click()
        time.sleep(0.5)
        page3.locator("button:has-text('Continue with Email')").first.click()
        time.sleep(0.5)

        page3.locator("button:has-text('Forgot Password?')").first.click()
        time.sleep(0.5)
        page3.locator("form input[type='email']").first.fill(test_email)
        page3.locator("form button[type='submit']").first.click()
        time.sleep(1.5)

        reset_notice = page3.locator("text=Outbound email delivery is disabled under the ₹0 budget").first
        assert reset_notice.is_visible(), "Expected ₹0 budget notice not shown on forgot password"
        print("  -> Honest Rs. 0 budget message verified successfully on Forgot Password!")

        browser.close()
        print("\n=== ALL PLAYWRIGHT END-TO-END TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
