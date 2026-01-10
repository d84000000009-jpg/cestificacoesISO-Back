#!/usr/bin/env bash
# exit on error
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
mkdir -p /opt/render/project/src
python manage.py migrate
python manage.py collectstatic --no-input