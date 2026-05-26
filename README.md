# LuxeEstate REMS

Production-oriented MERN real estate management system.

## Run locally

```bash
npm install
cp backend/.env.example backend/.env
npm run seed
npm run dev:backend
cd frontend && npm run dev
```

Set `backend/.env` with MongoDB Atlas credentials and optional Cloudinary/SMTP credentials before seeding or starting the API.

## Seed credentials

- Admin: `admin@rems.local` / `AdminPass123!`
- Agent: `agent1@rems.local` / `AgentPass123!`
- Customer: `customer1@rems.local` / `CustomerPass123!`
