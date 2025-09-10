#!/bin/bash
# Render start script

echo "Starting Cannabis Tracker API with Gunicorn..."
cd backend
gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 main:app
