---
name: Clickable actions
job: authoring
sentence: Blocks in the workshop instructions that run a command, open or edit a file, or switch a dashboard tab when clicked.
docs: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#extensible-clickable-actions
visual:
  src: ./clickable-actions/actions.webp
  alt: Clickable actions in the instructions, checked off as they ran, beside the terminals where the last one ran a command in both at once.
flagship: true
order: 2
homepage: 1
page:
  headline: Steps that run when you click them
  what: A clickable action is a block in the workshop instructions that does the step when clicked. It runs a command in the right terminal, opens or changes a file in the editor, switches a dashboard tab, downloads a file or runs a check. Nobody mistypes a command or edits the wrong line, so the people taking the workshop spend their time on what it teaches, not on typing.
  loop:
    alt: A command in the instructions is clicked, and it runs in the terminal beside them.
    video: ./clickable-actions/run.mp4
    poster: ./clickable-actions/run-poster.webp
  things:
    - title: Run commands in the right terminal
      text: Run a command in the first terminal, another one, or all of them, clearing the terminal first if you like. Interrupt a command that never returns, or send input, such as a password, to one that is waiting for it.
      visual:
        src: ./clickable-actions/terminals.webp
        alt: "Two commands from the instructions, one in each terminal: the application applied in the first, and its pods watched as they start in the second."
    - title: Open and change files in the editor
      text: Open a file at a line, select text by an exact match or a regular expression and replace it, insert lines, or create a file. YAML files change by path, such as spec.replicas, and a click can run a VS Code command.
      visual:
        src: ./clickable-actions/editor.webp
        alt: The editor, opened at the deployment by one action, with the image tag a second action selected by a regular expression, and actions below to replace it, set a YAML value and create a file.
    - title: Drive the dashboard
      text: Open a URL in a new browser tab, bring a dashboard tab to the front, or create, reload and delete tabs, for example one showing the application the step just deployed.
      visual:
        src: ./clickable-actions/dashboard.webp
        alt: A dashboard tab that an action in the instructions created, showing the application the step deployed.
    - title: Copy, download and upload files
      text: Copy text to the clipboard, download a file from the Session, such as its kubeconfig, or upload a file into it.
      visual:
        src: ./clickable-actions/files.webp
        alt: Actions that copied the application's address, downloaded the Session's kubeconfig and uploaded a reading list, which the terminal lists in the uploads directory.
    - title: Pace the page
      text: Hide optional steps or questions in sections that open with a click, start an action as soon as the page loads, and have each action trigger the next one when it succeeds.
      visual:
        src: ./clickable-actions/pace.webp
        alt: An action that ran as the page opened, a section that ran its two commands one after the other when it was opened, and a question and an optional step still folded away.
  limits:
    - title: Editor and file actions need those Features on
      text: Editor actions work only when the workshop turns on the editor, which is off by default. Download and upload actions need downloads or uploads turned on in the same way.
      docs: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#enabling-the-integrated-editor
    - title: A cooldown, not a lock
      text: After a click, the same action is blocked for 3 seconds, to stop double clicks. You can make that longer, or block a second click for good, but reloading the page resets it. It keeps a step from running twice by accident; it does not stop anyone set on running it again.
      docs: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#overriding-action-cooldown-period
    - title: Built-in tabs stay put
      text: Dashboard actions cannot delete the built-in tabs, such as the terminals, console, editor and slides, and cannot point a tab that holds a terminal at a new URL.
      docs: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-dashboard
    - title: Action events are yours to collect
      text: An action can send an event to the training portal's analytics webhook when it is clicked. Nothing collects those events for you; the service that receives and stores them is yours to build.
      docs: https://docs.educates.dev/en/stable/custom-resources/training-portal.html#collecting-analytics-on-workshops
  hubWorkshops:
    - lab-workshop-session
    - lab-integrated-editor
  reading:
    - kind: Docs
      title: Extensible clickable actions
      href: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#extensible-clickable-actions
    - kind: Docs
      title: Clickable actions for the editor
      href: https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#clickable-actions-for-the-editor
    - kind: Blog post
      title: Clickable actions in workshops
      href: /blog/clickable-actions-in-workshops
    - kind: Guide
      title: Startup and Interactivity
      href: /getting-started-guides/authoring/startup-interactivity
---

A clickable action is a fenced code block in a page of the workshop
instructions. The fence names the action, and the block's body is YAML. This
one clears the first terminal and runs a command in it:

````markdown
```terminal:execute
command: echo "Execute command."
clear: true
```
````

Actions for the editor need the editor, which is off until the workshop
definition turns it on:

```yaml title="resources/workshop.yaml"
spec:
  session:
    applications:
      editor:
        enabled: true
```

Then one block finds text in a file and replaces it, with nothing for anyone
to select and paste wrong:

````markdown
```editor:replace-matching-text
file: ~/exercises/sample.txt
match: "nginx:1.19"
replacement: "nginx:1.21"
```
````

Any action written in YAML can also start on its own when the page loads
(`autostart`), trigger the next action when it succeeds (`cascade`), stay out
of sight (`hidden`) and send an analytics event when clicked (`event`). The
[workshop instructions docs](https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html#extensible-clickable-actions)
list every action and its fields.
