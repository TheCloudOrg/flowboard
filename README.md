# Project Management Kanban Board

A beautiful, modern project management application with drag-and-drop Kanban boards built with Next.js 14, TypeScript, and Tailwind CSS v3.

## Features

- **Drag & Drop**: Smooth card dragging between columns with beautiful animations
- **Multiple Columns**: Start with TODO, In Progress, and Completed columns
- **Custom Columns**: Add as many custom columns as you need
- **Card Management**: Create, edit, and delete cards with titles, descriptions, and notes
- **AI-Powered Prompts**: Generate detailed implementation prompts from card titles using OpenAI
- **Local Storage**: All data persists automatically in your browser
- **Beautiful UI**: Glassmorphic design with purple/blue gradient theme
- **Responsive**: Works on all screen sizes
- **No Auth Required**: Simple and fast to use

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS v3** - Utility-first styling
- **Framer Motion** - Smooth animations
- **@dnd-kit** - Drag and drop functionality
- **OpenAI API** - AI-powered prompt generation
- **Lucide React** - Beautiful icons

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up OpenAI API Key (for AI features):**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Open the `.env.local` file in the project root
   - Replace `your-openai-api-key-here` with your actual API key:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     ```
   - **Note**: The AI feature will not work without a valid API key. All other features work without it.

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Cards

- Click the "Add Card" button at the bottom of any column
- Fill in the card title (required), description, and notes
- Click "Create" to add the card

### Editing Cards

- Hover over a card and click the edit icon
- Update the card details
- Click "Update" to save changes

### Dragging Cards

- Click and hold on a card
- Drag it to a new position within the same column or to a different column
- Release to drop the card in its new location

### Managing Columns

- Click "Add Column" to create a new custom column
- Click the three dots on a column header to delete it
- Deleting a column will also delete all cards within it

### AI Prompt Generation

- Hover over any card and click the sparkles icon (⭐) to generate an AI prompt
- The AI will analyze your card title, description, and notes
- It generates a detailed, actionable prompt for implementing that feature
- Copy the generated prompt and use it with Claude Code or other AI assistants
- Perfect for turning high-level ideas into specific technical requirements

### Data Persistence

All your boards, columns, and cards are automatically saved to your browser's local storage. Your data will persist even after closing the browser.

## Project Structure

```
projectManagementApp/
├── app/
│   ├── api/
│   │   └── generate-prompt/
│   │       └── route.ts    # OpenAI API endpoint for prompt generation
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles and Tailwind directives
├── components/
│   ├── KanbanBoard.tsx     # Main board component with DnD logic
│   ├── Column.tsx          # Column component with droppable area
│   ├── Card.tsx            # Card component with drag handle
│   ├── CardModal.tsx       # Modal for creating/editing cards
│   └── AIPromptModal.tsx   # Modal for displaying AI-generated prompts
├── lib/
│   └── localStorage.ts     # LocalStorage utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
├── .env.local              # Environment variables (OpenAI API key)
├── tailwind.config.ts      # Tailwind configuration with custom theme
└── package.json            # Project dependencies
```

## Build for Production

```bash
npm run build
npm start
```

## Customization

### Colors

Edit the color scheme in `tailwind.config.ts`:

- `primary`: Purple tones
- `accent`: Blue tones
- `dark`: Background tones

### Animations

Modify animation settings in `tailwind.config.ts` under `animation` and `keyframes`.

### Default Columns

Change default columns in `lib/localStorage.ts` by editing the `DEFAULT_BOARD` constant.

## License

MIT

---

Built with ❤️ using Next.js and Tailwind CSS
