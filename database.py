import sqlite3, json, os

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skillmatch.db")


def init_db():
    con = sqlite3.connect(DB)
    con.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT,
            role TEXT,
            skills TEXT,
            percentage REAL,
            missing TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")
    con.commit()
    con.close()


def save_analysis(name, role, skills, result):
    con = sqlite3.connect(DB)
    con.execute(
        "INSERT INTO analysis_history (user_name, role, skills, percentage, missing) "
        "VALUES (?, ?, ?, ?, ?)",
        (name, role, skills, result["percentage"],
         json.dumps([m["skill"] for m in result["missing"]])))
    con.commit()
    con.close()


def get_history(name):
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        "SELECT * FROM analysis_history WHERE user_name = ? "
        "ORDER BY created_at DESC, id DESC",
        (name,)).fetchall()
    con.close()
    return rows
