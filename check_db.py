# check_db.py
import sqlite3
from SRC.utils.settings import settings

print(f"Database file: {settings.DATABASE_URL}")

# Connect directly to SQLite
conn = sqlite3.connect('tasks.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("\nTables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Check user_tasks table structure
cursor.execute("PRAGMA table_info(user_tasks);")
columns = cursor.fetchall()

if columns:
    print("\nColumns in user_tasks table:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
else:
    print("\nuser_tasks table not found!")

conn.close()