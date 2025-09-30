import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
	apiKey: string;
	isConfigured: boolean;
	model: string;
}

const SETTINGS_KEY = 'biblgpt-settings';

// Available models
export const availableModels = [
	{ value: 'gpt-5-nano', label: 'GPT-5 Nano' },
];

// Default settings
const defaultSettings: Settings = {
	apiKey: '',
	isConfigured: false,
	model: 'gpt-5-nano'
};

// Create the writable store
export const settingsStore = writable<Settings>(defaultSettings);

// Load settings from localStorage on initialization
if (browser) {
	const stored = localStorage.getItem(SETTINGS_KEY);
	if (stored) {
		try {
			const parsedSettings = JSON.parse(stored);
			settingsStore.set({
				...defaultSettings,
				...parsedSettings
			});
		} catch (error) {
			console.error('Failed to parse stored settings:', error);
		}
	}
}

// Subscribe to store changes and save to localStorage
if (browser) {
	settingsStore.subscribe((settings) => {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	});
}

// Actions for updating settings
export const settingsActions = {
	setApiKey: (apiKey: string) => {
		settingsStore.update((settings) => ({
			...settings,
			apiKey,
			isConfigured: apiKey.trim().length > 0
		}));
	},

	setModel: (model: string) => {
		settingsStore.update((settings) => ({
			...settings,
			model
		}));
	},

	clearApiKey: () => {
		settingsStore.update((settings) => ({
			...settings,
			apiKey: '',
			isConfigured: false
		}));
	},

	validateApiKey: (apiKey: string): boolean => {
		// Basic validation - OpenAI API keys start with 'sk-'
		return apiKey.trim().startsWith('sk-') && apiKey.trim().length > 20;
	}
};

// Helper function to check if settings are configured
export const isConfigured = (): boolean => {
	if (!browser) return false;

	let isConfigured = false;
	settingsStore.subscribe((settings) => {
		isConfigured = settings.isConfigured;
	})();
	return isConfigured;
};
