---
name: AI authoring skills
job: authoring
sentence: Agent skills that create a workshop when you ask, with its configuration and instruction pages, and plan courses of several workshops.
docs: https://github.com/educates/educates-workshop-authoring-skill
flagship: true
order: 22
homepage: 4
page:
  headline: Plan a course and draft its workshops with an AI agent
  what: Two agent skills give an AI coding agent what it needs to know about Educates. The workshop authoring skill creates a workshop when you ask for one, with its directory, its workshop.yaml and its instruction pages. The course design skill plans a course first, from a single workshop to one in several parts, and writes a blueprint for each workshop that the authoring skill then builds. Both are developed and tested with Claude.
  loop:
    alt: A request for a workshop is typed into Claude Code, and the skill creates the workshop's directory, workshop.yaml and instruction pages.
  things:
    - title: Create a workshop by asking for one
      text: Ask Claude for an Educates workshop on a topic, or invoke /educates-workshop-authoring, and the skill creates the project, with the directory layout Educates expects, a workshop.yaml with the session applications the workshop needs, and instruction pages that follow Educates conventions.
    - title: Plan a course before you write it
      text: The course design skill organizes topics into workshops, for anything from a single workshop idea to a course in several parts, and marks each workshop as spine or elective. For a small course it keeps its steps short.
    - title: A blueprint for each workshop
      text: For each workshop, the course design skill writes a detailed plan. The workshop authoring skill then builds the workshop from it, with its configuration, instruction pages and exercise files.
    - title: Pick up a course you already have
      text: Point the course design skill at an existing course, and it audits the workshops and bootstraps the planning documents. It tracks the work left across workshops, suggests what to do next by priority, and guides how the course grows.
  limits:
    - title: You review what it writes
      text: Generated workshops can need work. The README asks for issues about exactly that, wrong or weak configuration, Educates features the skill does not know, and instructions that miss Educates conventions. Run every workshop before anyone else takes it.
      docs: https://github.com/educates/educates-workshop-authoring-skill#feedback
    - title: Aligned with Educates 3.7.0
      text: The workshop authoring skill is aligned with Educates 3.7.0, and the workshops it creates may not work on an older release.
      docs: https://github.com/educates/educates-workshop-authoring-skill#compatibility
    - title: Built for Claude
      text: Both skills are developed and tested with Claude. Other agents that support the skills format may run them, but the READMEs warn that results vary with how much the agent already knows about Educates.
      docs: https://github.com/educates/educates-workshop-authoring-skill#other-ai-agents
    - title: Versioned apart from Educates
      text: The skills live in their own repositories, with their own releases, outside the Educates releases. Install a .skill file from a tagged release when you want the same skill every time.
      docs: https://github.com/educates/educates-workshop-authoring-skill#from-github-release
  repositories:
    - name: educates/educates-workshop-authoring-skill
      text: Creates and configures a workshop, with its directory, workshop.yaml and instruction pages.
    - name: educates/educates-course-design-skill
      text: Plans a course and its workshops, with a blueprint for each one.
  reading:
    - kind: Blog post
      title: Teaching an AI about Educates
      href: /blog/teaching-an-ai-about-educates
    - kind: Blog post
      title: When AI content isn't slop
      href: /blog/when-ai-content-isnt-slop
    - kind: Blog post
      title: Deploying Educates yourself
      href: /blog/deploying-educates-yourself
    - kind: Blog post
      title: Reviewing workshops with AI
      href: /blog/reviewing-workshops-with-ai
---

Add each skill to your agent from its repository:

```shell
npx skills add https://github.com/educates/educates-workshop-authoring-skill
npx skills add https://github.com/educates/educates-course-design-skill
```

To pin a version instead, download the `.skill` file from a tagged release and
install it with the Claude Code CLI, here version 3.0 of the workshop authoring
skill:

```shell
curl -fLO https://github.com/educates/educates-workshop-authoring-skill/releases/download/3.0/educates-workshop-authoring.skill
claude skill install educates-workshop-authoring.skill
```

Then ask Claude for an Educates workshop or course, and it picks the skill
from what you ask, or invoke a skill by name:

```text
/educates-course-design
/educates-workshop-authoring
```

Plan the course with the first, then build each workshop from its blueprint
with the second. What they write is a workshop's files: run it on a local
Educates, as [local authoring](/features/local-authoring) shows, before anyone
else takes it.
