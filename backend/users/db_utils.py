"""
Database utility functions for handling foreign key constraints
"""
from django.db import connection

def enable_foreign_keys():
    """Enable foreign key constraints in SQLite"""
    if 'sqlite' in connection.vendor:
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA foreign_keys = ON")

