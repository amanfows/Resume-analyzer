import json
import os
from difflib import get_close_matches

BASE = os.path.dirname(os.path.abspath(__file__))


def load_json(name):
    with open(os.path.join(BASE, "data", name), encoding="utf-8") as f:
        return json.load(f)


ROLES = load_json("roles.json")
SYNONYMS = load_json("synonyms.json")

def all_skills():
    skills = set()
    for role_skills in ROLES.values():
        skills.update(role_skills.keys())
    return sorted(skills)

def normalize(text):
    result = set()
    for raw in text.split(","):
        s = raw.strip().lower()
        if s:
            result.add(SYNONYMS.get(s, s))
    return result

def fix_typos(user_skills):
    known = {k.lower() for k in all_skills()}
    fixed = set()
    for s in user_skills:
        if s in known:
            fixed.add(s)
        else:
            close = get_close_matches(s, known, n=1, cutoff=0.8)
            fixed.add(close[0] if close else s)
    return fixed

def get_level(p):
    if p >= 80:
        return "Job Ready"
    if p >= 50:
        return "Intermediate"
    return "Beginner"

def analyze(user_text, role):
    required = ROLES[role]
    user_skills = fix_typos(normalize(user_text))
    matched, missing = [], []
    for skill, topics in required.items():
        if skill.lower() in user_skills:
            matched.append(skill)
        else:
            missing.append({"skill": skill, "topics": topics})
    pct = round(len(matched) / len(required) * 100, 1)
    return {
        "role": role,
        "percentage": pct,
        "level": get_level(pct),
        "matched": matched,
        "missing": missing,
    }

def rank_roles(user_text):
    results = [analyze(user_text, r) for r in ROLES]
    return sorted(results, key=lambda r: r["percentage"], reverse=True)