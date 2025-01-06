import mysql.connector
from mysql.connector import errorcode

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'genai_tests'
}

def create_database():
    try:
        conn = mysql.connector.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password']
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        print(f"Database {db_config['database']} created successfully.")
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    finally:
        cursor.close()
        conn.close()

def create_tables():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Create tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS divisions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS venues (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tester_name VARCHAR(255) NOT NULL,
                division_id INT,
                venue_id INT,
                session_datetime DATETIME,
                FOREIGN KEY (division_id) REFERENCES divisions(id),
                FOREIGN KEY (venue_id) REFERENCES venues(id)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id INT,
                question TEXT,
                chatbot_answer TEXT,
                accuracy_score INT,
                relevancy_score INT,
                performance_score INT,
                additional_comments TEXT,
                FOREIGN KEY (session_id) REFERENCES feedback_sessions(id)
            )
        """)
        print("Tables created successfully.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_database()
    create_tables() 