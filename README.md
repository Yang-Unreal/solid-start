# SolidStart E-commerce Starter

This project is a robust and modern web application built with **SolidStart**, a powerful meta-framework for SolidJS, and styled with **TailwindCSS**. It serves as a comprehensive starter template for building high-performance, full-stack applications, featuring user authentication, database integration, file uploads, and dynamic data management.

## Features

- **User Authentication**: Secure login, registration, and session management powered by `better-auth`.
- **Product Management**: Create, list, and manage products with database persistence.
- **File Uploads**: Integrated S3 client for secure and efficient file storage (e.g., product images).
- **Database Integration**: Seamless interaction with PostgreSQL using Drizzle ORM for type-safe database operations.
- **State Management & Data Fetching**: Efficient data handling with `@tanstack/solid-query` (React Query for SolidJS).
- **Theming**: Dynamic dark/light mode toggle for a personalized user experience.
- **Client-Side Routing**: Fast and smooth navigation with `@solidjs/router`.
- **Global Error Handling**: Robust error boundaries for a resilient user interface.
- **Responsive Design**: Built with TailwindCSS for a mobile-first and adaptive layout.
- **Animations**: Subtle UI animations powered by `animejs`.
- **Headless UI Components**: Utilizes `@ark-ui/solid` for accessible and customizable UI primitives.
- **Icons**: Beautiful and customizable icons from `lucide-solid`.

## Technologies Used

- **SolidStart**: A meta-framework for building SolidJS applications, providing server-side rendering (SSR), routing, and more.
- **SolidJS**: A declarative JavaScript library for creating user interfaces, known for its fine-grained reactivity.
- **TailwindCSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
- **better-auth**: A flexible and secure authentication library.
- **Drizzle ORM**: A TypeScript ORM for relational databases, offering a powerful and type-safe query builder.
- **PG**: A non-blocking PostgreSQL client for Node.js.
- **@tanstack/solid-query**: A powerful library for asynchronous state management and data fetching (formerly React Query).
- **@ark-ui/solid**: Headless UI components for building accessible and customizable design systems.
- **@aws-sdk/client-s3** & **@aws-sdk/s3-request-presigner**: AWS SDK for S3 bucket interaction, including presigned URLs for secure uploads.
- **animejs**: A lightweight JavaScript animation library for creating smooth and performant animations.
- **ioredis**: A robust, performance-focused, and full-featured Redis client for Node.js.
- **lucide-solid**: A collection of beautiful and consistent open-source icons for SolidJS.
- **dotenv**: Loads environment variables from a `.env` file.
- **@faker-js/faker**: A library for generating massive amounts of realistic fake data.
- **Vinxi**: A development server and build tool used by SolidStart.
- **tsx**: A TypeScript execution environment for Node.js, used for scripts.

## Project Structure

The project follows a standard SolidStart structure, organized for clarity and scalability:

- `src/routes/`: Contains route components, defining the application's pages and API endpoints.
  - `src/routes/api/`: API routes for backend logic (e.g., `products.ts`, `upload.ts`, `auth/[...auth].ts`).
- `src/components/`: Reusable UI components, categorized for better organization (e.g., `list/`, `switch/`, `errorBoundary/`).
- `src/context/`: SolidJS contexts for global state management (e.g., `CounterContext.tsx`).
- `src/db/`: Database schema definitions (`schema.ts`) and connection logic (`index.ts`) using Drizzle ORM.
- `src/lib/`: Utility functions, authentication logic (`auth.ts`, `auth-client.ts`), and external service integrations (e.g., `minio.ts`, `redis.ts`).
- `src/scripts/`: Server-side and client-side scripts (e.g., `seed.ts` for database seeding, `theme-initializer.js`).
- `src/app.tsx`: Main application component, global router setup, and `QueryClientProvider`.
- `src/app.css`: Global styles, TailwindCSS imports, and custom utility classes.
- `src/entry-client.tsx`: Client-side entry point for hydration of the SolidStart application.
- `src/entry-server.tsx`: Server-side entry point for SolidStart's server-side rendering.
- `public/`: Static assets like `favicon.ico`.
- `drizzle/`: Drizzle ORM migration files and snapshots.
- `drizzle.config.ts`: Drizzle ORM configuration.
- `auth-schema.ts`: Schema definition for authentication.

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
    Create a `.env` file in the root of the project and add your environment variables. This is crucial for database connection, authentication secrets, and any other API keys.
    ```
    # Example .env content
    DATABASE_URL="postgresql://user:password@host:port/database"
    AUTH_SECRET="your_auth_secret_key"
    # Add any other environment variables required for S3, Redis, etc.
    # For S3 (MinIO example):
    # MINIO_ENDPOINT="http://localhost:9000"
    # MINIO_ACCESS_KEY="minioadmin"
    # MINIO_SECRET_KEY="minioadmin"
    # MINIO_BUCKET_NAME="my-bucket"
    # For Redis:
    # REDIS_URL="redis://localhost:6379"
    ```
4.  **Database Setup:**
    Run Drizzle migrations to set up your database schema. Ensure your `DATABASE_URL` is correctly configured in `.env`.

    ```bash
    bun run db:push
    ```

    This command uses `npx drizzle-kit push` to apply schema changes to your database.

5.  **Database Seeding (Optional):**
    To populate your database with sample data (e.g., for development or testing), run the seed script:
    ```bash
    bun run db:seed
    ```
    This command executes `src/scripts/seed.ts` using `tsx`.

## Running the Project

To run the project in development mode:

```bash
bun run dev
```

This will start the development server, and you can access the application at `http://localhost:3000` (or the port specified in your environment). The development server includes hot module replacement for a smooth development experience.

To build the project for production:

```bash
bun run build
```

This command compiles the application for deployment.

To start the production build:

```bash
bun run start
```

This command serves the optimized production build.

## Drizzle Studio (Optional)

You can use Drizzle Studio to visually inspect and manage your database.

```bash
bun run studio
```

This will open Drizzle Studio in your browser, typically at `http://localhost:4000`.
