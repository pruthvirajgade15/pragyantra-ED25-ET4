import os
from sqlalchemy import text
from database.db import engine

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE student_profiles ADD COLUMN dob VARCHAR(20)"))
            if hasattr(conn, 'commit'):
                conn.commit()
            print("Successfully added 'dob' column to the database!")
        except Exception as e:
            print("Column might already exist or error occurred:", e)

if __name__ == "__main__":
    migrate()