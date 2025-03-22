
export const nextbasePrompt = `<boltArtifact id="project-import" title="Next.js AI Website Builder">
  <boltAction type="file" filePath="package.json">{
    "name": "nextjs-ai-builder",
    "private": true,
    "version": "0.0.1",
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "eslint ."
    },
    "dependencies": {
      "next": "latest",
      "react": "latest",
      "react-dom": "latest",
      "openai": "latest"
    },
    "devDependencies": {
      "@types/react": "latest",
      "@types/react-dom": "latest",
      "typescript": "latest",
      "eslint": "latest",
      "eslint-config-next": "latest"
    }
  }</boltAction>

  <boltAction type="file" filePath="tsconfig.json">{
    "compilerOptions": {
      "target": "ES2020",
      "lib": ["ESNext", "DOM"],
      "module": "ESNext",
      "moduleResolution": "NodeNext",
      "strict": true,
      "jsx": "preserve",
      "incremental": true
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    "exclude": ["node_modules"]
  }</boltAction>

  <boltAction type="file" filePath="next.config.js">module.exports = {
    reactStrictMode: true,
    experimental: {
      serverActions: true
    }
  };</boltAction>

  <boltAction type="file" filePath="app/layout.tsx">import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}</boltAction>

  <boltAction type="file" filePath="app/page.tsx">export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold">AI Website Builder</h1>
    </main>
  );
}</boltAction>

  <boltAction type="file" filePath="pages/api/ai.ts">import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const response = await openai.completions.create({
    model: "gpt-4",
    prompt,
    max_tokens: 500
  });
  return NextResponse.json({ text: response.choices[0].text });
}</boltAction>

  <boltAction type="file" filePath="app/globals.css">@tailwind base;
@tailwind components;
@tailwind utilities;</boltAction>

</boltArtifact>`