# Project Management Kanban Board

A beautiful, modern project management application with drag-and-drop Kanban boards built with Next.js 14, TypeScript, and Tailwind CSS v3.

## Features

- **Drag & Drop**: Smooth card dragging between columns with beautiful animations
- **Multiple Columns**: Start with TODO, In Progress, and Completed columns
- **Custom Columns**: Add as many custom columns as you need
- **Card Management**: Create, edit, and delete cards with titles, descriptions, and notes
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
- **Lucide React** - Beautiful icons

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
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

### Data Persistence
All your boards, columns, and cards are automatically saved to your browser's local storage. Your data will persist even after closing the browser.

## Project Structure

```
projectManagementApp/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles and Tailwind directives
├── components/
│   ├── KanbanBoard.tsx     # Main board component with DnD logic
│   ├── Column.tsx          # Column component with droppable area
│   ├── Card.tsx            # Card component with drag handle
│   └── CardModal.tsx       # Modal for creating/editing cards
├── lib/
│   └── localStorage.ts     # LocalStorage utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
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
