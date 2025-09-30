# BiblGPT - APA to BibTeX Converter

## Overview
BiblGPT is a web application that converts APA 7th edition references to BibTeX format using AI-powered conversion. Built with SvelteKit and powered by OpenAI's language models.

## Architecture

### Technology Stack
- **Frontend**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS 4
- **AI Integration**: OpenAI SDK with multiple model support
- **State Management**: Svelte stores with localStorage persistence
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Project Structure
```
src/
├── lib/
│   ├── components/        # Reusable UI components
│   │   ├── Button.svelte
│   │   ├── TextArea.svelte
│   │   └── SettingsModal.svelte
│   ├── stores/           # Svelte stores for state management
│   │   └── settings.ts
│   ├── services/         # API services
│   │   └── openaiService.ts
│   └── utils/            # Utility functions
│       └── promptLoader.ts
├── routes/
│   ├── +layout.svelte
│   └── +page.svelte
└── static/
    └── prompts/          # Prompt template files
        └── bibtex-converter.txt
```

## Core Features

### 1. APA to BibTeX Conversion
- **Input**: APA 7th edition reference text
- **Output**: Valid BibTeX format
- **Processing**: AI-powered conversion using OpenAI models
- **Debouncing**: 1-second delay to avoid excessive API calls

### 2. Model Selection
- **Available Models**:
  - GPT-4.1 Mini (default)
  - GPT-5 Nano
- **Dynamic Selection**: Dropdown in settings modal
- **Footer Display**: Shows currently selected model

### 3. Settings Management
- **API Key Storage**: Secure localStorage persistence
- **Model Selection**: User-configurable AI model
- **Validation**: API key format validation and connection testing
- **Persistence**: Settings saved across browser sessions

### 4. User Interface
- **Two-column Layout**: Input (left) and Output (right)
- **Real-time Conversion**: Automatic conversion as user types
- **Copy to Clipboard**: One-click copy of BibTeX output
- **Loading States**: Visual feedback during conversion
- **Error Handling**: Clear error messages for all failure scenarios

## Component Details

### Button Component (`src/lib/components/Button.svelte`)
- **Variants**: primary, secondary, outline, ghost
- **Sizes**: sm, md, lg
- **Features**: Loading states, disabled states, accessibility support
- **Events**: Click handler with optional callback

### TextArea Component (`src/lib/components/TextArea.svelte`)
- **Features**: Label association, error states, configurable rows
- **Accessibility**: Proper label-input association
- **Validation**: Error display with red styling

### Settings Modal (`src/lib/components/SettingsModal.svelte`)
- **API Key Input**: Secure textarea for OpenAI API key
- **Model Selection**: Dropdown with available models
- **Validation**: Real-time API key testing
- **Persistence**: Settings saved to localStorage

## State Management

### Settings Store (`src/lib/stores/settings.ts`)
```typescript
interface Settings {
  apiKey: string;
  isConfigured: boolean;
  model: string;
}
```

**Available Models**:
- `gpt-4.1-mini` → "GPT-4.1 Mini" (default)
- `gpt-5-nano` → "GPT-5 Nano"

**Actions**:
- `setApiKey(apiKey: string)`: Set and validate API key
- `setModel(model: string)`: Set selected model
- `clearApiKey()`: Clear API key and reset configuration
- `validateApiKey(apiKey: string)`: Validate API key format

## API Integration

### OpenAI Service (`src/lib/services/openaiService.ts`)
**Features**:
- **Model Support**: Dynamic model selection from settings
- **Error Handling**: Comprehensive error messages for all scenarios
- **Retry Logic**: Exponential backoff for failed requests
- **Timeout**: 30-second request timeout
- **Response Cleaning**: Removes markdown code blocks from output

**Error Types Handled**:
- Invalid API key
- Rate limit exceeded
- Quota exceeded
- Network errors
- Timeout errors

## Prompt Engineering

### Conversion Prompt (`static/prompts/bibtex-converter.txt`)
**Key Rules**:
- Only use information provided in input text
- Do not invent new properties or fields
- Extract only explicitly stated information
- Proper BibTeX formatting and syntax

