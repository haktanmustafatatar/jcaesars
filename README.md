# J.Caesar Agent

A full-stack SaaS platform for building and deploying AI-powered chatbots across multiple channels.

## Features

- 🤖 **AI Chatbots** - Build custom chatbots trained on your content
- 🌐 **Website Widget** - Embed chatbot on any website
- 📱 **Multi-Channel** - WhatsApp, Instagram, Facebook, Slack, Telegram, Email
- 📊 **Analytics** - Track conversations and performance
- 🔧 **Admin Panel** - Full SaaS management system
- 💳 **Stripe Billing** - Subscription and usage-based pricing

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Prisma, PostgreSQL
- **Auth**: Clerk
- **AI**: OpenAI GPT-4o, Anthropic Claude
- **Payments**: Stripe
- **Queue**: Redis + BullMQ

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 with pgvector
- Redis 7

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jcaesar-agent.git
cd jcaesar-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Docker Deployment

```bash
docker-compose up -d
```

## Project Structure

```
app/
├── (landing)/          # Landing page routes
├── (dashboard)/        # User dashboard routes
├── (admin)/            # Admin panel routes
├── api/                # API routes
├── widget/             # Embed widget
components/
├── ui/                 # shadcn/ui components
├── landing/            # Landing page sections
├── dashboard/          # Dashboard components
├── admin/              # Admin components
lib/
├── prisma.ts           # Prisma client
├── services/           # Business logic
prisma/
├── schema.prisma       # Database schema
```

## Admin Panel

Access the admin panel at `/admin` with superadmin credentials.

Features:
- Dashboard with system metrics
- User management
- API key management
- Token usage tracking
- Plan management
- Channel configuration
- System monitoring

## API Documentation

### Public API

- `POST /api/embed/:chatbotId/chat` - Send a message
- `GET /api/embed/:chatbotId/config` - Get chatbot config

### Authenticated API

- `GET /api/chatbots` - List chatbots
- `POST /api/chatbots` - Create chatbot
- `GET /api/chatbots/:id` - Get chatbot details
- `PUT /api/chatbots/:id` - Update chatbot
- `DELETE /api/chatbots/:id` - Delete chatbot

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@jcaesar.agent or join our Discord community.
