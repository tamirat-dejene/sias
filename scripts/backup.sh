#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
DB_NAME="sias"
DB_USER="postgres"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup for $DB_NAME..."
# Using docker exec since we are running in docker
docker exec sias-db-1 pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_DIR/backup_$DATE.sql"
else
  echo "Backup failed!"
  exit 1
fi

# Export Students to CSV (Example)
echo "Exporting students to CSV..."
docker exec sias-db-1 psql -U $DB_USER -d $DB_NAME -c "COPY (SELECT * FROM student) TO STDOUT WITH CSV HEADER" > "$BACKUP_DIR/students_$DATE.csv"

echo "Done."
