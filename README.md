# FlowBoard

**Modern team collaboration with beautiful Kanban boards**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

FlowBoard is a production-ready project management platform that helps teams organize work with intuitive drag-and-drop Kanban boards, AI-powered task generation, and real-time collaboration.

🌐 **Live Demo**: [https://tryflowboard.com](https://tryflowboard.com)

---

## Features

### 🎯 Core Functionality

- **Multiple Boards** - Create unlimited boards per organization with custom names
- **Drag & Drop** - Smooth card movement between columns with beautiful animations
- **Custom Columns** - Add, edit, and delete columns with custom colors
- **Rich Cards** - Titles, descriptions, and detailed notes for comprehensive task tracking
- **AI-Powered Generation** - Transform card ideas into detailed implementation prompts using OpenAI
- **Real-time Sync** - All changes instantly saved to cloud database

### 👥 Team Collaboration

- **Organization Management** - Team workspaces powered by Clerk
- **Role-Based Access** - Admin and member roles with granular permissions
- **Secure Sharing** - Row-level security ensures teams only see their data
- **User Profiles** - Avatar, name, and email integration

### 🎨 User Experience

- **Beautiful UI** - Modern glassmorphic design with emerald/teal gradients
- **Responsive** - Optimized for desktop, tablet, and mobile
- **Dark Theme** - Eye-friendly interface for extended work sessions
- **Smooth Animations** - Powered by Framer Motion

---

## Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router and Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Fluid animations
- **[@dnd-kit](https://dndkit.com/)** - Drag and drop functionality
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Services

- **[Supabase](https://supabase.com/)** - PostgreSQL database with Row Level Security
- **[Clerk](https://clerk.com/)** - Authentication and organization management
- **[OpenAI API](https://openai.com/)** - AI-powered prompt generation
- **[Vercel](https://vercel.com/)** - Production hosting and deployments

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up](https://supabase.com))
- Clerk account ([sign up](https://clerk.com))
- OpenAI API key ([get key](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/TheCloudOrg/FlowBoard.git
   cd FlowBoard
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the project root:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database:**

   Run the migrations in `/supabase/migrations/` in order:

   ```bash
   # In your Supabase SQL Editor, run each migration file:
   # - 001_initial_schema.sql
   # - 002_usage_tracking.sql
   # - 003_rls_policies.sql
   # - 004_rls_policies_core_tables.sql
   # - 005_fix_rls_recursion.sql
   # - 006_fix_waitlist_inserts.sql
   ```

5. **Configure Clerk webhooks:**

   In your Clerk Dashboard, create a webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `organizationMembership.created`, `organizationMembership.deleted`, `organization.created`, `organization.updated`
   - Add the signing secret to your `.env.local`:
     ```env
     CLERK_WEBHOOK_SECRET=your_webhook_signing_secret
     ```

6. **Run the development server:**

   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Usage

### Getting Started

1. Sign up or log in with Clerk authentication
2. Create or join an organization
3. Start creating boards and cards!

### Managing Boards

- Click **"Create New Board"** to add a new board
- Switch between boards using the dropdown selector
- Each board maintains its own columns and cards

### Working with Cards

- **Create**: Click "Add Card" in any column
- **Edit**: Click the edit icon on a card
- **Move**: Drag cards between columns or reorder within a column
- **Delete**: Click the trash icon on a card
- **AI Generate**: Click the sparkles icon to generate detailed prompts

### Managing Columns

- **Add**: Click "Add Column" and enter a name
- **Delete**: Click the three dots menu on a column header
- **Colors**: Each column gets a random color (can be customized)

### AI Prompt Generation

The AI feature analyzes your card and generates:

- Detailed implementation steps
- Technical requirements
- Code examples and best practices
- Testing strategies

Perfect for transforming high-level ideas into actionable development tasks!

---

## Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**
2. **Connect to Vercel:**
   - Import your repository
   - Add all environment variables
   - Deploy!
3. **Configure your domain** (optional)
4. **Set up Clerk webhook** with your production URL

### Other Platforms

FlowBoard can be deployed to any platform that supports Next.js:

- **Railway**
- **Fly.io**
- **AWS Amplify**
- **Netlify**

Ensure you configure all environment variables on your chosen platform.

---

## Project Structure

```
flowboard/
├── app/
│   ├── actions/              # Server actions for data mutations
│   ├── api/
│   │   ├── debug/            # Debug endpoints for development
│   │   ├── generate-prompt/  # OpenAI prompt generation
│   │   ├── usage/            # Usage tracking endpoints
│   │   ├── waitlist/         # Waitlist management
│   │   └── webhooks/         # Clerk webhook handlers
│   ├── dashboard/            # Main dashboard page
│   ├── landing/              # Landing page
│   └── globals.css           # Global styles
├── components/
│   ├── AIPromptModal.tsx     # AI prompt display modal
│   ├── Card.tsx              # Draggable card component
│   ├── CardModal.tsx         # Card create/edit modal
│   ├── Column.tsx            # Droppable column component
│   ├── CreateBoardModal.tsx  # Board creation modal
│   ├── KanbanBoard.tsx       # Main board with DnD logic
│   ├── UsageStats.tsx        # Usage tracking display
│   └── WaitlistModal.tsx     # Waitlist signup modal
├── lib/
│   ├── auto-sync.ts          # Clerk→Supabase sync utilities
│   ├── supabase/             # Supabase client & types
│   ├── usage-limits.ts       # Usage enforcement logic
│   └── localStorage.ts       # Local storage utilities
├── supabase/
│   └── migrations/           # Database migration files
├── LICENSE                   # AGPL-3.0 license
└── README.md                 # This file
```

---

## License

Copyright © 2025 TheCloudOrg

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU Affero General Public License** as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but **WITHOUT ANY WARRANTY**; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see [https://www.gnu.org/licenses/](https://www.gnu.org/licenses/).

### AGPL-3.0 Requirements

If you modify FlowBoard and run it as a network service (SaaS), you **must**:

1. Make your modified source code available to users
2. Include prominent attribution to the original FlowBoard project
3. License your modifications under AGPL-3.0
4. Provide a link to your source code repository

See the [LICENSE](LICENSE) file for complete terms.

---

## Trademark

**FlowBoard™** is a trademark of TheCloudOrg. Unauthorized use of the FlowBoard name or logo is prohibited without express written permission.

When forking or modifying this project:

- ✅ You may use the code under AGPL-3.0 terms
- ✅ You must include attribution to FlowBoard
- ❌ You may not use the "FlowBoard" name for your service
- ❌ You may not use FlowBoard branding/logos

---

## Contributing

We welcome contributions! Here's how to get involved:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## Support

- **Documentation**: [https://github.com/TheCloudOrg/FlowBoard/wiki](https://github.com/TheCloudOrg/FlowBoard/wiki)
- **Issues**: [https://github.com/TheCloudOrg/FlowBoard/issues](https://github.com/TheCloudOrg/FlowBoard/issues)
- **Discussions**: [https://github.com/TheCloudOrg/FlowBoard/discussions](https://github.com/TheCloudOrg/FlowBoard/discussions)

---

## Acknowledgments

Built with modern web technologies:

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Clerk](https://clerk.com/) - User management platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [OpenAI](https://openai.com/) - AI-powered features

---

## Roadmap

- [ ] Real-time collaboration with live cursors
- [ ] Card comments and activity feeds
- [ ] File attachments
- [ ] Due dates and reminders
- [ ] Board templates
- [ ] Advanced analytics dashboard
- [ ] Mobile apps (iOS/Android)
- [ ] Slack/Discord integrations

---

**Made with precision by [TheCloudOrg](https://github.com/TheCloudOrg)**

_Organize smarter, ship faster._
