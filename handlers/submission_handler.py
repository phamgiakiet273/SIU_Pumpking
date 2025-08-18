from fastapi import HTTPException
from http import HTTPStatus
from configs.submission import SubmissionConfig
from schema.api import APIResponse
from schema.submission import SubmitRequest
from utils.logger import get_logger
import requests
import os

from typing import Optional
from fastapi import Form


logger = get_logger()


class SubmissionHandler:
    def __init__(self):
        config = SubmissionConfig()
        self.base_url = config.SUBMIT_BASE_URL
        self.username = config.SUBMIT_USERNAME
        self.password = config.SUBMIT_PASSWORD
        self.session_id = None
        self._login()  # Auto login on initialization

    async def ping_handler(self) -> APIResponse:
        logger.info("ping_handler invoked")
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Running (Healthy)",
            data="ping",
        )

    def _login(self):
        try:
            resp = requests.post(
                f"{self.base_url}/api/v2/login",
                json={"username": self.username, "password": self.password},
            )
            if resp.status_code == 200:
                self.session_id = resp.json()["sessionId"]
                logger.info(f"Auto-login successful, session_id: {self.session_id}")
                return True
            else:
                logger.error(f"Auto-login failed: {resp.status_code} {resp.text}")
                self.session_id = None
                return False
        except Exception as e:
            logger.error(f"Exception during auto-login: {e}")
            self.session_id = None
            return False

    async def get_session_id_handler(self):
        if not self.session_id:
            if not self._login():
                raise HTTPException(status_code=500, detail="Login failed")
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Session ID fetched",
            data={"session_id": self.session_id},
        )

    async def get_eval_id_handler(self):
        if not self.session_id:
            if not self._login():
                raise HTTPException(status_code=500, detail="Login failed")
        resp = requests.get(
            f"{self.base_url}/api/v2/client/evaluation/list",
            params={"session": self.session_id},
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=resp.status_code, detail="Failed to fetch evaluations"
            )
        evaluations = resp.json()
        active_eval = next((e for e in evaluations if e["status"] == "ACTIVE"), None)
        if not active_eval:
            raise HTTPException(status_code=404, detail="No active evaluation found")
        self.eval_id = active_eval["id"]
        return APIResponse(
            status=HTTPStatus.OK.value,
            message="Active evaluation ID fetched",
            data={"eval_id": self.eval_id},
        )

    async def submit_handler(self, request: SubmitRequest) -> APIResponse:
        payload = {
            "answerSets": [
                {
                    "answers": [
                        {
                            "mediaItemName": request.mediaItemName,
                            "start": request.start,
                            "end": request.end,
                        }
                    ]
                }
            ]
        }
        resp = requests.post(
            f"{self.base_url}/api/v2/submit/{request.eval_id}",
            json=payload,
            params={"session": request.session_id},
        )
        if resp.status_code == 200:
            result = resp.json()
            return APIResponse(
                status=HTTPStatus.OK.value,
                message="Submit successful"
                if result.get("status")
                else "Submit failed",
                data=result,
            )
        else:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)

    async def relogin(self):
        ok = self._login()
        if ok:
            return APIResponse(
                status=HTTPStatus.OK.value,
                message="Re-login successful",
                data={"session_id": self.session_id},
            )
        else:
            raise HTTPException(status_code=500, detail="Re-login failed")

    # async def submit_handler(self, request: SubmitRequest) -> APIResponse:
    #     logger.info(f"submit_handler invoked: {request}")
    #     BASE_URL = os.getenv("SUBMIT_BASE_URL", "http://127.0.0.1:8591")
    #     USERNAME = os.getenv("SUBMIT_USERNAME", "siu_pumpking")
    #     PASSWORD = os.getenv("SUBMIT_PASSWORD", "siu_pumpking")

    #     # Step 1: Log in and get session ID
    #     login_resp = requests.post(
    #         f"{BASE_URL}/api/v2/login",
    #         json={"username": USERNAME, "password": PASSWORD}
    #     )
    #     if login_resp.status_code != 200:
    #         logger.error(f"Login failed: {login_resp.status_code} {login_resp.text}")
    #         raise HTTPException(status_code=login_resp.status_code, detail="Login failed")
    #     session_id = login_resp.json()["sessionId"]
    #     logger.info(f"Logged in, session ID: {session_id}")

    #     # Step 2: Get list of current evaluations
    #     eval_list_resp = requests.get(
    #         f"{BASE_URL}/api/v2/client/evaluation/list",
    #         params={"session": session_id}
    #     )
    #     if eval_list_resp.status_code != 200:
    #         logger.error(f"Failed to fetch evaluations: {eval_list_resp.status_code}")
    #         raise HTTPException(status_code=eval_list_resp.status_code, detail="Failed to fetch evaluations")
    #     evaluations = eval_list_resp.json()
    #     active_eval = next((e for e in evaluations if e["status"] == "ACTIVE"), None)
    #     if not active_eval:
    #         logger.error("No active evaluation found.")
    #         raise HTTPException(status_code=404, detail="No active evaluation found")
    #     evaluation_id = active_eval["id"]
    #     logger.info(f"Submitting to evaluation: {evaluation_id}")

    #     # Step 3: Submit an answer
    #     submission_payload = {
    #         "answerSets": [
    #             {
    #                 "answers": [
    #                     {
    #                         "mediaItemName": request.mediaItemName,
    #                         "start": request.start,
    #                         "end": request.end
    #                     }
    #                 ]
    #             }
    #         ]
    #     }
    #     submit_resp = requests.post(
    #         f"{BASE_URL}/api/v2/submit/{evaluation_id}",
    #         json=submission_payload,
    #         params={"session": session_id}
    #     )
    #     if submit_resp.status_code == 200:
    #         result = submit_resp.json()
    #         logger.info(f"Submission result: {result}")
    #         return APIResponse(
    #             status=HTTPStatus.OK.value,
    #             message="Submit successful" if result.get("status") else "Submit failed",
    #             data=result
    #         )
    #     else:
    #         logger.error(f"Error submitting: {submit_resp.status_code} {submit_resp.text}")
    #         raise HTTPException(status_code=submit_resp.status_code, detail=submit_resp.text)
