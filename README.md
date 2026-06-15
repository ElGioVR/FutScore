# FutScore

FutScore is a web application built with Astro that provides World Cup 2026 match schedules and calendar synchronization features through the ICS format.

## Features

* Browse the FIFA World Cup 2026 match schedule.
* Search participating national teams.
* Export matches to ICS calendar format.
* Compatible with Google Calendar, Apple Calendar, and Outlook.
* Fast and lightweight Astro-powered experience.
* Responsive design for desktop and mobile devices.

## Tech Stack

* Astro
* TypeScript
* Tailwind CSS
* Node.js

## Installation

Clone the repository:

```bash
git clone https://github.com/ElGioVR/FutScore.git
cd FutScore
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```txt
http://localhost:4321
```

## Project Structure

```txt
src/
├── components/
├── layouts/
├── lib/
├── pages/
│   ├── api/
│   ├── calendar.ics.ts
│   └── index.astro
├── scripts/
└── styles/

public/
```

## Usage

FutScore allows users to view the complete FIFA World Cup 2026 schedule and export matches to their preferred calendar application using the ICS standard.

## Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Roadmap

* Match results and standings
* Knockout stage tracking
* Team statistics
* Favorite teams
* Live match updates
* Timezone-aware schedules

## License

This project is licensed under the MIT License.
