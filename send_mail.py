#!/usr/bin/env python3
"""CGI and local development endpoint for the Cyber Yorkshire contact form."""

import html
import json
import os
import re
import smtplib
import sys
import urllib.parse
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, HTTPServer


MAX_PAYLOAD_SIZE = 16 * 1024
RECIPIENT = "contact@cyberyorkshire.com"
EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$")


def json_response(status, message, http_status=200):
    """Return a CGI/local response tuple."""
    return http_status, {"status": status, "message": message}


def sanitise(value):
    """Remove header control characters and escape user-provided text."""
    return html.escape(value.replace("\r", "").replace("\n", "").strip(), quote=True)


def parse_request(body):
    """Validate and sanitise URL-encoded form data."""
    fields = urllib.parse.parse_qs(body.decode("utf-8", errors="replace"), keep_blank_values=True)
    values = {key: items[0] if items else "" for key, items in fields.items()}

    if values.get("website", "").strip():
        return json_response("success", "Your inquiry has been received.")

    raw_email = values.get("email", "").strip().replace("\r", "").replace("\n", "")
    if not EMAIL_PATTERN.fullmatch(raw_email):
        return json_response("error", "Please provide a valid email address.", 422)

    required = ("name", "phone", "service", "message")
    if any(not values.get(field, "").strip() for field in required):
        return json_response("error", "Please complete all required fields.", 422)

    clean = {key: sanitise(values.get(key, "")) for key in (
        "name", "email", "phone", "organization", "service", "message"
    )}
    return send_email(clean)


def send_email(fields):
    """Send the validated inquiry through the local cPanel SMTP relay."""
    remote_addr = sanitise(os.environ.get("REMOTE_ADDR", "Unknown"))
    message = EmailMessage()
    message["From"] = "Cyber Yorkshire Portal <contact@cyberyorkshire.com>"
    message["To"] = RECIPIENT
    message["Reply-To"] = fields["email"]
    message["Subject"] = "[Cyber Yorkshire Advisory Request] New Inquiry from " + fields["name"]
    message.set_content(
        "Cyber Yorkshire Advisory Request\n"
        "================================\n\n"
        f"Name: {fields['name']}\n"
        f"Email: {fields['email']}\n"
        f"Phone: {fields['phone']}\n"
        f"Organisation: {fields['organization'] or 'Not provided'}\n"
        f"Service pillar: {fields['service']}\n\n"
        f"Message:\n{fields['message']}\n\n"
        f"Submitted: {os.environ.get('REQUEST_TIME', 'CGI request')}\n"
        f"Visitor IP: {remote_addr}\n"
    )

    try:
        with smtplib.SMTP("localhost", 25, timeout=10) as smtp:
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException):
        return json_response(
            "error",
            "We could not send your inquiry. Please email contact@cyberyorkshire.com directly.",
            500,
        )
    return json_response("success", "Your inquiry has been sent securely.")


def process_request(method, body):
    """Process one CGI/local request with a strict method and size limit."""
    if method != "POST":
        return json_response("error", "Only POST requests are accepted.", 405)
    if len(body) > MAX_PAYLOAD_SIZE:
        return json_response("error", "Request payload is too large.", 413)
    return parse_request(body)


def emit_response(http_status, payload):
    """Write a JSON CGI response."""
    print(f"Status: {http_status}")
    print("Content-Type: application/json; charset=utf-8")
    print()
    print(json.dumps(payload, ensure_ascii=False))


class LocalHandler(BaseHTTPRequestHandler):
    """Small HTTP adapter for local PyCharm testing."""

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        body = self.rfile.read(min(length, MAX_PAYLOAD_SIZE + 1))
        os.environ["REMOTE_ADDR"] = self.client_address[0]
        status, payload = process_request("POST", body)
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        self.send_error(405, "Only POST requests are accepted.")

    def log_message(self, format_string, *args):
        return


def run_local_server():
    """Run the endpoint at http://127.0.0.1:8000 for local testing."""
    HTTPServer(("127.0.0.1", 8000), LocalHandler).serve_forever()


if __name__ == "__main__":
    if "--local" in sys.argv:
        run_local_server()
    else:
        content_length = os.environ.get("CONTENT_LENGTH", "0")
        try:
            length = int(content_length)
        except ValueError:
            length = 0
        if length < 0 or length > MAX_PAYLOAD_SIZE:
            emit_response(413, {"status": "error", "message": "Request payload is too large."})
        else:
            emit_response(*process_request(
                os.environ.get("REQUEST_METHOD", ""),
                sys.stdin.buffer.read(length),
            ))
