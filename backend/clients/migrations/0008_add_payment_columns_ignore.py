# Generated manually to add missing columns to existing Payment table with ignore

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0007_sync_payment_table'),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE clients_payment ADD COLUMN username VARCHAR(200);",
            reverse_sql=migrations.RunSQL.noop
        ),
        migrations.RunSQL(
            "ALTER TABLE clients_payment ADD COLUMN amount DECIMAL(10, 2);",
            reverse_sql=migrations.RunSQL.noop
        ),
        migrations.RunSQL(
            "ALTER TABLE clients_payment ADD COLUMN type VARCHAR(20);",
            reverse_sql=migrations.RunSQL.noop
        ),
        migrations.RunSQL(
            "ALTER TABLE clients_payment ADD COLUMN payment_date TIMESTAMP;",
            reverse_sql=migrations.RunSQL.noop
        ),
        migrations.RunSQL(
            "ALTER TABLE clients_payment ADD COLUMN day INTEGER;",
            reverse_sql=migrations.RunSQL.noop
        ),
        migrations.RunSQL(
            "ALTER TABLE clients_payment ADD COLUMN client_id INTEGER REFERENCES clients_client(id);",
            reverse_sql=migrations.RunSQL.noop
        ),
    ]
