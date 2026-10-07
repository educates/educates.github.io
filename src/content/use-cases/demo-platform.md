---
name: Build your own Demo Platform
promise: Give your field team one-click Demos, each in its own fresh environment.
icon: presentation
order: 2
page:
  headline: Any Presenter launches a ready, isolated Demo for any customer in one click
  reader: For the Sponsor funding Demos for a field team, with a technical section for the Builder who builds the platform.
  lede: Educates is the core of a Demo Platform, not the whole of it. It creates each Session ahead of time, isolates it, sends it to a cluster with room and deletes it when it is done. Inside your company, the training portal's own catalog can be enough; a public-facing Demo Platform adds its own front end and integrations on top.
  lead: get-help-building
  problems:
    - title: The shared demo is broken again
      text: Everyone uses the same demo environment, so it is only as good as the last person left it. Ten minutes before a call, someone's leftover changes break the step you need.
    - title: Preparation goes into rebuilding
      text: Presenters spend the hour before a call resetting the demo instead of preparing for the customer, and how to reset it lives in one person's head.
    - title: Every Presenter shows a different Demo
      text: Each Presenter keeps their own copy, on their own laptop or cloud account, so what a customer sees depends on who shows it and when they last updated it.
  capabilities:
    - title: One click, one fresh Session
      text: Your front end asks for a Session with one REST call and sends the Presenter to the URL that comes back. Sessions created ahead of time mean the Demo is already running, and expiry deletes it when its time is up.
      features: [portal-rest-api, ready-sessions]
    - title: Many clusters behind one API
      text: The lookup service puts one REST API in front of training portals on one or more clusters, and sends each request to the portal with the most room. Tenants decide which clusters and portals each client reaches, and you add capacity by adding a cluster.
      features: [lookup-service]
    - title: Each Demo set up for its customer
      text: Pass parameters with each request, such as the customer's name or credentials for another system, and the Session is set up with them. Show the Session inside your own HTTPS site, give each portal its own title, logo and theme, and pass a webhook with each request to follow that Demo as it runs.
      features: [portal-rest-api, embedding, portal-branding, workshop-analytics]
    - title: Real environments, up to cluster admin
      text: A Demo can have its own Kubernetes namespace with quotas and RBAC, its own virtual cluster with cluster admin, or a virtual machine, so it can install operators and run the product the way a customer would.
      features: [isolated-sessions]
  bring:
    - title: The front end
      text: Educates gives you the API, not your field team's app. The catalog Presenters browse, how they sign in, and which Demo goes with which customer live in a front end you build on the REST API.
      docs: https://docs.educates.dev/en/stable/lookup-service/portal-integration.html
      example:
        title: An Apache 2.0 front end to start from
        href: https://github.com/jorgemoralespou/educates-oauth-simple-frontend
    - title: Sign-in through your identity provider
      text: The training portal knows its own accounts and anonymous users, nothing else. Single sign-on comes from your front end, which calls the REST API with its own credentials and passes its own user IDs.
      docs: https://docs.educates.dev/en/stable/portal-rest-api/client-authentication.html
      example:
        title: An Apache 2.0 front end with OAuth sign-in to start from
        href: https://github.com/jorgemoralespou/educates-oauth-simple-frontend
    - title: CRM links and reporting
      text: Educates does not connect to Salesforce or HubSpot, and nothing stores its webhook events for you. Tying a Demo to an opportunity, and reporting on who showed what to whom, is yours to build.
      docs: https://docs.educates.dev/en/stable/project-details/platform-comparison.html#where-educates-fits
    - title: Branding per portal, under your domain
      text: Title, logo, theme and hostname belong to a training portal; lookup service tenants have no branding of their own, so a branded experience per customer means a portal per customer. A portal's hostname must share a parent domain with the cluster's ingress domain.
      docs: https://docs.educates.dev/en/stable/custom-resources/training-portal.html#overriding-the-portal-hostname
    - title: KubeVirt for virtual machines
      text: Educates does not install KubeVirt. A Demo with a virtual machine needs KubeVirt running in the cluster first.
      docs: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#creation-of-session-resources
    - title: HTTPS for embedding
      text: A site that shows Sessions in an iframe must use HTTPS, and to work in every popular browser it may need to share a parent domain with the portal, so the two can share cookies.
      docs: https://docs.educates.dev/en/stable/custom-resources/training-portal.html#allowing-the-portal-in-an-iframe
  proof:
    content:
      - kind: On this page
        title: The reference architecture
        href: "#how-it-works"
      - kind: Blog post
        title: Terraform deployment quickstart
        href: /blog/terraform-quickstart
      - kind: Docs
        title: The lookup service
        href: https://docs.educates.dev/en/stable/lookup-service/service-overview.html
      - kind: Docs
        title: Portal integration, for a custom front end
        href: https://docs.educates.dev/en/stable/lookup-service/portal-integration.html
      - kind: Example
        title: Graham Dumpleton's labs, with GitHub sign-in and time windows
        href: https://grahamdumpleton.me/labs/
      - kind: Example
        title: A Next.js front end with OAuth sign-in, on the lookup service
        href: https://github.com/jorgemoralespou/educates-oauth-simple-frontend
    hubWorkshops:
      - lab-lookup-installation
      - lab-lookup-configuration
      - lab-lookup-consumption
---

The reference architecture has four parts: your front end, the lookup
service, training portals on one or more clusters, and the Session each
Presenter gets.

```mermaid
flowchart LR
  presenter(["Presenter"]) -->|picks a Demo| frontend["Your front end<br/>catalog, sign-in, customers"]
  frontend -->|requests a Session| lookup["Lookup service"]
  lookup -->|portal with the most room| portalA["Training portal<br/>on cluster A"]
  lookup -.-> portalB["Training portal<br/>on cluster B"]
  portalA --> session["Session<br/>created ahead of time"]
  session -.->|activation URL| presenter
  session -.->|events| webhook["Your webhook"]
```

1. **Your front end** lists the Demos a Presenter may run, signs them in your
   way, and knows which customer each Demo is for. It authenticates to the
   lookup service as a client with access to a tenant.
2. **The lookup service** takes each request, with the workshop, the
   Presenter's user ID, any parameters for the customer and a webhook URL,
   and sends it to the training portal with the most room among the tenant's
   clusters and portals.
3. **The training portals** run on one or more clusters, each with its own
   capacity, branding and Sessions created ahead of time.
4. **The Session** comes back as an activation URL, which the Presenter's
   browser must open within 60 seconds, in a new tab or in an iframe of your
   front end. Asking again with the same user ID returns the Session the
   Presenter already has.

The
[lookup service docs](https://docs.educates.dev/en/stable/lookup-service/service-overview.html)
cover clusters, tenants, clients and the
[request for a Session](https://docs.educates.dev/en/stable/lookup-service/workshops-api.html#requesting-a-workshop-session),
and
[Portal integration](https://docs.educates.dev/en/stable/lookup-service/portal-integration.html)
covers new tabs, iframes and sending the Presenter back when a Session ends.
