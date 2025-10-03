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

	// Debug: Log state changes only when validating
	$effect(() => {
		if (isValidating) {
			console.log('SettingsModal validating state:', {
				apiKey: apiKey.length > 0 ? '[HIDDEN]' : '',
				isValidating,
				showApiKey,
				error: error || 'none'
			});
		}
	});
	let showApiKey = $state(false);

	// Subscribe to settings store to get current settings
	$effect(() => {
		const unsubscribe = settingsStore.subscribe((settings) => {
			// Only update if the modal is not open to avoid overriding user input
			if (!open) {
				// Assign only when values actually change to avoid effect loops
				if (apiKey !== settings.apiKey) {
					apiKey = settings.apiKey;
				}

				const incomingModel = settings.model;
				const isIncomingValid = availableModels.some((m) => m.value === incomingModel);
				if (!selectedModel) {
					selectedModel = isIncomingValid ? incomingModel : availableModels[0]?.value || '';
				} else if (isIncomingValid && selectedModel !== incomingModel) {
					selectedModel = incomingModel;
				} else if (!isIncomingValid && !availableModels.some((m) => m.value === selectedModel)) {
					selectedModel = availableModels[0]?.value || '';
				}
			}
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

	function handlePaste(event: ClipboardEvent) {
		// Ensure paste events work properly
		event.stopPropagation();
		// Let the default paste behavior work
		console.log('Paste event triggered');
	}

	function toggleApiKeyVisibility() {
		showApiKey = !showApiKey;
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		console.log('Input event:', {
			value: target.value,
			apiKey,
			isValidating,
			disabled: target.disabled
		});
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

					<div class="relative">
						<input
							id="api-key"
							type="text"
							placeholder="sk-..."
							autocomplete="new-password"
							class="mt-1 block w-full rounded-md border border-white/15 bg-neutral-950 px-3 py-2 pr-12 text-sm text-white placeholder:text-neutral-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-neutral-400"
							class:border-red-500={error}
							class:focus:ring-red-500={error}
							bind:value={apiKey}
							disabled={isValidating}
							oninput={handleInput}
							onpaste={handlePaste}
						/>
						<button
							type="button"
							onclick={toggleApiKeyVisibility}
							class="absolute inset-y-0 right-0 flex items-center justify-center w-8 text-neutral-400 hover:text-neutral-200 focus:outline-none"
							class:pointer-events-none={isValidating}
							disabled={isValidating}
						>
							{#if showApiKey}
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
									></path>
								</svg>
							{:else}
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									></path>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									></path>
								</svg>
							{/if}
						</button>
					</div>
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
