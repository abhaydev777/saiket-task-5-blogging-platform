# 🖋️ StoryCraft Blog Platform

StoryCraft is a premium, fully-responsive blogging and content publishing platform designed for modern product managers and content creators. Built using **React (JavaScript)** and **Vite**, styled with **Tailwind CSS v4**, and backed by **Supabase PostgreSQL**, it offers a seamless experience for reading, searching, filtering, and managing articles.

---

## 🚀 Key Features

- **Dynamic Reading Feed:** Browse, search, and filter blog posts by categories (*Technology*, *Travel*, *Lifestyle*, *Business*, *Design*) with live, reactive UI updates.
- **Dedicated Markdown Reader:** Read posts formatted in rich-text style using the custom markdown parser (supporting headings, lists, quotes, and custom formatting).
- **Full CRUD Operations (Dashboard):** Admin capabilities to create new blog posts, edit existing posts, and delete articles with a complete validation flow.
- **Graceful Supabase Fallback:** Dual database mode. If remote Supabase keys are not provided, the application runs fully offline using high-fidelity local mock data.
- **Automatic Database Seeding:** On the very first run with a connected Supabase database, StoryCraft will automatically seed standard mock data if your remote database table is empty.
- **Contact & Feedback Forms:** Fully responsive forms equipped with user notification triggers.
- **Premium User Experience:** Powered by **Framer Motion** for micro-animations, **Lucide Icons** for modern iconography, and curated, sleek layouts.

---

## 🛠️ Technology Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) (JavaScript)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (using the new `@tailwindcss/vite` plugin configuration)
- **Database / Backend:** [Supabase](https://supabase.com/) (PostgreSQL client)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📦 Project Structure

```bash
├── src/
│   ├── assets/          # Static assets (images, branding logos)
│   ├── data/
│   │   ├── blogs.js     # Default mock data for local fallback mode
│   │   └── schema.sql   # SQL initialization commands for Supabase Setup
│   ├── App.css          # App-wide global overrides
│   ├── App.jsx          # Main application containing views, logic, & UI components
│   ├── index.css        # Tailwind CSS imports & custom styles
│   ├── main.jsx         # React entrypoint
│   └── supabase.js      # Supabase client instantiation & fallback fallback logic
├── .env                 # API Credentials (ignored by Git)
├── .env.example         # Template for environment configuration
├── vite.config.js       # Vite configuration
└── package.json         # Dependency configuration
```

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally:

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/abhaydev777/saiket-task-5-blogging-platform.git
cd saiket-task-5-blogging-platform

# Install npm dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Open `.env` and enter your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```
> **Note:** If these keys are left empty or omitted, StoryCraft automatically runs in mock mode using `src/data/blogs.js` as its state.

### 3. Setup Supabase Tables (Optional but Recommended)
If you are using Supabase, follow these steps to initialize your database:
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Copy the contents of [`src/data/schema.sql`](file:///home/abhay/vscode/Saiket/Task-5-Blog-Platform-Abhay/src/data/schema.sql) and paste it into the editor.
3. Run the query. This script will:
   - Create a `blogs` table with all required columns.
   - Enable Row Level Security (RLS) policies.
   - Authorize public select, insert, update, and delete access for demonstration purposes.

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the URL shown in your console).

---

## 🏗️ Building for Production

To generate a production build:
```bash
# Compile and build the project
npm run build

# Preview the built production site locally
npm run preview
```
