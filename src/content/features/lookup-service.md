---
name: Lookup service
job: delivering
sentence: One REST API in front of many training portals and clusters, sending each request for a Session to where there is room.
docs: https://docs.educates.dev/en/stable/lookup-service/service-overview.html
visual:
  src: ./lookup-service/example-academy.webp
  alt: Example Academy, a training team's own site, listing workshops it gets from the lookup service, with a button to start each.
flagship: true
order: 17
homepage: 2
page:
  headline: Start Sessions from your own site, on one portal or many clusters
  covers: [portal-rest-api]
  what: Every training portal has a REST API, so a site of yours can list its workshops and start Sessions behind whatever sign-in you choose. The lookup service puts one API in front of many portals on one or more clusters. Your site asks it for a Session, it sends the request to a portal with room, and you add capacity by adding a cluster, not by growing the one you have.
  loop:
    alt: A custom site lists workshops from the lookup service, and a click on one opens a new Session in the browser.
    video: ./lookup-service/start-a-session.mp4
    poster: ./lookup-service/start-a-session-poster.webp
  things:
    - title: Your own front end on one portal
      text: Each training portal comes with a robot account for its REST API. Your site logs in with it, lists the portal's workshops, asks for a Session for the person signed in, and sends their browser to the URL that comes back. Turn off the portal's own registration, as the docs recommend, so people come in through your site.
      visual:
        src: ./lookup-service/robot-account.webp
        alt: A terminal logging in to a training portal's REST API with its robot account, and listing the portal's workshops.
    - title: People get their own Session back
      text: Pass your own ID for each person with every request. Someone who closes the tab and clicks again gets the Session they already have, not a second one. A portal's API also lists a person's Sessions, extends one close to expiring where the workshop allows it, and ends one early.
      visual:
        src: ./lookup-service/same-session.webp
        alt: Two requests for a Session for the same learner ID, answered with the same Session.
    - title: One API in front of many clusters
      text: Register clusters with the lookup service, the one it runs on or remote ones, and it watches the training portals on each. A request for a Session goes to the portal with the most room, so the same workshop on several clusters shares the load, and an admin client sees every cluster, portal and Session from one place.
      visual:
        src: ./lookup-service/clusters.webp
        alt: The lookup service's admin API listing the clusters it watches, and the training portals on them.
    - title: A tenant for each customer
      text: Tenants pick clusters and portals by name or by label, and each client of the API reaches only the tenants it is granted. One lookup service can keep customers apart, or production apart from staging.
      visual:
        src: ./lookup-service/tenants.webp
        alt: "The lookup service's configuration in the editor: tenants that pick clusters and portals by name or by label, and a client granted one of them."
    - title: Set up each Session as it starts
      text: With each request, pass the parameters the workshop declares, the person's name and email address, the page to send them back to when the Session ends, and a webhook to receive that Session's analytics events.
      visual:
        src: ./lookup-service/request.webp
        alt: A request to the lookup service for a learner's Session, with their name and email address, a workshop parameter, the page to return to and a webhook for its events, and the Session it got.
  limits:
    - title: Your site, your sign-in
      text: Neither API is a front end or a sign-in service. The catalog people browse, how they sign in, and the ID you pass for each person are yours to build.
      docs: https://docs.educates.dev/en/stable/portal-rest-api/client-authentication.html
    - title: Sixty seconds to open a Session
      text: The URL that comes back carries a token that lasts 60 seconds. If the browser does not reach it in time, the Session is deleted and your site asks for another, so send people straight there. On a portal's API, the request can set a different timeout.
      docs: https://docs.educates.dev/en/stable/lookup-service/workshops-api.html#requesting-a-workshop-session
    - title: Tokens expire, and not only on schedule
      text: A lookup service token lasts 72 hours today, and the docs say not to count on it. Restarting the lookup service or recreating a client ends tokens too, so your site logs in again whenever a call returns 401. A portal's token expires as well, and a site that runs for long refreshes it.
      docs: https://docs.educates.dev/en/stable/lookup-service/client-authentication.html#token-revocation
    - title: The lookup service is yours to set up
      text: It is an optional part of Educates, turned on when you install it. Before it serves a request it needs a cluster, a tenant and a client, each a resource in the educates-config namespace. For a remote cluster it needs a kubeconfig, which the docs advise should only read Educates resources, never be cluster-admin.
      docs: https://docs.educates.dev/en/stable/lookup-service/service-overview.html#enabling-the-lookup-service
    - title: Embedding takes work on both sides
      text: To show a Session in an iframe on your site, the training portal must allow your site to frame it, and when the Session ends the redirect happens inside the frame unless a page of yours breaks out of it. Opening the Session in a new tab avoids both.
      docs: https://docs.educates.dev/en/stable/lookup-service/portal-integration.html#embedding-in-an-iframe
  hubWorkshops:
    - lab-lookup-installation
    - lab-lookup-configuration
    - lab-lookup-consumption
  reading:
    - kind: Docs
      title: Lookup service overview
      href: https://docs.educates.dev/en/stable/lookup-service/service-overview.html
    - kind: Docs
      title: The lookup service's workshops REST API
      href: https://docs.educates.dev/en/stable/lookup-service/workshops-api.html
    - kind: Docs
      title: Portal integration
      href: https://docs.educates.dev/en/stable/lookup-service/portal-integration.html
    - kind: Docs
      title: Portal REST API client authentication
      href: https://docs.educates.dev/en/stable/portal-rest-api/client-authentication.html
    - kind: Docs
      title: Portal REST API session management
      href: https://docs.educates.dev/en/stable/portal-rest-api/session-management.html
