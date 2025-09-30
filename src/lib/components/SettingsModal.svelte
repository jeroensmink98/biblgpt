<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
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
		<div class="relative rounded-lg bg-neutral-900/90 border border-white/10 shadow-xl">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-white/10 p-4">
				<h2 class="text-lg font-semibold text-neutral-100">Settings</h2>
				<button
					onclick={handleClose}
					class="text-neutral-400 hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-950"
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
						<label for="api-key" class="block text-sm font-medium text-neutral-200">
							OpenAI API Key
						</label>
						<p class="mt-1 text-sm text-neutral-400">
							Your API key is stored locally and never sent to our servers.
						</p>
					</div>

					<input
						id="api-key"
						type="password"
						placeholder="sk-..."
						autocomplete="new-password"
						class="mt-1 block w-full rounded-md border border-white/15 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed {error ? 'border-red-500 focus:ring-red-500' : ''}"
						bind:value={apiKey}
						disabled={isValidating}
					/>
					{#if error}
						<p class="mt-1 text-sm text-red-600">{error}</p>
					{/if}

					<div>
						<label for="model-select" class="block text-sm font-medium text-neutral-200">
							Model
						</label>
						<select
							id="model-select"
							bind:value={selectedModel}
							disabled={isValidating}
							class="mt-1 block w-full rounded-md border border-white/15 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#each availableModels as model}
								<option value={model.value}>{model.label}</option>
							{/each}
						</select>
						<p class="mt-1 text-sm text-neutral-400">Choose the AI model for BibTeX conversion.</p>
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
