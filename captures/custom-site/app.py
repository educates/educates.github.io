"""A small front end of the kind a training team builds on Educates.

It lists the workshops of a lookup service tenant and starts a Session of
one when asked, embeds the training portal in a page of its own, receives
the portal's analytics events, and runs an examiner check from outside the
Session. It uses only the Python standard library.

Settings come from environment variables:

- LOOKUP_URL, LOOKUP_TENANT, LOOKUP_USERNAME, LOOKUP_PASSWORD: the lookup
  service, the tenant whose workshops it lists, and the client it logs in as.
- PORTAL_URL: the training portal shown on the embedding page.
- SITE_URL: this site's own URL, where a Session sends people back to.
- EVENTS_URL: where the training portal posts a Session's analytics events
  for this site, its URL inside the cluster.
- SSL_CERT_FILE: the CA bundle to trust when calling the lookup service.
"""

import html
import json
import os
import ssl
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

LOOKUP_URL = os.environ.get("LOOKUP_URL", "")
LOOKUP_TENANT = os.environ.get("LOOKUP_TENANT", "")
LOOKUP_USERNAME = os.environ.get("LOOKUP_USERNAME", "")
LOOKUP_PASSWORD = os.environ.get("LOOKUP_PASSWORD", "")
PORTAL_URL = os.environ.get("PORTAL_URL", "")
SITE_URL = os.environ.get("SITE_URL", "")
EVENTS_URL = os.environ.get("EVENTS_URL", "")
SITE_NAME = "Example Academy"

KUBERNETES_API = "https://kubernetes.default.svc"
SERVICE_ACCOUNT = "/var/run/secrets/kubernetes.io/serviceaccount"

events = deque(maxlen=200)
token_lock = threading.Lock()
token = {"value": None, "expires": 0.0}


def lookup_request(method, path, body=None):
    """Calls the lookup service, logging in first when there is no token."""
    with token_lock:
        if token["value"] is None or token["expires"] < time.time():
            login = call_json(
                "POST",
                f"{LOOKUP_URL}/auth/login",
                {"username": LOOKUP_USERNAME, "password": LOOKUP_PASSWORD},
            )
            token["value"] = login["access_token"]
            token["expires"] = time.time() + 3600
        headers = {"Authorization": f"Bearer {token['value']}"}
    return call_json(method, f"{LOOKUP_URL}{path}", body, headers)


def call_json(method, url, body=None, headers=None, context=None):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, method=method)
    request.add_header("Content-Type", "application/json")
    for name, value in (headers or {}).items():
        request.add_header(name, value)
    with urllib.request.urlopen(request, timeout=15, context=context) as response:
        return json.load(response)


def deployment_ready(namespace, name):
    """Whether a deployment in the namespace has all its replicas ready."""
    with open(f"{SERVICE_ACCOUNT}/token") as file:
        bearer = file.read().strip()
    context = ssl.create_default_context(cafile=f"{SERVICE_ACCOUNT}/ca.crt")
    url = f"{KUBERNETES_API}/apis/apps/v1/namespaces/{namespace}/deployments/{name}"
    try:
        deployment = call_json(
            "GET", url, headers={"Authorization": f"Bearer {bearer}"}, context=context
        )
    except urllib.error.HTTPError:
        return False
    wanted = deployment.get("spec", {}).get("replicas", 1)
    ready = deployment.get("status", {}).get("readyReplicas", 0)
    return ready >= wanted


# Events about the plumbing rather than the learner, left off the page.
QUIET_EVENTS = {"Terminal/Connect", "Terminal/Reconnect", "User/Create", "Workshop/Load"}


def event_details(event):
    """A line about an event: the page a learner viewed, or its data."""
    data = event.get("data") or {}
    if "current_page" in data:
        number = data.get("page_number")
        total = data.get("pages_total")
        return f"Page {number} of {total}: {data['current_page']}"
    if "event" in data:
        return f"Action: {data['event']}"
    return ", ".join(f"{key}: {value}" for key, value in data.items())


STYLE = """
* { box-sizing: border-box; }
body { margin: 0; font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1d2733; background: #f4f6f9; }
header { display: flex; align-items: center; gap: 12px; padding: 14px 32px;
  background: #1f3a5f; color: #fff; }
header .logo { width: 30px; height: 30px; border-radius: 8px; background: #f2a541;
  display: grid; place-items: center; font-weight: 700; color: #1f3a5f; }
header nav { margin-left: auto; display: flex; gap: 20px; font-size: 15px; }
header nav a { color: #dbe6f3; text-decoration: none; }
header nav a.current { color: #fff; font-weight: 600; }
main { max-width: 1040px; margin: 0 auto; padding: 32px; }
h1 { margin: 0 0 6px; font-size: 28px; }
p.lead { margin: 0 0 24px; color: #4a5868; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }
.card { display: flex; flex-direction: column; gap: 8px; padding: 20px; border-radius: 12px;
  background: #fff; box-shadow: 0 1px 3px rgba(20, 40, 70, 0.12); }
.card h2 { margin: 0; font-size: 19px; }
.card p { margin: 0; color: #4a5868; flex: 1; }
.card button { align-self: flex-start; padding: 8px 16px; border: 0; border-radius: 8px;
  background: #2f6fdf; color: #fff; font: 600 15px system-ui, sans-serif; cursor: pointer; }
.card .meta { font-size: 13px; color: #6a7888; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 3px rgba(20, 40, 70, 0.12); font-size: 14px; }
th, td { padding: 9px 14px; text-align: left; border-bottom: 1px solid #e6eaf0; vertical-align: top; }
th { background: #eef2f7; font-weight: 600; }
td code { font: 13px ui-monospace, Menlo, monospace; color: #33475b; white-space: nowrap; }
iframe { width: 100%; height: 560px; border: 1px solid #d5dce6; border-radius: 12px; background: #fff; }
"""


