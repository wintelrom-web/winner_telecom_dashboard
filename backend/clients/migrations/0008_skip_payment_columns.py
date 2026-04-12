# Skip Payment table columns - they already exist on Render

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0007_sync_payment_table'),
    ]

    operations = [
        # No operations - table already has the columns on Render
        # This migration just marks the state as up-to-date
    ]
