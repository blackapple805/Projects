# scripts/setup_env.sh
#!/bin/bash

python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
echo "Virtual environment set up and dependencies installed."
