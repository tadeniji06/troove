# TruvoID

A multitenant identity verification platform frontend built with Next.js 14, Tailwind CSS, and Zustand.

## Features

- **Landing Page**: Fully responsive with animations and a live-ish verification preview.
- **Onboarding Flow**: A stepped wizard for tenant provisioning.
- **Dashboard**: Role-aware interface adapting to Platform Ops, Institutions, and Agencies.
- **Multitenancy Demo**: Includes an "Isolation Lab" to demonstrate DB-level data segregation.

## Running Locally

1. `npm install`
2. `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Demo Persona Switcher

For demonstration purposes, a "Demo: switch persona" dropdown is available in the top-right account menu of the dashboard. This allows you to hot-swap between different roles (Ops, Institution Admin, Agency Admin, Outlet Staff) and observe how the UI, data visibility, and capabilities adapt instantly.

To reset the mock state back to the initial seeded data, call `useStore.getState().resetState()` or clear your browser's local storage.
