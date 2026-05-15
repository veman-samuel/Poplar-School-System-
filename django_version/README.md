# Poplar School Management System — Django Backend Architecture

This folder contains a comprehensive, enterprise-ready Django backend design for **Poplar School**. It maps perfectly to all features specified by management for Nursery, Primary, and Secondary sections, featuring role-based access control, fee transactions via Mobile Money or Smart Cards, automatic grading, and personalized AI learning configurations.

---

## 🛠 Features Implemented in Django

1. **Role-Based Handshakes (`AbstractUser`)**
   - Supports 5 active roles: `Super Admin`, `Section Manager`, `Teacher`, `Parent`, and `Student`.
2. **Division Sectioning**
   - Nursery, Primary, and Secondary sections. Section Managers enforce permission gates matching their section.
3. **Automated Ledger Tracker**
   - Track `fees_due` vs `fees_paid`, trace unique receipts, and log transactions from MTN Mobile Money, Airtel, M-Pesa, or Poplar Smart Badges.
4. **Interactive Exam grading**
   - Create tests, questions, and receive submissions from students displaying instant MCQs scoring.
5. **Scheme of Work Periodization**
   - Supports 4-month academic term pacing with flexible JSON structures.
6. **Attendance Analytics**
   - Collect and average attendance logs for both pupils and active faculty.

---

## 🚀 Quick Setup & Installation Guide

### 1. Prerequisites
Ensure you have Python 3.9+ installed. It is highly recommended to use a virtual environment:

```bash
# Create dynamic python virtual sandbox
python -m venv venv

# On Mac/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

### 2. Install Project Dependencies
Create a `requirements.txt` file inside this folder with the core components:

```txt
django>=4.2
djangorestframework>=3.14
django-cors-headers>=4.0
django-filter>=23.0
djangorestframework-simplejwt>=5.2
```

Then install them:
```bash
pip install -r requirements.txt
```

### 3. Initialize Settings Configuration (`settings.py`)
Ensure your main Django project `settings.py` includes the routing apps:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # REST Framework and CORS headers
    'rest_framework',
    'corsheaders',
    
    # Poplar Application app
    'poplar_core',
]

AUTH_USER_MODEL = 'poplar_core.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Put at top
    'django.middleware.security.SecurityMiddleware',
    # ...
]

# Ensure React Vite frontend (running on port 3000 by default) is allowlisted
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### 4. Build database migrations & sync SQL schemas
```bash
python manage.py makemigrations poplar_core
python manage.py migrate
```

### 5. Create a Superuser / School Director profile
```bash
python manage.py createsuperuser
```

### 6. Spin up active developer server
```bash
python manage.py runserver
```
The Poplar rest-framework API roots will be live at `http://localhost:8000/api/v1/`!

---

## 🧪 Sample API Endpoints Covered

| Route Method | Path | Intended Consumer | Action Parameters / Description |
|---|---|---|---|
| **POST** | `/api/v1/users/create-teacher/` | Section Head, Admins | Onboard a class teacher associated on a targeted level |
| **POST** | `/api/v1/transactions/` | Parent portal | Clear tuition ledger using mobile money numeric lines / smart pin |
| **POST** | `/api/v1/students/<id>/approve-enrollment/` | Section Manager | Approve a pupil's credentials from pending registry |
| **POST** | `/api/v1/students/<id>/update-learning-path/` | Teachers / Tutors | Update student strengths and custom learning vectors |
| **GET** | `/api/v1/attendance/summarize-attendance/` | Section Managers, Admin | Displays physical section present ratios for the semester |

---

## 🎨 Unified Client Bridge (Connecting React Frontend)

To transition your gorgeous React SPA to communicate with this Django Rest backend engine:
1. Open `src/config.ts` (or your fetching modules)
2. Replace local state setters with standard asynchronous HTTP requests targeting fetch calls to `http://localhost:8000/api/v1/`
3. Include standard token Authorization headers in browser requests for authenticated roles!
