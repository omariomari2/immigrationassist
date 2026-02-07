import requests
import time

url = "http://localhost:8001/chat"
headers = {'Content-Type': 'application/json'}

queries = [
    "What is the limit for employment based immigrants?",
    "Does this include spouses?",
    "What is the priority date?",
    "Tell me about the visa bulletin."
]

for i, q in enumerate(queries):
    print(f"\n--- Request {i+1}: {q} ---")
    payload = {"query": q, "history": []}
    try:
        start = time.time()
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print(f"Success ({elapsed:.2f}s)")
        else:
            print(f"Failed ({elapsed:.2f}s): {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    
    time.sleep(1)
