---
name: Hands-on events
promise: Every Attendee in a working environment before you start talking, and nothing to clean up after.
icon: calendar
order: 1
page:
  headline: Every Attendee in a working environment within seconds of sitting down
  reader: For DevRel leads and event organizers planning a conference or customer workshop, and the Presenters who run the room.
  lede: Each Attendee opens one URL, enters the event's access code and starts a Session of their own, created before they arrived. When the event ends, you delete the training portal and every Session goes with it.
  problems:
    - title: Setup eats the first half hour
      text: Half the room is still installing tools when you want to start, and the other half is helping them. The workshop you planned for ninety minutes gets sixty.
    - title: Every laptop is different
      text: Other versions, a corporate proxy, no admin rights. The step that worked in rehearsal breaks on row six, and you debug someone's machine while the room waits.
    - title: Someone has to clean up
      text: After the event, the clusters, accounts and cloud resources people created keep running, and keep costing, until someone finds and deletes them.
  capabilities:
    - title: Sessions ready before the room fills
      text: Create Sessions ahead of time for most of the room, and keep a few in reserve so late arrivals start at once too. The docs' own example creates 75 up front for an event capped at 100, then keeps 5 ready as people trickle in.
      features: [ready-sessions]
    - title: One URL and one code for the room
      text: Put the portal's URL and an event access code on your first slide. With anonymous access nobody registers an account, and a cap of one Session at a time per Attendee keeps anyone from starting a second.
      features: [training-portal]
    - title: The whole workshop on one page
      text: Each Attendee works in a Session of their own, with the instructions beside terminals, a VS Code based editor, the Kubernetes console and your slides, all in the browser. Steps can run with a click, and checks can tell each Attendee a step worked before the next one builds on it. With nothing to install, the first step is the workshop's first step.
      features: [workshop-dashboard, isolated-sessions, clickable-actions, examiner-checks]
    - title: Booths and laptops too
      text: At a booth, run a portal of short workshops; visitors pick a topic, work through it, and their Session is deleted when they finish. With no cluster at all, a single workshop runs in one container on your laptop's Docker, for a demo across the table that needs no Kubernetes.
      features: [training-portal, local-authoring]
  bring:
    - title: The cluster, and someone to run it
      text: Educates runs on a Kubernetes cluster you provide; it is not a hosted service. The docs give no sizing per Attendee and suggest starting with three worker nodes of 16 to 32 GB each, so size it for your workshop and do a full-size dry run. For a small one-off event, running a cluster can be more work than it saves.
      docs: https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html#size-of-the-kubernetes-cluster
    - title: No live view of the room
      text: There is no trainer view of how far each Attendee has got. You find out who is stuck the way you always have, by walking the room or asking.
    - title: No video or chat
      text: Educates does not include video or virtual classroom features. For an online event, run it beside the meeting tool you already use.
      docs: https://docs.educates.dev/en/stable/project-details/platform-comparison.html#where-educates-fits
    - title: Attendance is yours to record
      text: The portal can post events to your webhook as Sessions start, pages are viewed and Sessions finish, or send them to Google Analytics, which ad blockers and firewalls can stop. Nothing stores the webhook's events for you, and with anonymous access the portal never asks for a name, so you count Sessions, not people.
      docs: https://docs.educates.dev/en/stable/custom-resources/training-portal.html#collecting-analytics-on-workshops
  proof:
    facts:
      - figure: 5,000+
        text: Workshop executions on Educates at the Spring One conference in September 2020.
        source:
          label: The history of Educates
          href: /about-educates/history
    content:
      - kind: Blog post
        title: Installing Educates on a cloud provider (Part 1)
        href: /blog/install-educates-cloud-cli
      - kind: Blog post
        title: Installing Educates on a cloud provider (Part 2 - Verification)
        href: /blog/verify-educates-cloud-install
      - kind: Guide
        title: What you just installed
        href: /getting-started-guides/about
      - kind: Docs
        title: The TrainingPortal reference
        href: https://docs.educates.dev/en/stable/custom-resources/training-portal.html
    hubWorkshops:
      - lab-kubernetes-fundamentals
      - lab-workshop-session
      - lab-slide-presentations
---

Four steps take you from nothing to a room full of Sessions, and back to
nothing.

1. **A cluster for the event.** Create a Kubernetes cluster and install
   Educates on it with the `educates` CLI. The
   [cluster requirements](https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html)
   cover sizing, the ingress controller, wildcard DNS and TLS.
2. **A training portal.** Create a `TrainingPortal` for your workshop with an
   event access code, anonymous access, one Session at a time per Attendee
   and Sessions created up front, like the one below.
3. **One URL for the room.** Put the portal's URL and the access code on your
   first slide. Attendees open it, enter the code and start the workshop.
4. **Teardown after.** When the event ends, delete the training portal, and
   its Sessions are deleted with it. Delete the cluster too if you made it for
   the event.

This portal runs the Kubernetes Fundamentals workshop from the Hub for up to
100 Attendees, with 75 Sessions created before the doors open:

```yaml title="training-portal.yaml"
apiVersion: training.educates.dev/v1beta1
kind: TrainingPortal
metadata:
  name: hands-on-event
spec:
  portal:
    password: <event access code>
    registration:
      type: anonymous
    sessions:
      maximum: 100
      anonymous: 1
  workshops:
    - name: lab-k8s-fundamentals
      initial: 75
      reserved: 5
```

Leave `orphaned` unset at an event like this, so a Session survives a coffee
break with the laptop asleep. The
[TrainingPortal reference](https://docs.educates.dev/en/stable/custom-resources/training-portal.html#expiring-of-workshop-sessions)
explains expiry, extensions and the other settings.
