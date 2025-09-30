<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	import TextArea from './TextArea.svelte';
	import { settingsStore, settingsActions, availableModels } from '$lib/stores/settings';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	const dispatch = createEventDispatcher();

	let apiKey = $state('');
	let selectedModel = $state('');
	let error = $state('');
	let isValidating = $state(false);

	// Subscribe to settings store to get current settings
	$effect(() => {
		const unsubscribe = settingsStore.subscribe((settings) => {
			apiKey = settings.apiKey;
			selectedModel = settings.model;
		});
		return unsubscribe;
	});

	async function handleSave() {
		error = '';

		// Basic validation
		if (!apiKey.trim()) {
			error = 'API key is required';
			return;
		}

		if (!settingsActions.validateApiKey(apiKey)) {
			error = 'Invalid API key format. OpenAI API keys should start with "sk-"';
			return;
		}

		isValidating = true;

		try {
			// Save the API key and model
			settingsActions.setApiKey(apiKey);
			settingsActions.setModel(selectedModel);

			// Test the connection
			const { OpenAIService } = await import('$lib/services/openaiService');
			const openaiService = new OpenAIService();

			const isValid = await openaiService.testConnection();

			if (isValid) {
				dispatch('success', { message: 'API key saved and validated successfully!' });
				open = false;
			} else {
				error = 'Invalid API key. Please check your OpenAI API key.';
			}
		} catch (err) {
			error = 'Failed to validate API key. Please check your key and try again.';
			console.error('API key validation error:', err);
		} finally {
			isValidating = false;
		}
	}

	function handleClose() {
		open = false;
		error = '';
		// Don't reset form - keep current values
	}

	function handleBackdropClick() {
		handleClose();
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Enter' && handleBackdropClick()}
		role="button"
		tabindex="-1"
	></div>

	<!-- Modal -->
	<div
		class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-6"
	>
		<div class="relative rounded-lg bg-white shadow-lg">
			<!-- Header -->
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-lg font-semibold text-gray-900">Settings</h2>
				<button
					onclick={handleClose}
					class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					aria-label="Close modal"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				<div class="space-y-4">
					<div>
						<label for="api-key" class="block text-sm font-medium text-gray-700">
							OpenAI API Key
						</label>
						<p class="mt-1 text-sm text-gray-500">
							Your API key is stored locally and never sent to our servers.
						</p>
					</div>

					<TextArea
						id="api-key"
						placeholder="sk-..."
						bind:value={apiKey}
						rows={3}
						{error}
						disabled={isValidating}
					/>

					<div>
						<label for="model-select" class="block text-sm font-medium text-gray-700">
							Model
						</label>
						<select
							id="model-select"
							bind:value={selectedModel}
							disabled={isValidating}
							class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#each availableModels as model}
								<option value={model.value}>{model.label}</option>
							{/each}
						</select>
						<p class="mt-1 text-sm text-gray-500">Choose the AI model for BibTeX conversion.</p>
					</div>

					<div class="flex gap-3 pt-4">
						<Button
							variant="primary"
							loading={isValidating}
							disabled={isValidating}
							onclick={handleSave}
						>
							{isValidating ? 'Validating...' : 'Save & Test'}
						</Button>
						<Button variant="outline" onclick={handleClose}>Cancel</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
