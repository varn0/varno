---
title: The include keyword in GitLab pipelines and how it helped me
date: 2021-03-26
description: How I used GitLab's include keyword to centralize CI/CD templates across multiple projects — a simple solution to managing pipelines at scale.
tags: [gitlab, ci-cd, devops]
source: medium
---

When I started as a DevOps Engineer, one of my first challenges was figuring out how to configure the CI/CD pipeline for many projects at the same time, when each of those projects had a different remote repository.

## The Solution: The `include` Keyword

According to the GitLab documentation, the `include` keyword allows you to include external YAML files in your CI/CD configuration. This means you can break down one long `.gitlab-ci.yml` file into multiple files to increase readability, or reduce duplication of the same configuration in multiple places.

The idea is simple: have a centralized git repository devoted to DevOps, where you keep template files. When you need to update a pipeline configuration, you only change the template files and push to the DevOps repository. Every project that includes those templates gets the update automatically.

## Example Structure

```
devops/
  foo_project/
    foo-cicd-config.yml
  bar_project/
    bar-cicd-config.yml
  wordpress/
    template-cicd.yml
```

Then in each project's `.gitlab-ci.yml`:

```yaml
include:
    project: devops
    file: foo_project/foo-cicd-config.yml
```

## Sharing Templates with Variables

Multiple WordPress projects can share one template with project-specific variables:

```yaml
variables:
    PROJECT: <project_name>
include:
    project: devops
    file: wordpress/template-cicd-config.yml
```

## Nested Includes

You can also nest includes — an included file can itself include other files:

```yaml
stages:
  - deploy
  - performance
  - dast

deploy_code:
  stage: deploy
  script:
    - scp -r ./ $TEST_VPS:/var/www/$PROJECT

include:
   - project: 'devops/templates'
     file: 'templates/test-performance.yml'
   - project: 'devops/templates'
     file: 'templates/vulnerability-scan.yml'
```

## Conclusion

The `include` keyword significantly streamlines DevOps workflows, particularly for teams managing multiple projects. It promotes consistency, reduces maintenance overhead, and saves considerable time when updates are needed across numerous pipelines.
