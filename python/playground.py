"""
SQLite Playground - Test if data persists between runs
Usage: 
    python sqlite_playground.py write  # Adds a new record
    python sqlite_playground.py read   # Reads all records
"""

import sys
import os
from pathlib import Path
import sqlite3
from datetime import datetime

def get_db_path():
    """Get the database path in a platform-independent way"""
    # For Electron, you'd use the same logic as in your Config class
    # For this playground, we'll use a simple location
    app_dir = Path.home() / ".clip-processor-test"
    os.makedirs(app_dir, exist_ok=True)
    return app_dir / "test.db"

def init_db():
    """Initialize the database if it doesn't exist"""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Create table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS test_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized at: {db_path}")

def write_data():
    """Write a new entry to the database"""
    init_db()
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Current timestamp
    now = datetime.now().isoformat()
    message = f"Test entry created at {now}"
    
    # Insert a new row
    cursor.execute(
        "INSERT INTO test_entries (message, timestamp) VALUES (?, ?)",
        (message, now)
    )
    
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    
    print(f"Added new entry with ID: {last_id}")
    print(f"Message: {message}")
    print(f"Database location: {db_path}")

def read_data():
    """Read all entries from the database"""
    db_path = get_db_path()
    
    if not db_path.exists():
        print(f"Database does not exist at: {db_path}")
        return
        
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Try to read from the table
    try:
        cursor.execute("SELECT id, message, timestamp FROM test_entries ORDER BY id")
        rows = cursor.fetchall()
        
        if not rows:
            print("No entries found in the database.")
        else:
            print(f"Found {len(rows)} entries in database at {db_path}:")
            print("-" * 80)
            for row in rows:
                print(f"ID: {row[0]}")
                print(f"Message: {row[1]}")
                print(f"Timestamp: {row[2]}")
                print("-" * 80)
    except sqlite3.OperationalError as e:
        if "no such table" in str(e):
            print("Database exists but table 'test_entries' doesn't exist yet.")
        else:
            print(f"Error reading from database: {e}")
    
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please specify 'write' or 'read' as command line argument")
        sys.exit(1)
        
    command = sys.argv[1].lower()
    
    if command == "write":
        write_data()
    elif command == "read":
        read_data()
    else:
        print(f"Unknown command: {command}")
        print("Please use 'write' or 'read'")