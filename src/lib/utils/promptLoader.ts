import { browser } from '$app/environment';

/**
 * Loads the BibTeX conversion prompt template from static assets
 * @returns Promise<string> The prompt template content
 */
export async function loadPromptTemplate(): Promise<string> {
    // Simple in-memory cache to avoid refetching between conversions
    // Note: module-level variable persists while the page/app is loaded
    if (cachedPromptTemplate) {
        return cachedPromptTemplate;
    }
	if (!browser) {
		// Server-side fallback
		return getDefaultPromptTemplate();
	}

	try {
		const response = await fetch('/prompts/bibtex-converter.txt');

		if (!response.ok) {
			throw new Error(`Failed to load prompt template: ${response.status}`);
		}

        const text = await response.text();
        cachedPromptTemplate = text.trim();
        return cachedPromptTemplate;
	} catch (error) {
		console.error('Error loading prompt template:', error);
		// Fallback to default template
        cachedPromptTemplate = getDefaultPromptTemplate();
        return cachedPromptTemplate;
	}
}

/**
 * Returns the default prompt template as fallback
 */
function getDefaultPromptTemplate(): string {
	return `You are an expert academic reference converter. Your task is to convert APA 7th edition references to BibTeX format.

IMPORTANT RULES:
- Only use the information provided in the input text
- Do not invent or add any new properties, fields, or information
- If a required BibTeX field cannot be determined from the input, omit it rather than guessing
- Extract only what's explicitly stated in the reference

CONVERSION GUIDELINES:
1. Extract author names and format as "Lastname, Firstname" for each author
2. Extract the title (remove any quotes if present)
3. Determine the publication type (article, book, inproceedings, etc.)
4. Extract year, pages, DOI, and other available metadata
5. Generate appropriate BibTeX entry type and fields

BIBTEX ENTRY TYPES TO USE:
- @article for journal articles
- @inproceedings for conference papers
- @book for books
- @incollection for book chapters
- @phdthesis for doctoral theses
- @mastersthesis for master's theses
- @misc for other types

MONTH FORMATTING:
- Convert month names to 3-letter format: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec

OUTPUT FORMAT:
- Return only the BibTeX entry, nothing else
- Use proper BibTeX syntax and formatting
- Ensure all braces are properly matched
- Use lowercase for field names`;
}

// Module-local cache
let cachedPromptTemplate: string | null = null;
