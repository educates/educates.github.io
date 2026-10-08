---
name: Customer and partner enablement
promise: Let customers and partners learn your product by using it, under your brand.
icon: people
order: 3
page:
  headline: Customers and partners learn your product hands-on, under your brand
  reader: For enablement and DevRel leads who train the engineers at their customers and partners.
  lede: Give each audience a training portal with your title, logo and theme, and each person in it a Session of their own to use the product in. Run it at your events, or leave it open as an academy people come back to whenever they need it.
  problems:
    - title: Trials lose people before their first success
      text: A trial starts with a setup guide, a cluster to create and credentials to sort out. Many people give up before they reach the part of the product you wanted them to see.
    - title: One portal for every audience
      text: Partners need the advanced material, a customer needs the workshops for what they bought, and the public needs the introduction. One portal means one catalog and one set of limits for all of them, so someone always sees too much or too little.
    - title: Training drifts from the product
      text: The product ships every few weeks and the training was written two releases ago. Commands, versions and screenshots stop matching, and nobody notices until an engineer at a partner gets stuck.
  capabilities:
    - title: A portal for each audience
      text: Give partners, a key customer and the public a training portal each, with its own title, logo, theme and hostname, its own event access code, and its own cap on how many Sessions run at once.
      features: [portal-branding, training-portal]
    - title: An academy that runs itself
      text: Make a portal's catalog public so people can browse before they log in. Sessions expire after a set time or soon after the browser tab is closed, and workshop environments are replaced on a schedule, so a portal sized for a few dozen Sessions at once serves many more people over time.
      features: [training-portal, ready-sessions]
    - title: Inside your own website
      text: Keep the catalog on your own site, which asks the portal's REST API for a Session and shows it in an iframe on your HTTPS pages. With the lookup service in front of several portals and clusters, one API serves them all, with a tenant for each customer.
      features: [portal-rest-api, embedding, lookup-service]
    - title: Workshops that keep up with the product
      text: Workshops are Markdown in Git, reviewed and versioned like the product they teach, and published as an OCI image for each version. One workshop can hold several pathways through its pages, and each portal picks the one its audience follows. To see what gets used, record usage in Google Analytics, Microsoft Clarity or Amplitude, or post events to a webhook of yours.
      features: [publishing-workshops, workshop-instructions, workshop-analytics]
  bring:
    - title: No LMS integration
      text: Educates does not connect to a learning management system; it has no SCORM, xAPI or LTI support. If your courses live in an LMS, link out to Educates from it, or build the bridge yourself on the REST API.
    - title: No courses across workshops
      text: A portal lists its workshops as a flat catalog. Pages follow an order inside one workshop, but nothing orders workshops into a course; a course of several workshops is something your own site arranges.
    - title: No progress records or certificates
      text: Nothing keeps a record of who finished what once a Session ends, and nothing scores work or issues certificates. Progress across workshops, and any certificate, come from a service you build on the portal's webhook events.
      docs: https://docs.educates.dev/en/stable/portal-rest-api/session-management.html#associating-sessions-with-a-user
    - title: Sign-in through your identity provider
      text: A portal has its own accounts, or anonymous access, and nothing else. For customers and partners to sign in with the accounts they already have with you, your front end handles sign-in and calls the REST API with its own credentials.
      docs: https://docs.educates.dev/en/stable/portal-rest-api/client-authentication.html
      example:
        title: An Apache 2.0 front end with OAuth sign-in, on the lookup service, to start from
        href: https://github.com/jorgemoralespou/educates-oauth-simple-frontend
    - title: CRM links and partner reporting
      text: Educates does not connect to Salesforce or HubSpot, and nothing collects its webhook events for you. Tying training to an account, and reporting to each partner on their engineers, is yours to build.
      docs: https://docs.educates.dev/en/stable/project-details/platform-comparison.html#where-educates-fits
  proof:
    facts:
      - figure: "3"
        text: "Public academies Broadcom runs on Educates: Spring Academy, Kube Academy and Tanzu Academy."
        source:
          label: The Educates adopters file
          href: https://github.com/educates/educates-training-platform/blob/develop/ADOPTERS.md
    content:
      - kind: Blog post
        title: Announcing Educates Hub
        href: /blog/announcing-educates-hub
      - kind: Docs
        title: The permanent learning portal, among the use case scenarios
        href: https://docs.educates.dev/en/stable/project-details/project-overview.html#use-case-scenarios
      - kind: Docs
        title: The portal REST API, for your own front end
        href: https://docs.educates.dev/en/stable/portal-rest-api/client-authentication.html
      - kind: Example
        title: Graham Dumpleton's labs, public courses on Educates with GitHub sign-in
        href: https://grahamdumpleton.me/labs/
      - kind: Example
        title: Viam Education, robotics courses on Educates
        href: https://learn.viam.com
      - kind: Example
        title: The NWS Playground, NETWAYS' workshops on demand
        href: https://playground.nws.netways.de/workshops/catalog/
    hubWorkshops:
      - lab-spring-boot-on-k8s
      - creating-a-spring-application
      - lab-workshop-session
---

There are two ways to put workshops in front of customers and partners, and
they work side by side.

1. **A portal per audience.** Each audience gets a `TrainingPortal` of its
   own, with its own branding, access code and limits, like the partner
   portal below. People register an account, or with anonymous access just
   enter the code.
2. **Your website as the front end.** Turn off the portal's own
   registration and let your site request Sessions through the
   [REST API](https://docs.educates.dev/en/stable/portal-rest-api/session-management.html#requesting-a-workshop-session),
   passing its own user IDs so a returning person gets their Session back,
   and an index URL so people land back on your site when they finish. Show
   the Session in a new tab, or in an iframe on your HTTPS pages. With many
   portals, or a cluster per customer, put the
   [lookup service](https://docs.educates.dev/en/stable/lookup-service/service-overview.html)
   in front of them.

This portal gives partners two workshops under your brand, at their own
hostname under the cluster's domain, for up to 40 people at once:

```yaml title="partner-portal.yaml"
apiVersion: training.educates.dev/v1beta1
kind: TrainingPortal
metadata:
  name: partner-academy
spec:
  portal:
    title: Partner Academy
    logo: data:image/png;base64,<your logo>
    theme:
      name: partner-theme
    ingress:
      hostname: partners
    password: <partner access code>
    sessions:
      maximum: 40
      registered: 1
  workshops:
    - name: product-fundamentals
      expires: 90m
      orphaned: 15m
    - name: product-advanced
      expires: 2h
      orphaned: 15m
```

The theme is one of the themes in your Educates configuration. For a public
academy, drop the access code, make the catalog public, switch to anonymous
access if people should not need an account, and add `refresh` so each
workshop environment is replaced on a schedule. The
[TrainingPortal reference](https://docs.educates.dev/en/stable/custom-resources/training-portal.html)
covers every setting.

A portal open to the public lets in people you do not know. The docs
strongly recommend a
[cluster used only for Educates](https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html#dedicated-kubernetes-cluster),
and say never to let untrusted users in without
[Kyverno enforcing its security policies](https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html#workshop-security-enforcement).
