from pathlib import Path
import os
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# 🔐 Segurança básica
SECRET_KEY = config("SECRET_KEY", default="insecure-secret")
DEBUG = config("DEBUG", default=False, cast=bool)

# 🌍 Hosts permitidos
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="localhost,127.0.0.1"
).split(",")

# Adiciona hosts automáticos do Render
if os.environ.get("RENDER"):
    if os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
        ALLOWED_HOSTS.append(os.environ.get("RENDER_EXTERNAL_HOSTNAME"))
    if os.environ.get("RENDER_INTERNAL_HOSTNAME"):
        ALLOWED_HOSTS.append(os.environ.get("RENDER_INTERNAL_HOSTNAME"))

# Domínios fixos
ALLOWED_HOSTS.extend([
    ".render.com",
    ".cptec.co.mz",
    "www.cptec.co.mz",
    "cptec.co.mz",
])

# 📦 Apps
INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "submissions",
    "certifications",
]

# ⚙️ Middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# 🔒 Segurança por ambiente
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# Banco de dados SQLite (Render + Local)
if os.environ.get("RENDER"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": "/data/db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# 🔑 Validação de senhas
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "Africa/Maputo"
USE_I18N = True
USE_TZ = True

# 🧱 Arquivos estáticos
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# 🌐 CORS
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:8080,http://127.0.0.1:8080"
).split(",")

if os.environ.get("RENDER") and os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
    host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
    CORS_ALLOWED_ORIGINS.extend([
        f"https://{host}",
        f"http://{host}",
    ])

CORS_ALLOWED_ORIGINS.extend([
    "https://www.cptec.co.mz",
    "https://cptec.co.mz",
    "https://cptec-co-mz.vercel.app",
])

CORS_ALLOW_CREDENTIALS = True

# 🛡️ CSRF
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default=""
).split(",") if config("CSRF_TRUSTED_ORIGINS", default="") else []

if os.environ.get("RENDER") and os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
    host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
    CSRF_TRUSTED_ORIGINS.extend([
        f"https://{host}",
        f"http://{host}",
    ])

CSRF_TRUSTED_ORIGINS.extend([
    "https://www.cptec.co.mz",
    "https://cptec.co.mz",
])

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO" if not DEBUG else "WARNING",
    },
}

# 🎨 Admin
ADMIN_SITE_HEADER = "CPTec Academy Dashboard"
ADMIN_SITE_TITLE = "CPTec Admin"
ADMIN_INDEX_TITLE = "Bem-vindo ao Dashboard"
