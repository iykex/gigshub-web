# Running GigsHub Web Application

## Development Mode

To run the application in development mode, you need to run **TWO separate terminals**:

### Terminal 1: API Server (Wrangler)
```bash
npm run api:dev
```
This starts the Cloudflare Workers API server on port 8788.

### Terminal 2: Frontend (Vite)
```bash
npm run dev
```
This starts the Vite development server (usually on port 5173).

## How It Works

- The **Vite dev server** serves your React frontend
- The **Wrangler dev server** runs your API endpoints (defined in `src/worker.ts`)
- Vite proxies all `/api/*` requests to the Wrangler server at `localhost:8788`

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run api:dev` - Start Wrangler API server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:schema` - Apply database schema
- `npm run db:seed` - Seed database with pricing data
- `npm run db:reset` - Reset database (schema + seed)

## First Time Setup

1. Make sure you have a local D1 database set up
2. Run `npm run db:reset` to initialize the database
3. Start both servers (API and Frontend)
4. Navigate to `http://localhost:5173`

## Troubleshooting

**500 Internal Server Error on login?**
- Make sure the API server is running (`npm run api:dev`)
- Check that the database is initialized (`npm run db:reset`)
- Verify the proxy is pointing to port 8788 in `vite.config.ts`
