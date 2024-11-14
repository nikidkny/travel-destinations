# Travel Destinations Mandatory

## First time setup:

```bash
git clone https://github.com/Roman-Octavian/travel-destinations
```

```bash
cd travel-destinations
```

```bash
npm i
```

## Run locally:

```bash
# This will run both client and server concurrently. Both should have HMR enabled
npm run dev
```

## Starting a new database

If you need to start a new database during development, change your `DATABASE_NAME` in your `.env`
folder to the name of your new desired database name.

Then run:

```bash
npm run database:init
```

## Completing a task

Our branching strategy consists of feature branches. The main branch is protected; you must submit a
pull request in order to contribute to it.

```bash
# making sure you're up to date
git checkout main
git pull origin main
```

```bash
# creating a feature branch
git checkout -b feature/new-task-name-goes-here
```

```bash
# Make your changes: add a new page, etc.
```

```bash
# Stage all your changes. Make sure you're root level
git add .
```

```bash
# Commit your changes, prettier will automatically format your code
git commit -m "commit-message-goes-here"
```

```bash
# Push to a new feature branch remotely
git push origin feature/new-task-name-goes-here
```

```bash
# Go to GitHub and make a new pull request from this branch into main.
# Request review from all 3 others, and wait for approval
# Once approved, click "Squash and merge" on the PR page
# Squash == Compress all commits into one
```
