# Agent UI

A simple chat interface for the LangGraph agent with Supabase database integration.

## Features

- Password-protected access
- Chat with the AI agent
- Create and manage conversations
- Persistent conversation history using Supabase

## Tech Stack

- Next.js 14 with App Router
- Tailwind CSS for styling
- Supabase for database
- Integration with the LangGraph agent API

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Environment Variables

Copy `.env.example` to `.env.local` and update with your actual values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_AGENT_API_URL=your_agent_api_url
NEXT_PUBLIC_AGENT_API_KEY=your_agent_api_key
NEXT_PUBLIC_APP_PASSWORD=your_app_password
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Follow the instructions in `SUPABASE_SETUP.md` to run the SQL queries in the Supabase SQL editor
3. Set up your environment variables in `.env.local` with your Supabase credentials

### Installation

```bash
# Install dependencies
npm install

# Install additional required packages
./update-dependencies.sh

# Run the development server
npm run dev
```

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy

## Usage

1. Access the application URL
2. Enter the application password (set in your environment variables)
3. Start chatting with the AI agent
4. Create new conversations or continue existing ones
