import subprocess
import time
import requests

print("Starting Flask...")
proc = subprocess.Popen(["python", "run_ai.py"])
time.sleep(3)

print("Hitting /chat endpoint...")
try:
    res = requests.post("http://localhost:5000/chat", json={"message": "rutina principiante"})
    print("Response:", res.json())
except Exception as e:
    print("Error:", e)

proc.terminate()
print("Done.")
