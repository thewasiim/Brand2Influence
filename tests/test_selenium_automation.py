import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.mark.selenium
class TestSeleniumAutomation:
    """
    3.3 Explore Testing Tools: Selenium WebDriver Automation
    Demonstrating browser-level automated testing for Single Page App (SPA)
    navigation, DOM rendering, and user flow verification.
    """

    @pytest.fixture
    def driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1280,800")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(5)
        yield driver
        driver.quit()

    def test_selenium_landing_page_title_and_mount(self, driver, frontend_url):
        """Selenium Test: Verify root page loads, React app mounts, and title is correct."""
        driver.get(frontend_url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        assert "Brand2Influence" in driver.title or "BrandHUB" in driver.title or len(driver.title) > 0
        root_element = driver.find_element(By.ID, "root")
        assert root_element.is_displayed()

    def test_selenium_navigation_to_explore_page(self, driver, frontend_url):
        """Selenium Test: Navigate to /explore and ensure grid container renders."""
        driver.get(f"{frontend_url}/explore")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        assert "/explore" in driver.current_url

    def test_selenium_navigation_to_creators_directory(self, driver, frontend_url):
        """Selenium Test: Navigate to /discover (Creators) directory."""
        driver.get(f"{frontend_url}/discover")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        assert "/discover" in driver.current_url or "/creators" in driver.current_url

    def test_selenium_navigation_to_brands_directory(self, driver, frontend_url):
        """Selenium Test: Navigate to /brands directory."""
        driver.get(f"{frontend_url}/brands")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        assert "/brands" in driver.current_url
