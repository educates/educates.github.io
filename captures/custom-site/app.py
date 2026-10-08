"""A small front end of the kind a training team builds on Educates.

It lists the workshops of a lookup service tenant and starts a Session of
one when asked, embeds the training portal in a page of its own, receives
the portal's analytics events, and runs an examiner check from outside the
Session. Two more kinds of site live beside it: a catalog for the person
signed in, built on one training portal's REST API alone, and the sites of
two customers, each reaching only its own tenant of the lookup service. It
uses only the Python standard library.

Settings come from environment variables:

- LOOKUP_URL, LOOKUP_TENANT, LOOKUP_USERNAME, LOOKUP_PASSWORD: the lookup
  service, the tenant whose workshops it lists, and the client it logs in as.
- PORTAL_URL: the training portal shown on the embedding page, whose REST
  API the signed-in catalog uses.
- ROBOT_CLIENT_ID, ROBOT_CLIENT_SECRET, ROBOT_USERNAME, ROBOT_PASSWORD: the
  training portal's robot account, which the signed-in catalog logs in as.
- CUSTOMERS: the customer sites, as a JSON list: each with its id, name,
  initials and colour, its lookup service tenant, and the username and
  password of the client it logs in as.
- SITE_URL: this site's own URL, where a Session sends people back to.
- EVENTS_URL: where the training portal posts a Session's analytics events
  for this site, its URL inside the cluster.
- SSL_CERT_FILE: the CA bundle to trust when calling the lookup service.
"""

import base64
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
ROBOT_CLIENT_ID = os.environ.get("ROBOT_CLIENT_ID", "")
ROBOT_CLIENT_SECRET = os.environ.get("ROBOT_CLIENT_SECRET", "")
ROBOT_USERNAME = os.environ.get("ROBOT_USERNAME", "")
ROBOT_PASSWORD = os.environ.get("ROBOT_PASSWORD", "")
CUSTOMERS = {
    customer["id"]: customer
    for customer in json.loads(os.environ.get("CUSTOMERS") or "[]")
}
SITE_URL = os.environ.get("SITE_URL", "")
EVENTS_URL = os.environ.get("EVENTS_URL", "")
SITE_NAME = "Example Academy"
SITE_INITIALS = "EA"

# The person signed in to the signed-in catalog, as the site's own sign-in
# knows them. The ID is the one the site passes to the portal for them.
SIGNED_IN = {
    "id": "dana-lee",
    "first_name": "Dana",
    "last_name": "Lee",
    "email": "dana@example.com",
}

KUBERNETES_API = "https://kubernetes.default.svc"
SERVICE_ACCOUNT = "/var/run/secrets/kubernetes.io/serviceaccount"

events = deque(maxlen=200)
token_lock = threading.Lock()
# Access tokens, by the API and the client they are for.
tokens = {}


def cached_token(key, log_in):
    """The access token kept for `key`, from `log_in` when there is none or
    it has expired. `log_in` returns a token and how many seconds it lasts."""
    with token_lock:
        token = tokens.get(key)
        if token is None or token["expires"] < time.time():
            value, lifetime = log_in()
            token = {"value": value, "expires": time.time() + lifetime}
            tokens[key] = token
        return token["value"]


def lookup_request(method, path, body=None, client=(LOOKUP_USERNAME, LOOKUP_PASSWORD)):
    """Calls the lookup service as a client, given by its username and
    password, logging in first when it has no token."""
    username, password = client

    def log_in():
        login = call_json(
            "POST",
            f"{LOOKUP_URL}/auth/login",
            {"username": username, "password": password},
        )
        return login["access_token"], 3600

    token = cached_token(("lookup", username), log_in)
    headers = {"Authorization": f"Bearer {token}"}
    return call_json(method, f"{LOOKUP_URL}{path}", body, headers)


def portal_request(method, path, query=None):
    """Calls the training portal's REST API as its robot account, logging in
    first when it has no token."""

    def log_in():
        form = urllib.parse.urlencode(
            {"grant_type": "password", "username": ROBOT_USERNAME, "password": ROBOT_PASSWORD}
        ).encode()
        request = urllib.request.Request(f"{PORTAL_URL}/oauth2/token/", data=form, method="POST")
        client = base64.b64encode(f"{ROBOT_CLIENT_ID}:{ROBOT_CLIENT_SECRET}".encode()).decode()
        request.add_header("Authorization", f"Basic {client}")
        request.add_header("Content-Type", "application/x-www-form-urlencoded")
        with urllib.request.urlopen(request, timeout=15) as response:
            login = json.load(response)
        # Renewed a minute early, so it does not expire during a request.
        return login["access_token"], login.get("expires_in", 3600) - 60

    token = cached_token(("portal", ROBOT_USERNAME), log_in)
    url = f"{PORTAL_URL}{path}" + (f"?{urllib.parse.urlencode(query)}" if query else "")
    return call_json(method, url, headers={"Authorization": f"Bearer {token}"})


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
header .account { margin-left: auto; display: flex; align-items: center; gap: 10px;
  font-size: 15px; }
