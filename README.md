# Budgetify Web

Budgetify Web is the browser client for the Budgetify ecosystem. It gives users
a fast, dark-first workspace to track income, expenses, loans, savings, and
planned purchases from a single interface.

## Live Product

- Web app: [https://budgetify.nexcode.africa](https://budgetify.nexcode.africa)

## What This Project Includes

- Secure authentication with email and Google sign-in
- Dashboard summaries, charts, and monthly navigation
- Ledger pages for income, expenses, loans, savings, and todos
- Filtering, pagination, search, and chosen-date range queries
- Todo planning flows with recurring schedules and expense recording
- Responsive UI tuned for both desktop and mobile usage

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI primitives

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables.

Create a local env file such as `.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Notes

- API requests are resolved from `NEXT_PUBLIC_API_URL`.
- Production is configured to talk to the deployed API domain.
- Google sign-in on the web client depends on a valid public Google client ID.
- This project is designed to work alongside the `api` project in the same
  workspace.

## Recommended Workflow

1. Start the API locally first.
2. Point `NEXT_PUBLIC_API_URL` to that API.
3. Run the web app and verify login before working on ledger flows.
4. Run `npm run lint` and `npm run build` before pushing changes.
