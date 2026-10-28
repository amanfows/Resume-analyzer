from flask import Flask, jsonify, request
from matcher import analyze, ROLES

app = Flask(__name__)


@app.route("/")
def index():
    return "SkillMatch backend is running!"


@app.route("/test")
def test():
    skills = request.args.get("skills", "")
    role = request.args.get("role", "")
    if not skills or role not in ROLES:
        return jsonify({"error": "Give skills and a valid role"}), 400
    return jsonify(analyze(skills, role))


if __name__ == "__main__":
    app.run(debug=True)