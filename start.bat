@echo off
echo Starting Mental Health Predictor...
echo.

if not exist model\mental_health_model.pkl (
    echo Model not found. Training model first...
    python train_model.py
    if errorlevel 1 (
        echo Error training model.
        pause
        exit /b
    )
)

echo Starting Flask server...
python app.py
pause
