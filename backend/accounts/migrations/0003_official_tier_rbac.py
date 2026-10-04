# Generated for Multi-Tier NDMA/SDMA RBAC

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_approval_status_user_designation_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='official_id',
            field=models.CharField(blank=True, help_text='e.g. UK-SDMA-2026-9041', max_length=64, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='user',
            name='tier',
            field=models.CharField(
                choices=[
                    ('NATIONAL_NDMA', 'Tier 1 - NDMA Apex / National'),
                    ('STATE_SDMA', 'Tier 2 - State Officer (SDMA SEOC)'),
                    ('DISTRICT_DEOC', 'Tier 3 - District Magistrate / DEOC'),
                    ('FIELD_RESPONDER', 'Tier 4 - SDRF / Field Officer'),
                ],
                default='FIELD_RESPONDER',
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='cadre_designation',
            field=models.CharField(blank=True, help_text='e.g. Additional District Magistrate (E)', max_length=128),
        ),
        migrations.AddField(
            model_name='user',
            name='assigned_district',
            field=models.CharField(blank=True, help_text='e.g. Chamoli, Rudraprayag', max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_2fa_enrolled',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_approved_by_nodal',
            field=models.BooleanField(default=False),
        ),
    ]
