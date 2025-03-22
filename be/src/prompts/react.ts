
export const reactbasePrompt = `
<bolt name="project-import" type="folder" path=".">

  <bolt name="eslint.config.js" type="file" path="eslint.config.js">
    import js from '@eslint/js';
    import globals from 'globals';
    import reactHooks from 'eslint-plugin-react-hooks';
    import reactRefresh from 'eslint-plugin-react-refresh';
    import tseslint from 'typescript-eslint';

    export default tseslint.config(
      { ignores: ['dist'] },
      {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
          ecmaVersion: 2020,
          globals: globals.browser,
        },
        plugins: {
          'react-hooks': reactHooks,
          'react-refresh': reactRefresh,
        },
        rules: {
          ...reactHooks.configs.recommended.rules,
          'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
          ],
        },
      }
    );
  </bolt>

  <bolt name="index.html" type="file" path="index.html">
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + React + TS</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
  </bolt>

  <bolt name="package.json" type="file" path="package.json">
    {
      "name": "vite-react-typescript-starter",
      "private": true,
      "version": "0.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint .",
        "preview": "vite preview"
      },
      "dependencies": {
        "lucide-react": "^0.344.0",
        "react": "^18.3.1",
        "react-dom": "^18.3.1"
      },
      "devDependencies": {
        "@eslint/js": "^9.9.1",
        "@types/react": "^18.3.5",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        "autoprefixer": "^10.4.18",
        "eslint": "^9.9.1",
        "eslint-plugin-react-hooks": "^5.1.0-rc.0",
        "eslint-plugin-react-refresh": "^0.4.11",
        "globals": "^15.9.0",
        "postcss": "^8.4.35",
        "tailwindcss": "^3.4.1",
        "typescript": "^5.5.3",
        "typescript-eslint": "^8.3.0",
        "vite": "^5.4.2"
      }
    }
  </bolt>

  <bolt name="src" type="folder" path="src">
  
    <bolt name="App.tsx" type="file" path="src/App.tsx">
      import React from 'react';

      function App() {
        return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p>Start prompting (or editing) to see magic happen :)</p>
          </div>
        );
      }
      export default App;
    </bolt>

    <bolt name="index.css" type="file" path="src/index.css">
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
    </bolt>
    <bolt name="main.tsx" type="file" path="src/main.tsx">
      import { StrictMode } from 'react';
      import { createRoot } from 'react-dom/client';
      import App from './App.tsx';
      import './index.css';

      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    </bolt>
    <bolt name="vite-env.d.ts" type="file" path="src/vite-env.d.ts">
      /// <reference types="vite/client" />
    </bolt>
  </bolt>
</bolt>

`