**Supported Entry Types**:
- @article (journal articles)
- @inproceedings (conference papers)
- @book (books)
- @incollection (book chapters)
- @phdthesis (doctoral theses)
- @mastersthesis (master's theses)
- @misc (other types)

## User Experience Features

### Accessibility
- **Semantic HTML**: Proper heading structure and landmarks
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper labels and ARIA attributes
- **Focus Management**: Visible focus indicators

### Performance
- **Debounced Input**: Prevents excessive API calls
- **Loading States**: Clear feedback during processing
- **Efficient Re-renders**: Optimized Svelte 5 reactivity
- **Code Splitting**: Dynamic imports for services

### Error Handling
- **Graceful Degradation**: Works without API key (with warning)
- **Clear Messages**: User-friendly error descriptions
- **Recovery Options**: Clear instructions for fixing issues
- **Validation**: Real-time input validation

## Configuration

### Environment Setup
- **Development Server**: `pnpm dev` (runs on port 5174)
- **Build**: `pnpm build`
- **Preview**: `pnpm preview`
- **Linting**: `pnpm lint` (ESLint + Prettier)
- **Type Checking**: `pnpm check` (TypeScript + Svelte)

### Dependencies
**Production**:
- `openai`: OpenAI SDK for API integration
- `tailwindcss`: CSS framework
- `@tailwindcss/vite`: Tailwind Vite plugin

**Development**:
- `@sveltejs/kit`: SvelteKit framework
- `svelte`: Svelte 5 runtime
- `typescript`: Type checking
- `vite`: Build tool
- `vitest`: Testing framework

## Usage Instructions

### First Time Setup
1. Open the application
2. Click "Settings" button
3. Enter OpenAI API key (starts with "sk-")
4. Select preferred model
5. Click "Save & Test"

### Converting References
1. Paste APA reference in left textarea
2. BibTeX output appears automatically in right textarea
3. Click "Copy" button to copy result to clipboard
4. Use "Clear All" to reset both text areas

### Supported Input Formats
- Standard APA 7th edition references
- Conference papers with DOI
- Journal articles
- Books and book chapters
- Theses and dissertations

## Technical Notes

### Svelte 5 Compatibility
- Uses `$state()` for reactive variables
- Uses `$derived()` for computed values
- Uses `$effect()` for side effects
- Uses `onclick` instead of `on:click`
- Proper runes mode implementation

### Security Considerations
- API keys stored only in localStorage (client-side)
- No sensitive data sent to external services except OpenAI
- Input sanitization for user-provided text
- No server-side storage of user data

### Browser Compatibility
- Modern browsers with ES2020+ support
- Requires JavaScript enabled
- Clipboard API for copy functionality
- localStorage for settings persistence

## Future Enhancements

### Potential Features
- Batch conversion for multiple references
- Export options (LaTeX, Word, etc.)
- Reference validation
- Citation style customization
- History of conversions
- Offline mode with cached responses

### Technical Improvements
- Service worker for offline functionality
- Progressive Web App (PWA) features
- Advanced error recovery
- Performance monitoring
- Analytics integration

## Troubleshooting

### Common Issues
1. **API Key Not Working**: Verify key format (starts with "sk-")
2. **No Response**: Check internet connection and API quota
3. **Conversion Errors**: Ensure input is valid APA reference
4. **Copy Not Working**: Check browser clipboard permissions

### Error Messages
- "OpenAI API key not configured": Set API key in settings
- "Invalid API key": Check key format and validity
- "Rate limit exceeded": Wait and try again
- "Network error": Check internet connection
- "Request timed out": Try again with shorter input

## Development Notes

### Code Quality
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Comprehensive error handling
- Accessibility compliance (WCAG)
- Performance optimized

### Testing
- Vitest for unit tests
- Component testing with Svelte testing utilities
- End-to-end testing capabilities
- Type checking with svelte-check

This application represents a complete, production-ready solution for academic reference conversion with modern web technologies and best practices.
