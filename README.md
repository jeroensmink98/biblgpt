## BiblGPT

A small SvelteKit app that converts APA 7 references into BibTeX using an AI model. Paste an APA reference on the left, get BibTeX on the right. Your OpenAI API key is stored locally in the browser and never leaves your device.

### Features
- **APA → BibTeX conversion** using your own OpenAI API key
- **Dark theme** with subtle borders
- **Copy to clipboard** and lightweight UI

### Run locally
Prerequisites: Node 18+ and `pnpm` (or `npm`/`yarn`).

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173` in your browser. Click “Settings” in the header, paste your OpenAI API key, choose a model, and save. Then paste an APA reference to convert.

### Build and preview
```bash
pnpm build
pnpm preview
```

### Notes
- No server secrets required; the API key is saved in local storage via the settings modal.
- This project uses Svelte 5 and Vite.
