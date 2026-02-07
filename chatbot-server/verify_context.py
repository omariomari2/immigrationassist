import requests
import json
import time

url = "http://localhost:8001/chat"
headers = {'Content-Type': 'application/json'}

print("Test 1: Query H1B Data (Employer Info)")
payload = {
    "query": "What is the approval rate for Apple?",
    "history": [],
    "context": {}
}
try:
    res = requests.post(url, json=payload, headers=headers)
    if res.status_code == 200:
        print("Response:", json.dumps(res.json(), indent=2))
    else:
        print("Failed:", res.status_code, res.text)
except Exception as e:
    print("Error:", e)

print("\nTest 2: Query User Context")
payload = {
    "query": "What is my visa type?",
    "history": [],
    "context": {
        "user": {
            "name": "Test User",
            "visaType": "H-1B Special",
            "priorityDate": "2024-01-01"
        }
    }
}
try:
    res = requests.post(url, json=payload, headers=headers)
    if res.status_code == 200:
        ans = res.json().get("answer", "")
        print("Answer:", ans)
    else:
        print("Failed:", res.status_code, res.text)
except Exception as e:
    print("Error:", e)
