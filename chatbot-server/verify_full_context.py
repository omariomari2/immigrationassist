import requests
import json

url = "http://localhost:8001/chat"
headers = {'Content-Type': 'application/json'}

# We ask about news to trigger the usage of external context
print("Test 3: Query News (External Data)")
payload = {
    "query": "What is the latest immigration news?",
    "history": [],
    "context": {
        "user": {"visaType": "h1b"}
    }
}
try:
    res = requests.post(url, json=payload, headers=headers)
    if res.status_code == 200:
        ans = res.json().get("answer", "")
        print("Answer:", ans[:500] + "..." if len(ans) > 500 else ans)
    else:
        print("Failed:", res.status_code, res.text)
except Exception as e:
    print("Error:", e)