---

### From one training portal

Every training portal has a robot account for its REST API, with its
credentials in the portal's status. Your site logs in with them for an access
token:

```shell
curl -v -X POST -d "grant_type=password&username=robot@educates&password=<robot-password>" -u "<robot-client-id>:<robot-client-secret>" https://lab-markdown-sample-ui.test/oauth2/token/
```

Then it asks for a Session of a workshop environment, with the page to send
the person back to when the Session ends:

```shell
curl -H "Authorization: Bearer <access-token>" https://lab-markdown-sample-ui.test/workshops/environment/<name>/request/?index_url=https://hub.test/
```

The response names the Session, gives an ID for the person, and holds the
`url` on the portal to send their browser to. Pass that ID as `user` on the
next request, and the person gets the Session of that workshop they already
have.

### From many, through the lookup service

The lookup service is off until the configuration you install Educates with
turns it on:

```yaml
lookupService:
  enabled: true
```

It then needs a cluster to watch, a tenant, and a client, as resources in the
`educates-config` namespace. Here the cluster is the one the lookup service
runs on, the tenant reaches one portal on it, and the client can request
Sessions through that tenant:

```yaml
apiVersion: lookup.educates.dev/v1beta1
kind: ClusterConfig
metadata:
  name: local-cluster
  namespace: educates-config
---
apiVersion: lookup.educates.dev/v1beta1
kind: TenantConfig
metadata:
  name: tenant-1
  namespace: educates-config
spec:
  clusters:
    nameSelector:
      matchNames:
        - local-cluster
  portals:
    nameSelector:
      matchNames:
        - portal-1
---
apiVersion: lookup.educates.dev/v1beta1
kind: ClientConfig
metadata:
  name: custom-portal
  namespace: educates-config
spec:
  client:
    password: my-secret
  roles:
    - tenant
  tenants:
    - tenant-1
```

Your site logs in as that client and asks for a Session, passing its own ID
for the person:

```shell
ACCESS_TOKEN=$(curl --silent -X POST \
  http://educates-api.<ingress-domain>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "custom-portal", "password": "my-secret"}' \
  | jq -r -e .access_token)

curl -X POST -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "tenant-1",
    "workshopName": "lab-k8s-fundamentals",
    "clientIndexUrl": "https://portal.example.com/",
    "clientUserId": "user-12345"
  }' \
  http://educates-api.<ingress-domain>/api/v1/workshops
```

The response's `sessionActivationUrl` is where the person's browser goes. The
[lookup service docs](https://docs.educates.dev/en/stable/lookup-service/service-overview.html)
cover remote clusters, tenants chosen by label, and the admin API.
