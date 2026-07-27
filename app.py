import os
import sqlite3
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect("campus_safety.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            priority TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Open'
        )
    """
    )
    conn.commit()
    conn.close()


init_db()


def get_db_connection():
    conn = sqlite3.connect("campus_safety.db")
    conn.row_factory = sqlite3.Row
    return conn


# --- ROUTES ---


@app.route("/")
def index():
    return render_template("index.html")


# API: Fetch all incidents
@app.route("/api/incidents", methods=["GET"])
def get_incidents():
    conn = get_db_connection()
    incidents = conn.execute(
        "SELECT * FROM incidents ORDER BY id DESC"
    ).fetchall()
    conn.close()

    incident_list = [dict(row) for row in incidents]

    # Calculate category counts for the chart
    cat_counts = {}
    for item in incident_list:
        cat = item["category"]
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    return jsonify({"incidents": incident_list, "catData": cat_counts})


# API: Add a new incident
@app.route("/api/incidents", methods=["POST"])
def add_incident():
    data = request.get_json()
    title = data.get("title")
    category = data.get("category")
    description = data.get("description")
    priority = data.get("priority", "Medium")

    if not title or not category:
        return jsonify({"error": "Title and category are required"}), 400

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO incidents (title, category, description, priority) VALUES (?, ?, ?, ?)",
        (title, category, description, priority),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Incident added successfully"}), 201


# API: Update incident status
@app.route("/api/incidents/update", methods=["POST"])
def update_status():
    data = request.get_json()
    incident_id = data.get("id")
    new_status = data.get("status")

    conn = get_db_connection()
    conn.execute(
        "UPDATE incidents SET status = ? WHERE id = ?",
        (new_status, incident_id),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Status updated successfully"})

    import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
