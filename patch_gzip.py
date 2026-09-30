with open('backend/risksetu/settings.py', 'r', encoding='utf-8') as f:
    code = f.read()

old = 'MIDDLEWARE = [\n    "corsheaders.middleware.CorsMiddleware",'
new = 'MIDDLEWARE = [\n    "django.middleware.gzip.GZipMiddleware",\n    "corsheaders.middleware.CorsMiddleware",'
code = code.replace(old, new)

with open('backend/risksetu/settings.py', 'w', encoding='utf-8') as f:
    f.write(code)
print("Gzip Added")
