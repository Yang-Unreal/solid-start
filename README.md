# SolidStart Project with TailwindCSS

This project is a web application built with SolidStart, a meta-framework for SolidJS, and styled using TailwindCSS. It includes features such as authentication, database integration, and animations.

## Technologies Used

- **SolidStart**: A meta-framework for building SolidJS applications, providing server-side rendering, routing, and more.
- **SolidJS**: A declarative JavaScript library for creating user interfaces.
- **TailwindCSS**: A utility-first CSS framework for rapidly building custom designs.
- **better-auth**: A library for handling authentication.
- **Drizzle ORM**: A TypeScript ORM for relational databases.
- **PG**: A non-blocking PostgreSQL client for Node.js.
- **Anime.js**: A lightweight JavaScript animation library.
- **Vinxi**: A development server and build tool.

## Project Structure

The project follows a standard SolidStart structure:

- `src/routes/`: Contains route components, defining the application's pages.
- `src/components/`: Reusable UI components.
- `src/context/`: SolidJS contexts for state management.
- `src/db/`: Database schema and connection logic using Drizzle ORM.
- `src/lib/`: Utility functions and authentication logic.
- `src/scripts/`: Client-side scripts, such as theme initialization.
- `src/app.tsx`: Main application component and router setup.
- `src/app.css`: Global styles and TailwindCSS imports.
- `src/entry-client.tsx`: Client-side entry point for hydration.
- `src/entry-server.tsx`: Server-side entry point for SSR.

## Setup Instructions

To set up the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd [project-directory]
    ```
2.  **Install dependencies:**
    This project uses `bun` as the package manager. If you don't have `bun` installed, you can install it by following the instructions on their official website.
    ```bash
    bun install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root of the project and add your environment variables, especially for database connection and authentication.
    ```
    # Example .env content
    DATABASE_URL="postgresql://user:password@host:port/database"
    AUTH_SECRET="your_auth_secret_key"
    ```
4.  **Database Setup:**
    Run Drizzle migrations to set up your database schema:
    ```bash
    bun run drizzle-kit push:pg
    ```

## Running the Project

To run the project in development mode:

```bash
bun run dev
```

This will start the development server, and you can access the application at `http://localhost:3000` (or the port specified in your environment).

To build the project for production:

```bash
bun run build
```

To start the production build:

```bash
bun run start
```
