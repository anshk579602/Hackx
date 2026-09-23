import sqlite3

conn = sqlite3.connect("hackjudge.db")
c = conn.cursor()
tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()]

c.execute("PRAGMA foreign_keys = OFF;")
for t in tables:
    c.execute(f'DELETE FROM "{t}";')
c.execute("PRAGMA foreign_keys = ON;")
conn.commit()

counts = {t: c.execute(f'SELECT count(*) FROM "{t}"').fetchone()[0] for t in tables}
print("Clean slate database verified:", counts)
conn.close()