def page(title, current, body):
    links = [("/", "Workshops"), ("/embed", "Training portal"), ("/events", "Analytics")]
    nav = "".join(
        f'<a href="{href}" class="{"current" if href == current else ""}">{label}</a>'
        for href, label in links
    )
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>{html.escape(title)} | {SITE_NAME}</title><style>{STYLE}</style></head>
<body><header><span class="logo">EA</span><strong>{SITE_NAME}</strong><nav>{nav}</nav></header>
<main>{body}</main></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def send_text(self, status, content, content_type="text/html; charset=utf-8", headers=None):
        payload = content.encode()
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(payload)

    def cors_headers(self):
        return {
            "Access-Control-Allow-Origin": self.headers.get("Origin", "*"),
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }

    def do_OPTIONS(self):
        self.send_text(204, "", headers=self.cors_headers())

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/":
            return self.workshops()
        if path == "/embed":
            return self.embed()
        if path == "/events":
            return self.events()
        if path == "/healthz":
            return self.send_text(200, "ok", "text/plain")
        self.send_text(404, page("Not found", "", "<h1>Not found</h1>"))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        length = int(self.headers.get("Content-Length", "0") or 0)
        body = self.rfile.read(length) if length else b""
        if parsed.path == "/start":
            return self.start(urllib.parse.parse_qs(body.decode()))
        if parsed.path == "/events":
            try:
                events.appendleft(json.loads(body or b"{}"))
            except json.JSONDecodeError:
                pass
            return self.send_text(200, "{}", "application/json")
        if parsed.path.startswith("/check/"):
            return self.check(parsed.path.removeprefix("/check/"), body)
        self.send_text(404, "{}", "application/json")

    def workshops(self):
        try:
            listing = lookup_request("GET", f"/api/v1/workshops?tenant={LOOKUP_TENANT}")
            workshops = listing.get("workshops", [])
        except Exception as error:  # Shown on the page, so the problem is visible.
            workshops = []
            message = f"<p>Could not reach the lookup service: {html.escape(str(error))}</p>"
        else:
            message = ""
        cards = "".join(
            f"""<form class="card" method="post" action="/start">
<h2>{html.escape(workshop.get("title", workshop["name"]))}</h2>
<p>{html.escape(workshop.get("description", ""))}</p>
<input type="hidden" name="workshop" value="{html.escape(workshop["name"])}">
<button type="submit">Start workshop</button></form>"""
            for workshop in workshops
        )
        body = f"""<h1>Hands-on workshops</h1>
<p class="lead">Pick a workshop, and a lab environment of your own opens in your browser.</p>
{message}<div class="grid">{cards}</div>"""
        self.send_text(200, page("Workshops", "/", body))

    def start(self, form):
        workshop = form.get("workshop", [""])[0]
        response = lookup_request(
            "POST",
            "/api/v1/workshops",
            {
                "tenantName": LOOKUP_TENANT,
                "workshopName": workshop,
                "clientIndexUrl": f"{SITE_URL}/",
                "clientUserId": "learner-0042",
                "userFirstName": "Sam",
                "userLastName": "Example",
                "userEmailAddress": "sam@example.com",
                "analyticsWebhookUrl": EVENTS_URL,
            },
        )
        self.send_text(303, "", headers={"Location": response["sessionActivationUrl"]})

    def embed(self):
        body = f"""<h1>Training portal</h1>
<p class="lead">The workshops of our training portal, embedded in this page.</p>
<iframe src="{html.escape(PORTAL_URL)}/" title="Training portal"></iframe>"""
        self.send_text(200, page("Training portal", "/embed", body))

    def events(self):
        shown = [
            item.get("event", {})
            for item in events
            if item.get("event", {}).get("name") not in QUIET_EVENTS
        ]
        rows = "".join(
            f"""<tr><td><code>{html.escape(event.get("timestamp", "")[11:19])}</code></td>
<td><strong>{html.escape(event.get("name", ""))}</strong></td>
<td><code>{html.escape(event.get("session", "") or "")}</code></td>
<td>{html.escape(event_details(event))}</td></tr>"""
            for event in shown[:40]
        )
        body = f"""<h1>Learner activity</h1>
<p class="lead">Events the training portal posted to this site's webhook, newest first.</p>
<table><thead><tr><th>Time</th><th>Event</th><th>Session</th><th>Details</th></tr></thead>
<tbody>{rows or '<tr><td colspan="4">No events yet.</td></tr>'}</tbody></table>
<script>setTimeout(() => location.reload(), 3000)</script>"""
        self.send_text(200, page("Analytics", "/events", body))

    def check(self, name, body):
        try:
            request = json.loads(body or b"{}")
        except json.JSONDecodeError:
            request = {}
        args = request.get("args") or []
        if name == "deployment-ready" and len(args) == 2:
            success = deployment_ready(args[0], args[1])
            message = "Deployment is ready" if success else "Deployment is not ready yet"
        else:
            success, message = False, f"Unknown check {name}"
        self.send_text(
            200,
            json.dumps({"success": success, "message": message}),
            "application/json",
            self.cors_headers(),
        )

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
