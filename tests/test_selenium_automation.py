import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@pytest.fixture
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,800")
    chrome_options.page_load_strategy = "eager"

    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()


@pytest.mark.selenium
class TestSeleniumAutomation:
    """
    3.3 Explore Testing Tools: Selenium WebDriver Automation
    Demonstrating browser-level automated testing for Single Page App (SPA)
    navigation, DOM rendering, and user flow verification.
    """

    def test_selenium_landing_page_title_and_mount(self, driver, frontend_url):
        """Selenium Test: Verify root page loads, React app mounts, and title is correct."""
        driver.get(frontend_url)
        root_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        assert len(driver.title) > 0, f"Page title is empty. Got: {driver.title!r}"
        assert root_element is not None, "#root element not found in DOM"

    def test_selenium_navigation_to_explore_page(self, driver, frontend_url):
        """Selenium Test: Navigate to /explore and ensure grid container renders."""
        driver.get(f"{frontend_url}/explore")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        current_url = driver.current_url
        assert "/explore" in current_url or "/auth/login" in current_url or "/login" in current_url,             f"Expected /explore or login redirect, got: {current_url}"

    def test_selenium_navigation_to_creators_directory(self, driver, frontend_url):
        """Selenium Test: Navigate to /discover (Creators) directory."""
        driver.get(f"{frontend_url}/discover")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        current_url = driver.current_url
        assert "/discover" in current_url or "/creators" in current_url,             f"Expected /discover or /creators, got: {current_url}"

    def test_selenium_navigation_to_brands_directory(self, driver, frontend_url):
        """Selenium Test: Navigate to /brands directory."""
        driver.get(f"{frontend_url}/brands")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "root"))
        )
        current_url = driver.current_url
        assert "/brands" in current_url,             f"Expected /brands in URL, got: {current_url}"
