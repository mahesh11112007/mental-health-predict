import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

def train():
    # Load dataset
    df = pd.read_csv('Mentalillness.csv')
    
    # Features and Targets
    # Targets are the last 5 columns
    target_cols = ['Bipolar disorder', 'Schizophrenia', 'Depression', 'Anxiety disorder', 'PTSD']
    X = df.drop(columns=['ID'] + target_cols)
    y = df[target_cols]
    
    # Create model directory
    if not os.path.exists('model'):
        os.makedirs('model')
        
    # Save the feature names for later use in the web app
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, 'model/features.pkl')
    print(f"Features saved: {len(feature_names)}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Multi-Output Random Forest
    forest = RandomForestClassifier(n_estimators=100, random_state=42)
    multi_target_forest = MultiOutputClassifier(forest, n_jobs=-1)
    multi_target_forest.fit(X_train, y_train)
    
    # Evaluate
    score = multi_target_forest.score(X_test, y_test)
    print(f"Model Accuracy (Exact match): {score:.4f}")
    
    # Save model
    if not os.path.exists('model'):
        os.makedirs('model')
    joblib.dump(multi_target_forest, 'model/mental_health_model.pkl')
    print("Model saved to model/mental_health_model.pkl")

    # Get feature importance for one of the targets (e.g., Depression) to help select survey questions
    # Note: MultiOutputClassifier doesn't expose feature_importances_ directly, 
    # we need to access the individual estimators.
    importances = multi_target_forest.estimators_[2].feature_importances_ # Index 2 is Depression
    feature_importance_df = pd.DataFrame({'feature': feature_names, 'importance': importances})
    print("\nTop 10 features for Depression Prediction:")
    print(feature_importance_df.sort_values(by='importance', ascending=False).head(10))

if __name__ == '__main__':
    train()
