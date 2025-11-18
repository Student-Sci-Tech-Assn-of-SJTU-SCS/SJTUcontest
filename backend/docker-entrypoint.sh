#!/bin/sh
set -e

LOG_DIR="/app/logs"
LOG_FILE="$LOG_DIR/content_detection_risks.log"
mkdir -p "$LOG_DIR"
if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
fi

python manage.py migrate --noinput

exec "$@"
