# Brand2Influence SQA & Testing Suite

Comprehensive testing suite implementing Software Quality Assurance curriculum requirements:
- **T3.1**: Testing Tactics (EP, BVA, White-Box), Testing Strategies, Testing Levels (Unit, Integration, System), and STLC Phases.
- **3.2**: McCall's Quality Factors (11 Factors), Boehm's Quality Model, SQA Activities.
- **3.3**: Automation Testing with PyTest, Selenium WebDriver, and JUnit XML Reporting.

---

## 📁 Repository Structure

```
tests/
├── conftest.py                   # PyTest fixtures, base URLs, auth token generators
├── pytest.ini                   # Configuration, markers (unit, integration, system, selenium)
├── test_unit_tactics.py         # T3.1: Equivalence Partitioning & Boundary Value Analysis
├── test_integration_apis.py     # T3.1: API Contracts (Auth, Creator, Brand, Social, Feed)
├── test_system_e2e.py           # T3.1: System Level (Zero fake data, Profile resolution, Search)
├── test_selenium_automation.py  # 3.3: Selenium headless SPA navigation & hydration testing
├── reports/
│   └── junit_report.xml         # JUnit formatted XML test execution results
└── README.md                    # SQA test suite documentation & execution guide
```

---

## 🚀 Quick Start & Execution

### 1. Prerequisites
- Python 3.10+
- Google Chrome (for Selenium tests)
- Running Backend server (`http://localhost:3001`)
- Running Frontend server (`http://localhost:5173`)

### 2. Setup Virtual Environment
```bash
python3 -m venv test_env
source test_env/bin/activate
pip install pytest requests selenium
```

### 3. Run Test Suites

#### Run Unit, Integration & System Tests with JUnit XML Report
```bash
pytest tests/test_unit_tactics.py tests/test_integration_apis.py tests/test_system_e2e.py --junitxml=tests/reports/junit_report.xml -v
```

#### Run Only Unit Testing Tactics (EP & BVA)
```bash
pytest -m unit -v
```

#### Run Only Integration Level Tests
```bash
pytest -m integration -v
```

#### Run Only System E2E Level Tests
```bash
pytest -m system -v
```

#### Run Selenium WebDriver Headless Browser Tests
```bash
pytest tests/test_selenium_automation.py -v
```

#### Run Complete Test Suite
```bash
pytest tests/ -v
```
