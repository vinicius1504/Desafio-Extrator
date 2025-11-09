# Generated manually - Remove all fixed fields, keep only dynamic fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('extractor', '0005_columnmapping_dynamic_fields_productvariant_fields'),
    ]

    operations = [
        # Remove MappingTemplate model completely
        migrations.DeleteModel(
            name='MappingTemplate',
        ),

        # Remove fixed fields from ColumnMapping
        migrations.RemoveField(
            model_name='columnmapping',
            name='template',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='code_column',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='description_column',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='dimensions_column',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='cubic_column',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='weight_column',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='ncm_column',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='price_columns',
        ),
        migrations.RemoveField(
            model_name='columnmapping',
            name='column_headers',
        ),

        # Remove fixed fields from ProductVariant
        migrations.RemoveField(
            model_name='productvariant',
            name='code',
        ),
        migrations.RemoveField(
            model_name='productvariant',
            name='dimensions',
        ),
        migrations.RemoveField(
            model_name='productvariant',
            name='cubic',
        ),
        migrations.RemoveField(
            model_name='productvariant',
            name='weight',
        ),
        migrations.RemoveField(
            model_name='productvariant',
            name='ncm',
        ),
        migrations.RemoveField(
            model_name='productvariant',
            name='prices',
        ),
    ]
