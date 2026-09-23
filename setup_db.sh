#!/usr/bin/env bash
set -e

echo "Updating apt and installing postgresql..."
apt-get update -y
apt-get install -y postgresql postgresql-contrib

echo "Starting postgresql service..."
service postgresql start

echo "Configuring postgres user and database..."
sudo -u postgres psql -c "DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sih') THEN
      CREATE ROLE sih WITH LOGIN SUPERUSER PASSWORD 'sih_password';
   ELSE
      ALTER ROLE sih WITH PASSWORD 'sih_password';
   END IF;
END
\$\$;"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'sih26100'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE sih26100 OWNER sih;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sih26100 TO sih;"

echo "Configuring listen addresses and pg_hba..."
PG_CONF=$(find /etc/postgresql/ -name postgresql.conf)
PG_HBA=$(find /etc/postgresql/ -name pg_hba.conf)

sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"
sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"

if ! grep -q "host all all 0.0.0.0/0 md5" "$PG_HBA"; then
    echo "host all all 0.0.0.0/0 md5" >> "$PG_HBA"
    echo "host all all ::/0 md5" >> "$PG_HBA"
fi

service postgresql restart
echo "PostgreSQL setup completed successfully!"
