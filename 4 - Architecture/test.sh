#!/bin/bash
# =====================================================================
# test.sh — manual test script for the /tasks REST API
# ---------------------------------------------------------------
# Usage: bash test.sh
# Assumes server is running on port 7000 (check your server.js PORT)
# Assumes a user already exists — edit EMAIL/PASSWORD below to match
# a real signed-up user, or this script will sign one up fresh.
# =====================================================================

BASE="http://localhost:7000"
EMAIL="alice@example.com"
PASSWORD="hunter2"

echo "===================================================="
echo "0. SIGNUP (ok if this fails with 'already exists')"
echo "===================================================="
curl -s -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo -e "\n"

echo "===================================================="
echo "1. LOGIN — grab token"
echo "===================================================="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_RESPONSE"

# extract token out of "Login Successful With Token <token>"
TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*Token \(.*\)/\1/p')
echo "Extracted token: $TOKEN"
echo -e "\n"

if [ -z "$TOKEN" ]; then
  echo "!! No token extracted — check login response format above, then edit this script's extraction line."
  exit 1
fi

echo "===================================================="
echo "2. CREATE TASK (with token) — expect success + title"
echo "===================================================="
curl -s -X POST "$BASE/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries"}'
echo -e "\n"

echo "===================================================="
echo "3. LIST TASKS (with token) — expect data/total/page/totalPages"
echo "===================================================="
curl -s "$BASE/tasks" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "===================================================="
echo "4. GET ONE TASK, id=1 (with token) — expect 200 + task object"
echo "===================================================="
curl -s -i "$BASE/tasks/1" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "===================================================="
echo "5. LIST TASKS — NO TOKEN — expect 401"
echo "===================================================="
curl -s -i "$BASE/tasks"
echo -e "\n"

echo "===================================================="
echo "6. LIST TASKS — GARBAGE TOKEN — expect 401"
echo "===================================================="
curl -s -i "$BASE/tasks" \
  -H "Authorization: Bearer garbage123"
echo -e "\n"

echo "===================================================="
echo "7. GET ONE TASK, id=99999 (doesn't exist) — expect 404"
echo "===================================================="
curl -s -i "$BASE/tasks/99999" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "===================================================="
echo "DONE — read through each section above against the"
echo "expected result noted in each heading."
echo "===================================================="