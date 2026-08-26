import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import cv2
import mediapipe as mp
import numpy as np

from gaze_processor import GazeProcessor


processor = GazeProcessor()
face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=2,
    refine_landmarks=False,
    min_detection_confidence=0.5,
)


class GazeHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "http://localhost:5173")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path not in {"/api/gaze/process", "/api/face/check"}:
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 2 * 1024 * 1024:
                raise ValueError("Invalid frame size")
            frame = cv2.imdecode(np.frombuffer(self.rfile.read(length), dtype=np.uint8), cv2.IMREAD_COLOR)
            if frame is None:
                raise ValueError("Invalid image frame")
            if self.path == "/api/face/check":
                height, width, _ = frame.shape
                results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                faces = results.multi_face_landmarks or []
                centered = False
                if len(faces) == 1:
                    points = faces[0].landmark
                    left = min(point.x for point in points)
                    right = max(point.x for point in points)
                    top = min(point.y for point in points)
                    bottom = max(point.y for point in points)
                    center_x = (left + right) / 2
                    center_y = (top + bottom) / 2
                    centered = 0.25 <= center_x <= 0.75 and 0.18 <= center_y <= 0.82
                body = json.dumps({"faceCount": len(faces), "centered": centered}).encode("utf-8")
            else:
                body = json.dumps({"state": processor.process_frame(frame)}).encode("utf-8")
            self.send_response(200)
        except Exception:
            body = json.dumps({"faceCount": 0, "centered": False} if self.path == "/api/face/check" else {"state": "attention_unavailable"}).encode("utf-8")
            self.send_response(200 if self.path == "/api/gaze/process" else 503)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    try:
        ThreadingHTTPServer(("127.0.0.1", 5051), GazeHandler).serve_forever()
    finally:
        processor.close()
        face_mesh.close()
