#!/bin/bash

echo "🚀 بدء نقل قاعدة البيانات..."
echo ""

# Old Database
OLD_HOST="altaria.proxy.rlwy.net"
OLD_PORT="15519"
OLD_USER="postgres"
OLD_PASS="MnFZUReMfbaaAqRzMLyLbrdnxDTabUux"
OLD_DB="railway"

# New Database
NEW_HOST="tokaido.proxy.rlwy.net"
NEW_PORT="16497"
NEW_USER="postgres"
NEW_PASS="tEXcJnWTJlFrfPVouOHlBWRPMrPOfSxh"
NEW_DB="railway"

# Backup file
BACKUP_FILE="database_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 جاري تصدير البيانات من القاعدة القديمة..."
PGPASSWORD="$OLD_PASS" pg_dump -h "$OLD_HOST" -p "$OLD_PORT" -U "$OLD_USER" -d "$OLD_DB" \
  --no-owner --no-acl --clean --if-exists > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ تم التصدير بنجاح!"
    echo ""
    echo "📥 جاري استيراد البيانات للقاعدة الجديدة..."
    PGPASSWORD="$NEW_PASS" psql -h "$NEW_HOST" -p "$NEW_PORT" -U "$NEW_USER" -d "$NEW_DB" < "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ تم الاستيراد بنجاح!"
        echo ""
        echo "🎉 تم نقل قاعدة البيانات بنجاح!"
        echo "📁 ملف النسخة الاحتياطية: $BACKUP_FILE"
    else
        echo "❌ فشل الاستيراد!"
        exit 1
    fi
else
    echo "❌ فشل التصدير!"
    exit 1
fi