header .avatar { width: 30px; height: 30px; border-radius: 50%; background: #dbe6f3;
  color: #1f3a5f; display: grid; place-items: center; font: 700 13px system-ui, sans-serif; }
.card .free { font-size: 14px; color: #4a5868; }
.card .yours { font-size: 14px; font-weight: 600; color: #1f7a4d; }
.card button.resume { background: #1f7a4d; }
body.branded header { background: var(--brand); }
body.branded header .logo { background: #fff; color: var(--brand); }
body.branded .card button { background: var(--brand); }
p.tenant { margin: 16px 0 0; font-size: 13px; color: #6a7888; }
p.tenant code { font: 13px ui-monospace, Menlo, monospace; }
"""


def page(title, current, body):
    links = [("/", "Workshops"), ("/embed", "Training portal"), ("/events", "Analytics")]
    nav = "".join(
        f'<a href="{href}" class="{"current" if href == current else ""}">{label}</a>'
        for href, label in links
    )
    return layout(title, SITE_NAME, SITE_INITIALS, f"<nav>{nav}</nav>", body)


def layout(title, site_name, initials, header_end, body, colour=None):
    """A page under a header with the site's logo and name, and `header_end`
    at the header's far end, in the site's own colour when it has one."""
    brand = f' class="branded" style="--brand: {html.escape(colour)}"' if colour else ""
    logo = f'<span class="logo">{html.escape(initials)}</span>'
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>{html.escape(title)} | {html.escape(site_name)}</title><style>{STYLE}</style></head>
<body{brand}><header>{logo}<strong>{html.escape(site_name)}</strong>{header_end}</header>
<main>{body}</main></body></html>"""


def minutes_left(seconds):
    minutes = max(1, round(seconds / 60))
    return f"{minutes} min left"


def customer_at(path, page=""):
    """The customer whose site has the page `path`, such as /customers/acme
    with no `page`, or /customers/acme/start with `page` /start."""
    prefix = "/customers/"
    if not path.startswith(prefix) or not path.endswith(page):
        return None
    return CUSTOMERS.get(path[len(prefix) : len(path) - len(page)])


def client_of(customer):
    """The lookup service client a customer's site logs in as."""
    return customer["username"], customer["password"]


def workshop_cards(tenant, client, action):
    """The workshops a client reaches in a lookup service tenant, as cards
    whose button posts to `action`, and a message when it cannot be reached."""
    try:
        listing = lookup_request(
            "GET", f"/api/v1/workshops?tenant={urllib.parse.quote(tenant)}", client=client
        )
    except Exception as error:  # Shown on the page, so the problem is visible.
        return f"<p>Could not reach the lookup service: {html.escape(str(error))}</p>", ""
    cards = "".join(
        f"""<form class="card" method="post" action="{html.escape(action)}">
<h2>{html.escape(workshop.get("title", workshop["name"]))}</h2>
<p>{html.escape(workshop.get("description", ""))}</p>
<input type="hidden" name="workshop" value="{html.escape(workshop["name"])}">
<button type="submit">Start workshop</button></form>"""
        for workshop in listing.get("workshops", [])
    )
    return "", cards


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
        if path == "/portal":
            return self.signed_in_catalog()
        if customer := customer_at(path):
            return self.customer_site(customer)
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
        if parsed.path == "/portal/start":
            return self.start_signed_in(urllib.parse.parse_qs(body.decode()))
        if customer := customer_at(parsed.path, "/start"):
            return self.start_for_customer(customer, urllib.parse.parse_qs(body.decode()))
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
        message, cards = workshop_cards(
            LOOKUP_TENANT, (LOOKUP_USERNAME, LOOKUP_PASSWORD), "/start"
        )
        body = f"""<h1>Hands-on workshops</h1>
<p class="lead">Pick a workshop, and a lab environment of your own opens in your browser.</p>
{message}<div class="grid">{cards}</div>"""
        self.send_text(200, page("Workshops", "/", body))

    def start(self, form):
        self.start_session(
            LOOKUP_TENANT,
            (LOOKUP_USERNAME, LOOKUP_PASSWORD),
            form,
            {
                "clientIndexUrl": f"{SITE_URL}/",
                "clientUserId": "learner-0042",
                "userFirstName": "Sam",
                "userLastName": "Example",
                "userEmailAddress": "sam@example.com",
                "analyticsWebhookUrl": EVENTS_URL,
            },
        )

    def start_session(self, tenant, client, form, details):
        """Asks the lookup service for a Session of the workshop in `form`,
        with the request's other `details`, and sends the browser to it."""
        response = lookup_request(
            "POST",
            "/api/v1/workshops",
            {
                "tenantName": tenant,
                "workshopName": form.get("workshop", [""])[0],
                **details,
            },
            client=client,
        )
        self.send_text(303, "", headers={"Location": response["sessionActivationUrl"]})

    def signed_in_catalog(self):
        """The portal's workshops for the person signed in, from its REST API alone."""
        try:
            catalog = portal_request("GET", "/workshops/catalog/environments/")
            signed_in_sessions = portal_request(
                "GET", f"/workshops/user/{SIGNED_IN['id']}/sessions/"
            )
        except Exception as error:  # Shown on the page, so the problem is visible.
            catalog, signed_in_sessions = {}, {}
            message = f"<p>Could not reach the training portal: {html.escape(str(error))}</p>"
        else:
            message = ""
        sessions = {
            session["environment"]: session
            for session in signed_in_sessions.get("sessions", [])
        }
        cards = []
        for environment in catalog.get("environments", []):
            workshop = environment["workshop"]
            capacity = environment.get("capacity")
            free_count = capacity - environment.get("allocated", 0) if capacity else 0
            free = (
                f'<p class="free">{free_count} of {capacity} Sessions free</p>' if capacity else ""
            )
            session = sessions.get(environment["name"])
            if session:
                countdown = session.get("countdown")
                status = (
                    f'<p class="yours">Your Session: {minutes_left(countdown)}</p>'
                    if countdown
                    else ""
                )
                resume = '<button type="submit" class="resume">Resume your Session</button>'
                action = f"{status}{resume}"
            else:
                action = '<button type="submit">Start workshop</button>'
            cards.append(
                f"""<form class="card" method="post" action="/portal/start" target="_blank">
<h2>{html.escape(workshop.get("title") or workshop["name"])}</h2>
<p>{html.escape(workshop.get("description", ""))}</p>{free}
<input type="hidden" name="environment" value="{html.escape(environment["name"])}">
{action}</form>"""
            )
        name = f"{SIGNED_IN['first_name']} {SIGNED_IN['last_name']}"
        initials = SIGNED_IN["first_name"][0] + SIGNED_IN["last_name"][0]
        account = (
            f'<span class="account"><span class="avatar">{initials}</span>'
            f"{html.escape(name)}</span>"
        )
        body = f"""<h1>Your workshops</h1>
<p class="lead">Start a workshop and it opens in a new tab, or go back to the one you have open.</p>
{message}<div class="grid">{"".join(cards)}</div>"""
        self.send_text(200, layout("Your workshops", SITE_NAME, SITE_INITIALS, account, body))

    def start_signed_in(self, form):
        """Asks the portal for a Session for the person signed in, the one they
        have if any, and sends the browser to it."""
        environment = form.get("environment", [""])[0]
        response = portal_request(
            "POST",
            f"/workshops/environment/{urllib.parse.quote(environment)}/request/",
            query={
                "index_url": f"{SITE_URL}/portal",
                "user": SIGNED_IN["id"],
                "email": SIGNED_IN["email"],
                "first_name": SIGNED_IN["first_name"],
                "last_name": SIGNED_IN["last_name"],
            },
        )
        self.send_text(303, "", headers={"Location": f"{PORTAL_URL}{response['url']}"})

    def customer_site(self, customer):
        """A customer's own site, listing the workshops of its tenant alone."""
        message, cards = workshop_cards(
            customer["tenant"], client_of(customer), f"/customers/{customer['id']}/start"
        )
        body = f"""<h1>Your workshops</h1>
<p class="lead">Hands-on labs, each in an environment of your own.</p>
{message}<div class="grid">{cards}</div>
<p class="tenant">Lookup service tenant: <code>{html.escape(customer["tenant"])}</code></p>"""
        page_html = layout(
            "Your workshops",
            customer["name"],
            customer["initials"],
            "",
            body,
            customer["colour"],
        )
        self.send_text(200, page_html)

    def start_for_customer(self, customer, form):
        self.start_session(
            customer["tenant"],
            client_of(customer),
            form,
            {
                "clientIndexUrl": f"{SITE_URL}/customers/{customer['id']}",
                "clientUserId": f"{customer['id']}-learner-0001",
            },
        )

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
