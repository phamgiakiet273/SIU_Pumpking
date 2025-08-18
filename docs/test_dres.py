import requests

BASE_URL = "http://127.0.0.1:8591"
USERNAME = "siu_pumpking"
PASSWORD = "siu_pumpking"

# Step 1: Log in and get session ID
login_resp = requests.post(
    f"{BASE_URL}/api/v2/login", json={"username": USERNAME, "password": PASSWORD}
)

if login_resp.status_code != 200:
    print(f"Login failed: {login_resp.status_code} {login_resp.text}")
    exit()

session_id = login_resp.json()["sessionId"]
print(f"✅ Logged in, session ID: {session_id}")

# Step 2: Get list of current evaluations
eval_list_resp = requests.get(
    f"{BASE_URL}/api/v2/client/evaluation/list", params={"session": session_id}
)

if eval_list_resp.status_code != 200:
    print(f"Failed to fetch evaluations: {eval_list_resp.status_code}")
    exit()

evaluations = eval_list_resp.json()
active_eval = next((e for e in evaluations if e["status"] == "ACTIVE"), None)
print(active_eval)
if not active_eval:
    print("❌ No active evaluation found.")
    exit()

evaluation_id = active_eval["id"]
print(f"📌 Submitting to evaluation: {evaluation_id}")

# Step 3: Submit an answer
submission_payload = {
    "answerSets": [
        {
            "answers": [
                {
                    "mediaItemName": "L12_V018",
                    "start": 359960,  # in milliseconds
                    "end": 359960,
                }
            ]
        }
    ]
}

submit_resp = requests.post(
    f"{BASE_URL}/api/v2/submit/{evaluation_id}",
    json=submission_payload,
    params={"session": session_id},
)

if submit_resp.status_code == 200:
    result = submit_resp.json()
    if result.get("status"):
        print("✅ Submission successful!")
    else:
        print("⚠️ Submission failed but no error code.")
else:
    print(f"❌ Error submitting: {submit_resp.status_code} {submit_resp.text}")
