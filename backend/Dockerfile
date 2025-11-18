# backend/Dockerfile
FROM python:3.11 AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev cron \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY backend /app

COPY backend/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh /app/cron-entrypoint.sh

RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app /entrypoint.sh /app/cron-entrypoint.sh
USER appuser

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "SJTUcontest.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "17"]
