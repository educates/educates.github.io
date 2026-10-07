---
name: Examiner checks
job: authoring
sentence: A check script run from the instructions shows pass or fail, so the work at each step is checked with instant feedback.
docs: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-examiner
flagship: true
order: 3
homepage: 2
page:
  headline: Check the learner's work, with instant feedback
  what: An examiner check is a clickable action that runs a test you write and shows whether it passed. Put one after a step, and the person taking the workshop knows at once whether the step worked, before the next step builds on it. It checks the work; it does not grade it.
  loop:
    alt: A check waits on the page while a pod starts in the terminal, then turns to passed once the pod is running.
  things:
    - title: Check a step with a click
      text: A check runs a program from the workshop's examiner tests directory, with the arguments you give it. An exit status of 0 passes and anything else fails, and the action on the page shows which.
    - title: Check without a click
      text: Start a check as soon as the page loads, and retry it until it passes, for as long as the page is open. The page notices the step is done without anyone asking.
    - title: Move on when it passes
      text: When a check passes, it can trigger the next action on the page, such as another check or a command, so a page can walk through a task one verified step at a time.
    - title: Ask for an answer
      text: A check can show a form, and the values entered reach the test as JSON. The docs suggest it for a quiz, or for collecting values that later steps use.
    - title: Check from outside the Session
      text: Give a check a URL, and a separate service runs it instead of the workshop container, out of reach of the person whose work it checks.
  limits:
    - title: Pass or fail, and nothing kept
      text: A check shows pass or fail on the page, and that is all. Educates keeps no score and no record of results, and issues no certificate. If you need results, collecting them is yours to build, for example in the service a check can call.
    - title: Fifteen seconds by default
      text: A test that runs past its timeout, 15 seconds unless you set another, is killed and counts as a failure. The kill cannot be turned off, so a test should check and return, not wait.
      docs: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-examiner
    - title: Checks run where people can reach them
      text: By default a test runs in the workshop container, which the person taking the workshop controls. For checks they should not be able to tamper with, call a separate service instead, on a hostname under the same parent domain as Educates' ingress domain.
      docs: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-examiner
    - title: Forms are simple
      text: A check's form is drawn by jsonform, without file inputs or the parts of jsonform that need JavaScript. A check that asks for input should not start on its own when the page loads, or nobody gets the chance to answer.
      docs: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-examiner
  hubWorkshops:
    - lab-examiner-scripts
  reading:
    - kind: Docs
      title: Clickable actions for the examiner
      href: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-examiner
    - kind: Docs
      title: Enabling the test examiner
      href: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#enabling-the-test-examiner
    - kind: Docs
      title: Automatically triggering actions
      href: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#automatically-triggering-actions
    - kind: Guide
      title: Startup and Interactivity, Quizzing Users
      href: /getting-started-guides/authoring/startup-interactivity#quizzing-users
---

The examiner is off until the workshop definition turns it on:

```yaml title="resources/workshop.yaml"
spec:
  session:
    applications:
      examiner:
        enabled: true
```

A test is a program in the workshop's `workshop/examiner/tests` directory
that exits with 0 when the work is right. This one, from the docs, passes when
a pod with the name it is given is running:

```bash title="workshop/examiner/tests/test-that-pod-exists" frame="code"
#!/bin/bash

kubectl get pods --field-selector=status.phase=Running -o name | egrep -e "^pod/$1$"

if [ "$?" != "0" ]; then
    exit 1
fi

exit 0
```

In the instructions, an `examiner:execute-test` action runs the test. This one
starts when the page loads, and tries again every second until the pod is
running:

````markdown
```examiner:execute-test
name: test-that-pod-exists
title: Verify that pod named "one" exists
args:
- one
timeout: 5
retries: .INF
delay: 1
autostart: true
```
````

The
[examiner docs](https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-examiner)
cover forms, checks run by a separate service, and every other field.
