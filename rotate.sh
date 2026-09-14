set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

NEW_PASSWORD="app-$(openssl rand -hex 8)"

echo "1. ALTER ROLE in Postgres…"
docker compose exec -T db psql -U admin -d shop \
  -c "ALTER ROLE app_user WITH PASSWORD '${NEW_PASSWORD}';" >/dev/null

echo "2. Update file secrete..."
printf '%s' "${NEW_PASSWORD}" > secrets/db_password

echo "3. Close old connectiosn of app_user…"
docker compose exec -T db psql -U admin -d shop -tA \
  -c "SELECT count(pg_terminate_backend(pid)) FROM pg_stat_activity WHERE usename = 'app_user';"

echo "Done: new password ${NEW_PASSWORD:0:6}… in DB and secrete file"
