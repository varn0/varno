---
title: Start with a Modulith, you will thank me later
date: 2025-10-10
description: I've seen teams bypass the Modular Monolith and jump straight into Microservices, driven by hype. The choice of architecture must be based on scale and team size, not trends.
tags: [architecture, modulith, microservices]
source: medium
---

In my experience across several development teams, I've seen a common and often costly mistake: bypassing the Modulith (Modular Monolith) and jumping straight into Microservices. This move is often driven by architectural hype, but it quickly introduces unnecessary overhead that suffocates small teams.

The choice of architecture must be based on scale and team size, not trends.

**Monolith:** Ideal for 1-3 person teams focused purely on rapid MVP delivery and time-to-market.

**Modulith:** The perfect architecture for 3-4+ core team members seeking sustainable growth and maintainability.

**Microservices:** Reserved for organizations with multiple autonomous teams and extreme demands for scale and resilience.

## Why the Modulith is the Smart Investment

The Modulith is not just a Monolith with better folders; it's an evolutionary architecture that preserves developer velocity while strategically preparing for future scaling.

### 1. Discipline Over Distribution

The biggest threat to any large codebase is coupling. For a Modulith to succeed, the number one rule is enforcing separation of concerns and preventing tight coupling between modules. This intentional isolation is what keeps the code clean and highly maintainable.

### 2. Maximum Velocity, Minimal Overhead

You get the best of both worlds:

- **Simple Operations:** You retain a single deployment unit and a simple single-database strategy for the core application, eliminating the massive operational burden (DevOps, orchestration, distributed tracing, network latency) inherent in Microservices.
- **Team Focus:** Your small core team remains highly productive, maintaining the Modulith for a long period.

### 3. The Strategic Scaling Bridge

The Modulith allows you to scale exactly where you need to. When a high-load feature absolutely demands independent scaling:

- You extract that single module into a new Microservice.
- This new service gets its own independent database (of whatever technology it requires).
- A new, separate team (even a single person initially) can be assigned to it, allowing the core team to stay focused on the main application.

This measured approach ensures you only adopt the complexity of a distributed system when and where the business genuinely demands it, not a moment sooner. Don't let the fear of the Monolith push you into premature Microservice complexity.

## What's your take?

Challenge me on the Modulith. What is the exact price of the "discipline" required to maintain modular boundaries over two to three years? Are there other hidden costs?
