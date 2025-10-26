from flask import request, jsonify
import json
import requests
import re

def register_quiz_routes(app):
    from flask_cors import CORS
    CORS(app)

    @app.route("/generate_quiz", methods=["POST"])
    def generate_quiz():
        """
        Receives selected text and number of MCQs.
        Calls LLM and returns validated questions[] JSON.
        """
        try:
            data = request.get_json()
            text = data.get("text", "").strip()
            count = int(data.get("count", 5))
            q_type = data.get("type", "MCQ")

            if not text:
                return jsonify({"questions": [], "error": "No text provided"}), 400

            # Build prompt for LLM
            prompt = f"""
You are a quiz generator. Generate exactly {count} MCQs from the text below.
Return ONLY JSON in this format:

{{
  "questions": [
    {{
      "question_text": "Question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B"
    }}
  ]
}}

Text:
{text}
"""

            llm_raw = call_llm_for_quiz(prompt)

            # Extract JSON safely
            json_match = re.search(r"\{.*\}", llm_raw, re.DOTALL)
            if json_match:
                json_text = json_match.group()
                try:
                    questions_data = json.loads(json_text)
                    questions = questions_data.get("questions", [])
                except json.JSONDecodeError:
                    questions = []
            else:
                questions = []

            # Ensure correct structure
            validated_questions = []
            for q in questions:
                if "question_text" in q and "options" in q and "correct_answer" in q:
                    # Ensure options are array of strings
                    options = [str(opt) for opt in q["options"]][:4]
                    validated_questions.append({
                        "question_text": str(q["question_text"]),
                        "options": options,
                        "correct_answer": str(q["correct_answer"])
                    })

            return jsonify({"questions": validated_questions})

        except Exception as e:
            print("Error generating quiz:", e)
            return jsonify({"questions": [], "error": str(e)}), 500

# -------------------------
# LLM call wrapper
# -------------------------
def call_llm_for_quiz(prompt):
    """
    Calls your local LLM endpoint (/ask) to generate quiz questions.
    Returns raw string response (expected JSON).
    """
    try:
        response = requests.post(
            "http://127.0.0.1:5000/ask",  # your existing LLM endpoint
            headers={"Content-Type": "application/json"},
            json={"prompt": prompt, "context": None},
            timeout=30  # optional, avoids hanging
        )

        if response.status_code != 200:
            print("LLM endpoint returned error:", response.status_code)
            return ""

        data = response.json()
        # Your /ask endpoint returns {"response": "...text..."}
        return data.get("response", "")

    except requests.exceptions.RequestException as e:
        print("Error calling LLM:", e)
        return ""

