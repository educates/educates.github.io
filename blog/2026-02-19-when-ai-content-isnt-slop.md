---
title: "When AI content isn't slop"
slug: when-ai-content-isnt-slop
description: "The backlash against AI slop is justified, but risks dismissing purposeful content along with the noise."
authors: [graham]
tags: ["ai", "educates"]
---

In a [post on my personal site](https://grahamdumpleton.me/posts/2026/02/developer-advocacy-in-2026/) I talked about the forces reshaping developer advocacy. One theme that kept coming up was content saturation. AI has made it trivially easy to produce content, and the result is a flood of generic, shallow material that exists to fill space rather than help anyone. People have started calling this "AI slop," and the term captures something real. Recycled tutorials, SEO-bait blog posts, content that says nothing you couldn't get by asking a chatbot directly. There's a lot of it, and it's getting worse.

The backlash against AI slop is entirely justified. But I've been wondering whether it has started to go too far.

<!-- truncate -->

## The backlash is justified

To be clear, the problem is real. You can see it every time you search for something technical. The same generic "getting started" guide, rewritten by dozens of different sites (or quite possibly the same AI), each adding nothing original. Shallow tutorials that walk through the basics without any insight from someone who has actually used the technology in practice. Content that was clearly produced to fill a content calendar rather than to answer a question anyone was actually asking.

Developers have become good at spotting this. Most can tell within a few seconds whether something was written by a person with genuine experience or generated to tick a box. That's a healthy instinct. The bar for content worth reading has gone up, and honestly, that's probably a good thing. There was plenty of low-effort content being produced by humans long before AI entered the picture.

But healthy skepticism can tip over into reflexive dismissal. "AI-generated" has become a label that gets applied broadly, and once it sticks, people stop evaluating the content on its merits. The assumption becomes that if AI was involved, the content can't be worth reading. That misses some important distinctions.

## Not all AI content serves the same purpose

There are two very different ways to use AI for content. One is to mass-produce generic articles to flood search results or pad out a blog. The goal is volume, not value. Nobody designed the output with a particular audience in mind or thought carefully about what the content needed to achieve. That's slop, and the label fits.

The other is to use AI as a tool within a system you've designed, where the output has a specific structure, a specific audience, and a specific purpose. The human provides the intent and the domain knowledge. The AI helps execute within those constraints.

The problem with AI slop is not that AI generated it. The problem is that nobody designed it with care or purpose. There was no thought behind the structure, no domain expertise informing the content, no consideration for who would read it or what they'd take away from it. If you bring all of those things to the table, the output is a different thing entirely.

## Workshop instructions aren't blog posts

I've been thinking about this because of this project. [Educates](https://github.com/educates/educates-training-platform/) is an interactive training platform. It's designed for hands-on technical workshops where people learn by doing, not just by reading.

Anyone who has run a traditional workshop knows the problem. You give people a set of instructions, and half of them get stuck before they've finished the first exercise. Not because the concepts are hard, but because the mechanics are. They're copying long commands from a document, mistyping a path, missing a flag, getting an error that has nothing to do with what they're supposed to be learning. The experience becomes laborious. People switch off. They stop engaging with the material and start just trying to get through it.

Educates takes a different approach. Workshop instructions are displayed alongside live terminals and an embedded code editor. The instructions include things that learners can click on that perform actions for them. Click to run a command in the terminal. Click to open a file in the editor. Click to apply a code change. Click to run a test. The aim is to make the experience as frictionless as possible so that learners stay engaged throughout.

This creates a rhythm. You see code in context. You read an explanation of what it does and what needs to change. You click to apply the change. You click to run it and observe the result. At every step, learners are actively progressing through a guided flow rather than passively reading a wall of text. Their attention stays on the concepts being taught, not on the mechanics of following instructions. People learn more effectively because nothing about the process gives them a reason to disengage.

## Where AI fits into this

Writing good workshop content by hand is hard. Not just because of the volume of writing, but because maintaining that engaging, well-paced flow across a full workshop takes sustained focus. It's one thing to write a good explanation for one section. It's another to keep that quality consistent across dozens of sections covering an entire topic. Humans get tired. Explanations become terse halfway through. Steps that should guide the learner smoothly start to feel rushed or incomplete. The very quality that makes workshops effective, keeping learners engaged from start to finish, is the hardest thing to sustain when you're writing it all by hand.

This is where AI, with the right guidance and steering, can actually do well. When you provide the content conventions for the platform, the structure of the workshop, and clear direction about the learning flow you want, AI can generate content that maintains consistent quality and pacing throughout. It doesn't get fatigued halfway through and start cutting corners on explanations. It follows the same pattern of explaining, showing, applying, and observing as carefully in section twenty as it did in section one.

That said, this only works because the content has a defined structure, a specific format, and a clear purpose. The human still provides the design and the domain expertise. The AI operates within those constraints. With review and iteration, the result can actually be superior to what most people would produce by hand for this kind of structured content. Not because AI is inherently better at explaining things, but because maintaining that engaging flow consistently across a full workshop is something humans genuinely struggle with.

## Slop is a design problem, not a tool problem

The backlash against AI slop is well-founded. Content generated without intent, without structure, and without domain expertise behind it deserves to be dismissed. But the line should be drawn at intent and design, not at whether AI was involved in the process. Content that was designed with a clear purpose, structured for a specific use case, and reviewed by someone who understands the domain is not slop, regardless of how it was produced. Content that was generated to fill space with no particular audience in mind is slop, regardless of whether a human wrote it.

I plan to write more about what makes the interactive workshop format effective and how it changes the way people learn. For now, the point is simpler. Before dismissing AI-generated content out of hand, it's worth asking what it was designed to do and whether it does that well.

And yes, this post was itself written with the help of AI, guided by the kind of intent, experience, and hands-on steering I've been talking about. The same approach I'm applying to generating workshop content. If the argument holds, it should hold here too.
