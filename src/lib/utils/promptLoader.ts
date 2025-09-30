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
		// Server-side fallback to optimized template
		return getOptimizedPromptTemplate();
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
		// Fallback to optimized template
		cachedPromptTemplate = getOptimizedPromptTemplate();
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


function getOptimizedPromptTemplate(): string {
	return `
Developer: You are an expert at converting APA 7th edition references into BibTeX format.

Rules:
- Use only the information present in the input; do not invent or infer missing fields.
- Leave out any BibTeX fields that cannot be clearly determined from the input.
- Extract only explicitly provided details.

Conversion Instructions:
1. For each author, format as "Lastname, Firstname".
2. Extract the title, omitting any quotation marks.
3. Identify the correct BibTeX entry type (e.g., article, book, inproceedings, etc.).
4. Extract available fields: year, pages, DOI, and other provided metadata.
5. Generate a BibTeX entry with the appropriate type and relevant fields.

After forming the BibTeX entry, validate that all braces are correctly matched and that only fields supported by the input are present. If required information is missing or ambiguous, proceed conservatively and exclude those fields.

BibTeX Entry Types:
- @article for journal articles
- @inproceedings for conference papers
- @book for books
- @incollection for book chapters
- @phdthesis for doctoral theses
- @mastersthesis for master's theses
- @misc for other cases

Month Formatting:
- Convert full month names to their 3-letter lowercase abbreviation: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec

Output:
- Return only the properly formatted BibTeX entry, and nothing else
- Adhere to BibTeX syntax:
  - All field names in lowercase
  - Ensure all braces are matched

Example:
Input:
Lee, H. P., Sarkar, A., Tankelevitch, L., Drosos, I., Rintel, S., Banks, R., & Wilson, N. (2025, April). The impact of generative AI on critical thinking: Self-reported reductions in cognitive effort and confidence effects from a survey of knowledge workers. In Proceedings of the 2025 CHI conference on human factors in computing systems (pp. 1-22).

Output:
@inproceedings{lee2025impact,
  title={The impact of generative AI on critical thinking: Self-reported reductions in cognitive effort and confidence effects from a survey of knowledge workers},
  author={Lee, Hao-Ping and Sarkar, Advait and Tankelevitch, Lev and Drosos, Ian and Rintel, Sean and Banks, Richard and Wilson, Nicholas},
  booktitle={Proceedings of the 2025 CHI conference on human factors in computing systems},
  pages={1--22},
  year={2025}
}
	`;
}




// Module-local cache
let cachedPromptTemplate: string | null = null;
