import json
import os
from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch as pt
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification


app = FastAPI()

token_key = os.getenv("TOKEN_KEY")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[" http://localhost:5173/"],  # Adjust port in production if needed
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)
class AnalyzeRequest(BaseModel):
     user_text:str

def analyze_emotions(text, token_key):
    model_name = "j-hartmann/emotion-english-distilroberta-base"
    tokenizer = AutoTokenizer.from_pretrained(model_name, token=token_key)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, token=token_key)

    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    probs = pt.softmax(outputs.logits, dim=1)
    labels = model.config.id2label
    scores = {labels[i]: round(float(probs[0][i])*100,1) for i in range(len(labels))}
    dominant = max(scores, key= scores.get)
    return {
        "scores": scores,
        "dominant": dominant
    }


def analyze_writing(text:str):
    import nltk
    import textstat

    words = nltk.word_tokenize(text)
    sentences = nltk.sent_tokenize(text)
    word_count = len(words)
    sentence_count = max(len(sentences), 1)
    
    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_length": round(word_count / sentence_count, 1), # Added for React
        "avg_word_length": round(sum(len(w) for w in words) / max(word_count, 1), 1),
        "readability_score": round(textstat.flesch_reading_ease(text), 1),
        "grade_level": round(textstat.flesch_kincaid_grade(text), 1),
        "vocabulary_richness": round(len(set(words)) / max(word_count, 1), 2)
    }


def analyze_personality(text):
        import ollama
        response = ollama.chat(
            model="llama3.1",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert psycholinguist.
                    Analyze text for Big Five personality traits.
                    Return ONLY valid JSON with no markdown formatting or extra text.
                    Format:
                    {
                        "openness": <int 0-100>,
                        "conscientiousness": <int 0-100>,
                        "extraversion": <int 0-100>,
                        "agreeableness": <int 0-100>,
                        "neuroticism": <int 0-100>,
                        "communication_style": "<Direct|Analytical|Expressive|Casual>",
                        "tone": "<Semi-formal|Formal|Informal|Assertive>",
                        "insights": ["...", "...", "..."]
                    }"""
                },

                {
                    "role": "user",
                    "content": f"Analyze this text: {text}"
                }
            ]
        )
        content = response["message"]["content"].strip()
    
    # Sanitize markdown tags if Llama outputs ```json ... ```
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            
        return json.loads(content.strip())


@app.post("/analyze")
async def analyze_text(request:AnalyzeRequest):
    try:
        emotions = analyze_emotions(request.user_text, token_key)
        writing_stats = analyze_writing(request.user_text)
        personality = analyze_personality(request.user_text)

        return {
            "emotions": emotions,
            "writing_stats": writing_stats,
            "personality": personality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))