---
title: 2. Install
order: 2
---

# Step 2: Install them in your project

In your Express project, install all five files **in one command**. The easiest way is the line `pack:local` printed at the end of step 1. It looks like this:

```bash
npm install ~/backray-packs/backray-utils-0.1.0.tgz ~/backray-packs/backray-app-0.1.0.tgz ~/backray-packs/backray-server-0.1.0.tgz ~/backray-packs/backray-express-0.1.0.tgz ~/backray-packs/backray-adapters-mongoose-0.1.0.tgz
```

npm adds them to your `package.json` as `file:` dependencies, so a teammate who runs `npm install` gets them too, as long as the files are at the same path on their machine.

## Why one command

The packages depend on each other. When you install them together, npm uses the files you gave it. Installing `backray-express` on its own makes npm look for `@backray/server` on the public npm registry, where it doesn't exist, and the install fails with `npm error 404`. Installing the files one at a time in the order above also works.

## What gets installed

- The five Backray packages, about 25 MB with everything they need.
- `express` and `mongoose` stay yours. Backray uses the versions already in your project. It works with Express 4 and 5, and Mongoose 6 to 9.
- No React or front-end tooling: the dashboard comes already built.

Next: [Add the dashboard](3-add-the-dashboard.md).
