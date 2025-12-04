#!/bin/bash
cd "$(dirname "$0")"
open http://localhost:8000/admin.html
python3 server.py
