<script lang="ts">
	import { onMount } from 'svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import Button from '$lib/components/Button.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import { settingsStore, availableModels } from '$lib/stores/settings';
	import { OpenAIService, type ConversionResult } from '$lib/services/openaiService';

	// State management
	let inputText = $state('');
	let outputText = $state('');
	let isConverting = $state(false);
	let error = $state('');
	let settingsOpen = $state(false);
	let successMessage = $state('');

	// Services
	let openaiService: OpenAIService;

	// Settings state
	let isConfigured = $state(false);
	let currentModel = $state('GPT-5 Nano');

	// Subscribe to settings changes
	$effect(() => {
		const unsubscribe = settingsStore.subscribe((settings) => {
			isConfigured = settings.isConfigured;
			// Find the display name for the current model
			const modelInfo = availableModels.find((m) => m.value === settings.model);
			currentModel = modelInfo ? modelInfo.label : 'GPT-5 Nano';
		});
		return unsubscribe;
	});

	onMount(() => {
		openaiService = new OpenAIService();
	});

	// Debounced conversion function
	let conversionTimeout: number;
	function debouncedConvert() {
		clearTimeout(conversionTimeout);
		conversionTimeout = window.setTimeout(() => {
			// Cancel the previous API call (if any) before issuing a new one
			openaiService?.cancelInFlight?.();
			convertReference();
		}, 500);
	}

	async function convertReference() {
		if (!inputText.trim()) {
			outputText = '';
			error = '';
			return;
		}

		if (!isConfigured) {
			error = 'Please configure your OpenAI API key in settings first.';
			return;
		}

		isConverting = true;
		error = '';

		try {
			const result: ConversionResult = await openaiService.convertToBibTeX(inputText);

			if (result.success) {
				outputText = result.bibtex || '';
				error = '';
			} else {
				outputText = '';
				error = result.error || 'Conversion failed. Please try again.';
			}
		} catch (err) {
			console.error('Conversion error:', err);
			outputText = '';
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			isConverting = false;
		}
	}

	async function copyToClipboard() {
		if (!outputText.trim()) {
			return;
		}

		try {
			await navigator.clipboard.writeText(outputText);
			successMessage = 'Copied to clipboard!';
			setTimeout(() => {
				successMessage = '';
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
			error = 'Failed to copy to clipboard.';
			setTimeout(() => {
				error = '';
			}, 2000);
		}
	}

	function clearAll() {
		inputText = '';
		outputText = '';
		error = '';
		successMessage = '';
	}

	function handleSettingsSuccess(event: CustomEvent) {
		successMessage = event.detail.message;
		setTimeout(() => {
			successMessage = '';
		}, 3000);
	}
</script>

<svelte:head>
	<title>BiblGPT - APA to BibTeX Converter</title>
	<meta
		name="description"
		content="Convert APA 7 references to BibTeX format using AI-powered conversion"
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center">
					<h1 class="text-xl font-bold text-gray-900">BiblGPT</h1>
					<span class="ml-2 text-sm text-gray-500">APA to BibTeX Converter</span>
				</div>
				<div class="flex items-center gap-4">
					{#if !isConfigured}
						<div class="flex items-center gap-2 text-amber-600">
							<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								></path>
							</svg>
							<span class="text-sm">API key required</span>
						</div>
					{/if}
					<Button variant="outline" size="sm" onclick={() => (settingsOpen = true)}>
						<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							></path>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							></path>
						</svg>
						Settings
					</Button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Input section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">APA Reference Input</h2>
					<Button variant="outline" size="sm" onclick={clearAll}>Clear All</Button>
				</div>

				<TextArea
					placeholder="Paste your APA 7 reference here...&#10;&#10;Example:&#10;Decan, A., Mens, T., & Constantinou, E. (2018, September). On the evolution of technical lag in the npm package dependency network. In 2018 IEEE International Conference on Software Maintenance and Evolution (ICSME) (pp. 404-414). IEEE."
					bind:value={inputText}
					rows={12}
					oninput={debouncedConvert}
					label="APA Reference"
				/>

				{#if isConverting}
					<div class="flex items-center gap-2 text-sm text-gray-600">
						<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Converting with AI...
					</div>
				{/if}
			</div>

			<!-- Output section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">BibTeX Output</h2>
					{#if outputText}
						<Button variant="outline" size="sm" onclick={copyToClipboard}>
							<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								></path>
							</svg>
							Copy
						</Button>
					{/if}
				</div>

				<TextArea
					placeholder="Your BibTeX output will appear here..."
					bind:value={outputText}
					rows={12}
					readonly={true}
					label="BibTeX Output"
					class="font-mono text-sm"
				/>
			</div>
		</div>

		<!-- Status messages -->
		{#if error}
			<div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
				<div class="flex items-center gap-2">
					<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						></path>
					</svg>
					<p class="text-sm text-red-700">{error}</p>
				</div>
			</div>
		{/if}

		{#if successMessage}
			<div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
				<div class="flex items-center gap-2">
					<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						></path>
					</svg>
					<p class="text-sm text-green-700">{successMessage}</p>
				</div>
			</div>
		{/if}

		<!-- Footer -->
		<footer class="mt-12 text-center text-sm text-gray-500">
			<p>Powered by OpenAI {currentModel}</p>
			<p>
				Made with <span aria-label="love" role="img">❤️</span> by
				<a
					href="https://github.com/jeroensmink98"
					class="underline hover:text-gray-700"
					target="_blank"
					rel="noopener noreferrer"
				>
					Jeroen Smink
				</a>
			</p>
		</footer>
	</main>
</div>

<!-- Settings Modal -->
<SettingsModal bind:open={settingsOpen} on:success={handleSettingsSuccess} />
