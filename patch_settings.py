import os
with open('backend/risksetu/settings.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. ALLOWED_HOSTS
code = code.replace('ALLOWED_HOSTS = []', 'ALLOWED_HOSTS = [\'*\']')
code = code.replace('ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="").split(",")', 'ALLOWED_HOSTS = ["*"]')

# 2. CORS
code = code.replace('CORS_ALLOWED_ORIGINS = [', 'CORS_ALLOW_ALL_ORIGINS = True\n# CORS_ALLOWED_ORIGINS = [')

# 3. DATABASES
db_old = '''DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": config("DB_NAME", default="risksetu_db"),
        "USER": config("DB_USER", default="risksetu_user"),
        "PASSWORD": config("DB_PASSWORD", default="devpassword"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}'''
db_new = '''import dj_database_url
DATABASES = {
    "default": dj_database_url.config(
        default=f"postgis://{config('DB_USER', default='risksetu_user')}:{config('DB_PASSWORD', default='devpassword')}@{config('DB_HOST', default='localhost')}:{config('DB_PORT', default='5432')}/{config('DB_NAME', default='risksetu_db')}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}
DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'
'''
code = code.replace(db_old, db_new)

# 4. WhiteNoise & Static
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in code:
    code = code.replace('"django.middleware.security.SecurityMiddleware",', '"django.middleware.security.SecurityMiddleware",\n    "whitenoise.middleware.WhiteNoiseMiddleware",')

if 'STATIC_ROOT' not in code:
    code += '\nSTATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")\nSTATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"\n'

with open('backend/risksetu/settings.py', 'w', encoding='utf-8') as f:
    f.write(code)
print('Settings patched for production!')
