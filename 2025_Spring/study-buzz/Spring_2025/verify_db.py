from app import create_app
import sqlite3

def verify_database():
    app = create_app()
    
    with app.app_context():
        # Get SQLite database path from app config
        db_path = 'instance/studybuzz.db'  
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get table info
        cursor.execute("PRAGMA table_info(post);")
        columns = cursor.fetchall()
        
        print("\nPost table columns:")
        for col in columns:
            print(f"Column: {col[1]}, Type: {col[2]}, Nullable: {col[3]}")
        
        conn.close()

if __name__ == "__main__":
    verify_database()