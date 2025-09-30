import OpenAI from 'openai';
import { loadPromptTemplate } from '$lib/utils/promptLoader';
import { settingsStore } from '$lib/stores/settings';

export interface ConversionResult {
	success: boolean;
	bibtex?: string;
	error?: string;
}

export interface OpenAIServiceConfig {
	apiKey: string;
	model?: string;
	maxRetries?: number;
	timeout?: number;
}

export class OpenAIService {
	private client: OpenAI | null = null;
	private config: OpenAIServiceConfig;
    private resultCache: Map<string, string> = new Map();
    private inflightAbortController: AbortController | null = null;

	constructor(config: Partial<OpenAIServiceConfig> = {}) {
		// Get model from settings store if not provided
		let model = config.model || 'gpt-5-nano';
		if (!config.model) {
			let settingsModel = '';
			settingsStore.subscribe((settings) => {
				settingsModel = settings.model;
			})();
			model = settingsModel || 'gpt-5-nano';
		}

		this.config = {
			model,
			maxRetries: 3,
			timeout: 30000,
			apiKey: config.apiKey || '',
			...config
		};
	}

	/**
	 * Initialize the OpenAI client with the provided API key
	 */
	private initializeClient(apiKey: string): void {
		this.client = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true // Required for client-side usage
		});
	}

	/**
	 * Convert APA reference to BibTeX using OpenAI
	 */
	async convertToBibTeX(apaReference: string): Promise<ConversionResult> {
		// Check if API key is configured
		let apiKey = '';
		settingsStore.subscribe((settings) => {
			apiKey = settings.apiKey;
		})();

		if (!apiKey) {
			return {
				success: false,
				error: 'OpenAI API key not configured. Please set your API key in settings.'
			};
		}

		// Initialize client if not already done
		if (!this.client) {
			this.initializeClient(apiKey);
		}

		// Validate input
		if (!apaReference.trim()) {
			return {
				success: false,
				error: 'Please provide an APA reference to convert.'
			};
		}

		try {
            // Fast path: return cached result if available
            const cached = this.resultCache.get(apaReference.trim());
            if (cached) {
                return { success: true, bibtex: cached };
            }
			// Load prompt template
			const promptTemplate = await loadPromptTemplate();

			// Create the full prompt
			const fullPrompt = `${promptTemplate}\n\nConvert this APA reference to BibTeX:\n\n${apaReference}`;

			// Make API call with retry logic
			const bibtexResult = await this.makeAPIRequest(fullPrompt);

            // Cache successful results
            if (bibtexResult) {
                this.resultCache.set(apaReference.trim(), bibtexResult);
            }

			return {
				success: true,
				bibtex: bibtexResult
			};
		} catch (error) {
			console.error('Error converting reference:', error);
			return {
				success: false,
				error: this.getErrorMessage(error)
			};
		}
	}

    /**
     * Cancel any in-flight OpenAI request
     */
    public cancelInFlight(): void {
        if (this.inflightAbortController) {
            try {
                this.inflightAbortController.abort();
            } catch {
                // ignore
            }
            this.inflightAbortController = null;
        }
    }

	/**
	 * Make API request to OpenAI with retry logic
	 */
    private async makeAPIRequest(prompt: string, attempt: number = 1): Promise<string> {
		if (!this.client) {
			throw new Error('OpenAI client not initialized');
		}

		try {
            // Abort any previous request and create a new controller
            this.cancelInFlight();
            const abortController = new AbortController();
            this.inflightAbortController = abortController;

            const timeoutId = setTimeout(() => {
                try {
                    abortController.abort();
                } catch {
                    // ignore
                }
            }, this.config.timeout);

            const completion = await this.client.chat.completions.create(
                {
                    model: this.config.model!,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 400,
                    temperature: 0.1 // Low temperature for consistent formatting
                },
                { signal: abortController.signal }
            );

            clearTimeout(timeoutId);
            // Clear controller after completion
            this.inflightAbortController = null;

			const content = completion.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response content received from OpenAI');
			}

			// Clean up the response (remove markdown code blocks if present)
			return this.cleanBibTeXResponse(content);
        } catch (error) {
			// Retry logic
			if (attempt < (this.config.maxRetries || 3)) {
				console.warn(`API request failed (attempt ${attempt}), retrying...`, error);
				await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
				return this.makeAPIRequest(prompt, attempt + 1);
			}
			throw error;
		}
	}

	/**
	 * Clean up BibTeX response from OpenAI
	 */
	private cleanBibTeXResponse(response: string): string {
		// Remove markdown code blocks if present
		let cleaned = response.replace(/```bibtex\s*/gi, '').replace(/```\s*$/gi, '');

		// Trim whitespace
		cleaned = cleaned.trim();

		return cleaned;
	}

	/**
	 * Get user-friendly error message from error object
	 */
	private getErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			// Handle specific OpenAI errors
			if (error.message.includes('API key')) {
				return 'Invalid API key. Please check your OpenAI API key in settings.';
			}
			if (error.message.includes('timeout')) {
				return 'Request timed out. Please try again.';
			}
			if (error.message.includes('rate limit')) {
				return 'Rate limit exceeded. Please wait a moment and try again.';
			}
			if (error.message.includes('insufficient_quota')) {
				return 'API quota exceeded. Please check your OpenAI billing.';
			}
			if (error.message.includes('network') || error.message.includes('fetch')) {
				return 'Network error. Please check your internet connection and try again.';
			}
			return error.message;
		}
		return 'An unexpected error occurred. Please try again.';
	}

	/**
	 * Test if the API key is valid
	 */
	async testConnection(): Promise<boolean> {
		let apiKey = '';
		settingsStore.subscribe((settings) => {
			apiKey = settings.apiKey;
		})();

		if (!apiKey) {
			return false;
		}

		if (!this.client) {
			this.initializeClient(apiKey);
		}

		try {
			await this.client?.models.list();
			return true;
		} catch {
			return false;
		}
	}
}
