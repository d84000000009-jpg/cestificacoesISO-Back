import os
import sys
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# 🔥 AUTO MIGRATE (FUNCIONA NO FREE)
if os.environ.get("RENDER"):
    try:
        from django.core.management import call_command
        call_command("migrate", interactive=False)
    except Exception as e:
        print("Erro ao rodar migrate automaticamente:", e)

application = get_wsgi_application()
