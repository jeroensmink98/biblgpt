<script lang="ts">
	interface Props {
		placeholder?: string;
		value?: string;
		rows?: number;
		disabled?: boolean;
		readonly?: boolean;
		class?: string;
		error?: string;
		label?: string;
		id?: string;
		oninput?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
	}

	let {
		placeholder = '',
		value = $bindable(''),
		rows = 4,
		disabled = false,
		readonly = false,
		class: className = '',
		error = '',
		label = '',
		id = '',
		oninput,
		onkeydown,
		...restProps
	}: Props = $props();

	// Base classes
	const baseClasses =
		'flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

	// Error state classes
	let classes = $derived(
		[baseClasses, error && 'border-red-500 focus-visible:ring-red-500', className]
			.filter(Boolean)
			.join(' ')
	);

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
		oninput?.(event);
	}

	function handleKeyDown(event: KeyboardEvent) {
		onkeydown?.(event);
	}
</script>

<div class="space-y-2">
	{#if label}
		<label for={id} class="text-sm font-medium text-gray-700">
			{label}
		</label>
	{/if}

	<div class="relative">
		<textarea
			{placeholder}
			{rows}
			{disabled}
			{readonly}
			{id}
			class={classes}
			bind:value
			oninput={handleInput}
			onkeydown={handleKeyDown}
			{...restProps}
		></textarea>
	</div>

	{#if error}
		<p class="text-sm text-red-600">
			{error}
		</p>
	{/if}
</div>
