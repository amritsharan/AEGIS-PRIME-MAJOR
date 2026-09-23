import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "cypher_shield.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS secure_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            digital_signature TEXT NOT NULL,
            cipher_text_path TEXT NOT NULL,
            encryption_type TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def save_file_metadata(filename: str, digital_signature: str, cipher_text_path: str, encryption_type: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO secure_files (filename, digital_signature, cipher_text_path, encryption_type)
        VALUES (?, ?, ?, ?)
    ''', (filename, digital_signature, cipher_text_path, encryption_type))
    file_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return file_id

def get_file_metadata(file_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM secure_files WHERE id = ?', (file_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_files():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM secure_files')
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

