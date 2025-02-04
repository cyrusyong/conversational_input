from app import create_app, db
import os

def reset_database():
    app = create_app()

    with app.app_context():
        # Drop all tables
        db.drop_all()
        print("Dropped all tables.")
        
        # Create all tables
        db.create_all()
        print("Created all tables with new schema.")
        
        # Verify the post table schema
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = inspector.get_columns('post')
        print("\nVerifying post table columns:")
        for column in columns:
            print(f"Column: {column['name']}, Type: {column['type']}")
    
    # with app.app_context():
    #     # Delete the existing database file
    #     db_path = 'instance/studyit.db'  # Adjust this path if your database is located elsewhere
    #     if os.path.exists(db_path):
    #         os.remove(db_path)
    #         print("Deleted existing database.")
        
    #     # Create all tables
    #     db.create_all()
    #     print("Created new database with updated schema.")

if __name__ == "__main__":
    reset_database()