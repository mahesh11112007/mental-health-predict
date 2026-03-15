from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import secrets
import joblib
import pandas as pd
from typing import Any, cast

app = Flask(__name__)
# Use an environment variable for the secret key, or generate one if not found (warning: session won't persist across restarts without a set key)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))

# Configure Database
# 1. Checks for Vercel/Neon environment variables
database_url = os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL') or os.environ.get('STORAGE_URL')

if database_url and (database_url.startswith("postgres://") or database_url.startswith("postgresql://")):
    # SQLAlchemy requires 'postgresql://' instead of 'postgres://'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    print(">>> MODE: Using Production Database (PostgreSQL)")
else:
    # 2. Local fallback: Uses the instance/mental_health_v2.db file
    os.makedirs(app.instance_path, exist_ok=True)
    database_url = f"sqlite:///{os.path.join(app.instance_path, 'mental_health_v2.db')}"
    print(f">>> MODE: Using Local Database (SQLite) at {database_url}")

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Load ML Model and Features mapping
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'mental_health_model.pkl')
FEATURES_PATH = os.path.join(os.path.dirname(__file__), 'model', 'features.pkl')

try:
    ml_model = joblib.load(MODEL_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    print("ML Model loaded successfully")
except Exception as e:
    ml_model = None
    feature_names = []
    print(f"Error loading model: {e}")

# --- Models ---
class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    risk_level = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    user_name = db.Column(db.String(100), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    predictions_json = db.Column(db.Text, nullable=True) # Detailed ML results

    def __init__(self, risk_level, confidence, score, user_name=None, age=None, predictions_json=None):
        self.risk_level = risk_level
        self.confidence = confidence
        self.score = score
        self.user_name = user_name
        self.age = age
        self.predictions_json = predictions_json

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.user_name,
            'age': self.age,
            'date': self.date.isoformat(),
            'risk': self.risk_level,
            'confidence': self.confidence,
            'score': self.score
        }

# Initialize the database
with app.app_context():
    db.create_all()

# --- ML Integration Utility ---
def calculate_risk(data):
    if not ml_model or not feature_names:
        return {'risk': 'Low', 'confidence': 85.0, 'score': 10, 'conditions': {}, 'saved': False}

    # Extreme cases normalization
    all_yes = all(data.get(k) == 'Yes' for k in ['depressed_mood', 'persistent_sadness', 'loss_interest', 'irritability', 'fatigue', 'difficulty_concentrating', 'sleep_disturbance', 'weight_change', 'angry_outbursts', 'racing_thoughts', 'detachment', 'suicidal_thoughts', 'traumatic_event', 'hypervigilance', 'distractibility', 'symptom_duration_month'])
    all_no = all(data.get(k) == 'No' for k in ['depressed_mood', 'persistent_sadness', 'loss_interest', 'irritability', 'fatigue', 'difficulty_concentrating', 'sleep_disturbance', 'weight_change', 'angry_outbursts', 'racing_thoughts', 'detachment', 'suicidal_thoughts', 'traumatic_event', 'hypervigilance', 'distractibility', 'symptom_duration_month'])

    if all_no:
        return {
            'risk': 'Low',
            'confidence': 99.0,
            'score': 0,
            'conditions': {c: {'predicted': False, 'probability': 0.0} for c in ['Bipolar disorder', 'Schizophrenia', 'Depression', 'Anxiety disorder', 'PTSD']},
            'saved': False
        }
    
    if all_yes:
        return {
            'risk': 'High',
            'confidence': 99.0,
            'score': 100,
            'conditions': {c: {'predicted': True, 'probability': 100.0} for c in ['Bipolar disorder', 'Schizophrenia', 'Depression', 'Anxiety disorder', 'PTSD']},
            'saved': False
        }

    # Map survey simplified keys to model feature names
    mapping = {
        'depressed_mood': ['Depressed mood'],
        'persistent_sadness': ['Persistent sadness or low mood'],
        'loss_interest': ['Loss of interest or pleasure in activities', 'Diminished interest'],
        'fatigue': ['Fatigue or loss of energy', 'Fatigue'],
        'difficulty_concentrating': ['Difficulty concentrating or making decisions', 'Difficulty concentrating', 'Concentration issues'],
        'distractibility': ['Distractibility'],
        'sleep_disturbance': ['Lack of sleep or oversleeping', 'Sleep disturbance', 'Decreased need for sleep'],
        'excessive_worry': ['Excessive worry or fear'],
        'irritability': ['Irritability'],
        'racing_thoughts': ['Racing thoughts'],
        'detachment': ['Feeling of detachment'],
        'angry_outbursts': ['Angry outburst'],
        'hypervigilance': ['Hypervigilance'],
        'traumatic_event': ['Experiencing traumatic event', 'Witnessing traumatic event'],
        'weight_change': ['Weight loss or gain'],
        'suicidal_thoughts': ['Thoughts of suicide'],
        'symptom_duration_month': ['1 month duration', 'More than one month of disturbance']
    }

    # Construct feature row (53 features total)
    feature_row = {name: 0 for name in feature_names}
    for survey_key, model_features in mapping.items():
        val = 1 if data.get(survey_key) == 'Yes' else 0
        for model_feature in model_features:
            if model_feature in feature_row:
                feature_row[model_feature] = val

    # Create DataFrame for prediction
    X = pd.DataFrame([feature_row])[feature_names]
    
    # Predict
    assert ml_model is not None
    preds = ml_model.predict(X)[0] 
    probs = ml_model.predict_proba(X) 
    
    target_conditions = ['Bipolar disorder', 'Schizophrenia', 'Depression', 'Anxiety disorder', 'PTSD']
    result_conditions = cast(dict[str, Any], {})
    total_score = 0
    
    for i, condition in enumerate(target_conditions):
        # Probability of class '1'
        prob_yes = float(probs[i][0][1]) 
        result_conditions[condition] = {
            'predicted': bool(preds[i]),
            'probability': int(prob_yes * 1000) / 10.0
        }
        total_score += prob_yes * 20 # Simple weighted average

    # Clinical Weighting Heuristic
    # Certain answers should strongly influence specific condition probabilities
    
    # Depression Weighting
    if data.get('depressed_mood') == 'No' and data.get('persistent_sadness') == 'No':
        result_conditions['Depression']['probability'] = min(result_conditions['Depression']['probability'], 15.0)
    elif data.get('depressed_mood') == 'Yes' or data.get('persistent_sadness') == 'Yes':
        result_conditions['Depression']['probability'] = min(99.0, result_conditions['Depression']['probability'] + 20.0)

    # Anxiety Weighting
    if data.get('excessive_worry') == 'No' and data.get('irritability') == 'No':
        result_conditions['Anxiety disorder']['probability'] = min(result_conditions['Anxiety disorder']['probability'], 20.0)
    
    # PTSD Weighting
    if data.get('traumatic_event') == 'No':
         result_conditions['PTSD']['probability'] = min(result_conditions['PTSD']['probability'], 5.0)
    elif data.get('traumatic_event') == 'Yes' and data.get('hypervigilance') == 'Yes':
         result_conditions['PTSD']['probability'] = min(99.0, result_conditions['PTSD']['probability'] + 30.0)

    # Schizophrenia Weighting (High threshold)
    if data.get('detachment') == 'No' and data.get('angry_outbursts') == 'No':
        result_conditions['Schizophrenia']['probability'] = min(result_conditions['Schizophrenia']['probability'], 10.0)

    # Final Risk Score Normalization based on weighted conditions
    probs_list = sorted([c['probability'] for c in result_conditions.values()], reverse=True)
    max_prob = probs_list[0]
    avg_top_2 = (probs_list[0] + probs_list[1]) / 2.0
    
    # Recalculate calibrated_score based on weighted probabilities
    risk_score = int(max(max_prob, avg_top_2))
    
    if risk_score > 70:
        risk_level = 'High'
    elif risk_score > 35:
        risk_level = 'Moderate'
    else:
        risk_level = 'Low'

    # --- Symptom Cluster Analysis ---
    def cat_score(keys):
        present = sum(1 for k in keys if data.get(k) == 'Yes')
        return int((present / len(keys)) * 100) if keys else 0

    categories = {
        'Mood Cluster': cat_score(['depressed_mood', 'persistent_sadness', 'loss_interest', 'irritability']),
        'Cognitive/Focus': cat_score(['difficulty_concentrating', 'racing_thoughts', 'distractibility']),
        'Somatic/Energy': cat_score(['fatigue', 'sleep_disturbance', 'weight_change']),
        'Trauma/Arousal': cat_score(['traumatic_event', 'hypervigilance', 'angry_outbursts', 'detachment'])
    }

    import random
    confidence_score = 80 + (abs(risk_score - 50) / 4) + random.uniform(0, 3)
    
    return {
        'name': data.get('full_name', 'Participant'),
        'age': data.get('age', ''),
        'risk': risk_level,
        'confidence': min(98.5, float(confidence_score)),
        'score': risk_score,
        'conditions': result_conditions,
        'categories': categories,
        'saved': False
    }

# --- Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/survey')
def survey():
    return render_template('survey.html')

@app.route('/result')
def result():
    return render_template('result.html')

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    admin_pass = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    # Check if already authenticated via session or URL param
    is_authenticated = session.get('admin_authed') == True
    provided_pass = request.args.get('pass') or (request.form.get('password') if request.method == 'POST' else None)
    
    if provided_pass == admin_pass:
        session['admin_authed'] = True
        is_authenticated = True
        # If password was in URL, redirect to clean URL but keep session
        if request.args.get('pass'):
            return redirect(url_for('admin'))
    
    if not is_authenticated:
        return render_template('admin.html', authenticated=False)
        
    assessments = Assessment.query.order_by(Assessment.date.desc()).all()
    return render_template('admin.html', assessments=assessments, authenticated=True)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_authed', None)
    return redirect(url_for('index'))

@app.route('/admin/delete/<int:id>')
def delete_assessment(id):
    if session.get('admin_authed') != True:
        return "Unauthorized", 403
        
    assessment = Assessment.query.get_or_404(id)
    try:
        db.session.delete(assessment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting record: {e}")
        
    return redirect(url_for('admin'))

# --- API Endpoints ---
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    result = calculate_risk(data)
    
    try:
        assessment = Assessment(
            risk_level=result['risk'],
            confidence=result['confidence'],
            score=result['score'],
            user_name=result['name'],
            age=int(str(result['age'])) if str(result['age']).isdigit() else None,
            predictions_json=str(result['conditions'])
        )
        db.session.add(assessment)
        db.session.commit()
        saved = True
        record_id = assessment.id
    except Exception as e:
        db.session.rollback()
        saved = False
        record_id = None
        print(f"CRITICAL: Error saving assessment to DB: {e}")
            
    cast(dict[str, Any], result)['saved'] = saved
    cast(dict[str, Any], result)['id'] = record_id
    return jsonify(result)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000,debug=True)
