#!/bin/sh
set -e

CRON_FILE="/app/cron/blacklist.cron"

if [ ! -f "$CRON_FILE" ]; then
  echo "[cron-entrypoint] 未找到 $CRON_FILE" >&2
  exit 1
fi

crontab "$CRON_FILE"
crontab -l

exec cron -f
