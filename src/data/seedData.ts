import { BlogPost } from '../types';

export const SEED_POSTS: BlogPost[] = [
  {
    title: "Mastering React 19: Action Hooks & Server Components",
    summary: "Dive deep into the new capabilities of React 19, including the native useActionState, useOptimistic, and Server Actions designed for modern apps.",
    content: `# Mastering React 19: Action Hooks & Server Components

React 19 is officially here, and it brings a paradigm shift in how we handle asynchronous state, forms, and data mutation. In this guide, we will explore the major additions and how they simplify developer workflows.

## The New Action Hooks

Form handling and pending state management have always been a source of boilerplate in React apps. React 19 introduces **Actions** to natively handle async transitions.

### 1. \`useActionState\`

Formerly known as \`useFormState\`, this hook is designed to manage form actions with ease, automatically exposing pending state and return values.

\`\`\`tsx
import { useActionState } from 'react';

async function updateProfile(prevState: any, formData: FormData) {
  try {
    await api.post('/profile', formData);
    return { success: true, message: 'Profile updated successfully!' };
  } catch (err) {
    return { success: false, message: 'Failed to update.' };
  }
}

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="username" placeholder="New Username" className="px-4 py-2 bg-slate-800 text-white rounded" />
      <button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 py-2 rounded">
        {isPending ? 'Saving...' : 'Update Profile'}
      </button>
      {state && <p className={state.success ? 'text-green-400' : 'text-red-400'}>{state.message}</p>}
    </form>
  );
}
\`\`\`

## Automatic Pending States with \`useTransition\`

In previous versions, keeping track of loading states required a separate state variable. Now, React 19 handles this elegantly:

\`\`\`tsx
const [isPending, startTransition] = useTransition();

const handleSubmit = () => {
  startTransition(async () => {
    await saveSettings();
  });
};
\`\`\`

During this transitions, React will keep the current UI active and interactive, while rendering the updates in the background.

## Key Takeaways
- **No more manual loading states**: Actions automatically manage isPending.
- **Improved UX**: Users get faster feedback with \`useOptimistic\`.
- **Cleaner codebase**: Native form integrations reduce React-Hook-Form dependencies for simple forms.
`,
    tags: ["React", "JavaScript", "Frontend"],
    author: "Razwon",
    createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
    readTime: "5 min read"
  },
  {
    title: "Vibe Coding with Gemini SDK: Build Smart React Apps",
    summary: "Leverage Google GenAI's powerful TypeScript SDK to integrate contextual intelligence, automatic summaries, and chat features into your React apps.",
    content: `# Vibe Coding with Gemini SDK: Build Smart React Apps

With the release of the new \`@google/genai\` SDK, calling Gemini models has never been cleaner or more intuitive. In this post, we will walk through setting up a simple summarization utility inside a full-stack React workspace.

## Getting Started

First, make sure you have the official package installed:

\`\`\`bash
npm install @google/genai
\`\`\`

Then, configure the model on your backend server. Remember: **never expose your API key to the browser!** Always keep it in a server environment.

### Backend Implementation (\`server.ts\`)

\`\`\`typescript
import { GoogleGenAI } from "@google/genai";
import express from 'express';

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/summarize', async (req, res) => {
  const { text } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: \`Summarize the following text in exactly two paragraphs:\\n\\n\${text}\`,
    });
    res.json({ summary: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
\`\`\`

## Implementing the UI in React

Now we can create a clean dashboard card in React to fetch the summary with a loading animation:

\`\`\`tsx
import { useState } from 'react';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
      <textarea 
        value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder="Paste your long article here..."
        className="w-full h-32 bg-slate-950 p-3 rounded text-white border border-slate-800"
      />
      <button 
        onClick={handleSummarize}
        disabled={loading || !text}
        className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg"
      >
        {loading ? 'Summarizing...' : 'Summarize Text'}
      </button>
      {summary && (
        <div className="mt-6 border-t border-slate-800 pt-4">
          <h3 className="text-sm font-semibold text-indigo-400">AI Summary</h3>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}
\`\`\`

By offloading the API key to our Express proxy server, we keep our application completely secure while delivering a state-of-the-art AI feature.
`,
    tags: ["Gemini", "AI", "TypeScript"],
    author: "Razwon",
    createdAt: Date.now() - 3600000 * 24 * 1, // 1 day ago
    readTime: "4 min read"
  },
  {
    title: "Tailwind CSS v4.0: The Future of Style Sheets",
    summary: "Discover why Tailwind CSS v4.0 is a complete reimagining of the framework, featuring a CSS-first configuration and blazing fast Rust engine.",
    content: `# Tailwind CSS v4.0: The Future of Style Sheets

Tailwind CSS has released its most ambitious update yet: v4.0. Built from the ground up on a custom compiler engine written in Rust, it is up to 10x faster and brings a massive shift to **CSS-first configuration**.

## The Blazing Fast Rust Compiler

Previously, Tailwind relied heavily on Javascript-based PostCSS to parse styles. With v4, everything is processed directly in native code, yielding instantaneous build times and a significantly reduced development memory footprint.

## CSS-First Configuration

The \`tailwind.config.js\` file is officially a thing of the past. Config now lives directly in your primary style sheet:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand-500: #6366f1;
  --font-sans: "Inter", sans-serif;
  
  /* Built-in responsive key overrides */
  --breakpoint-xs: 30rem;
}
\`\`\`

## Key Upgrades
1. **No Javascript Overhead**: Entire compilation resolved in native threads.
2. **First-class Container Queries**: Native support for styling containers on resize without third-party plugins.
3. **Implicit Parent States**: Complex nesting and interactive state selectors like \`has-[*]\` are now resolved natively.

This ensures your build pipelines stay responsive, and your components look incredibly polished on any platform.
`,
    tags: ["Tailwind", "CSS", "Design"],
    author: "Razwon",
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
    readTime: "3 min read"
  }
];
