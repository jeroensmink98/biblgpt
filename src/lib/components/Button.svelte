<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		class: className = '',
		onclick,
		children,
		...restProps
	}: Props = $props();

	const dispatch = createEventDispatcher();

	// Base classes
	const baseClasses =
		'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	// Variant classes
	const variantClasses = {
		primary: 'bg-blue-600 text-white hover:bg-blue-500',
		secondary: 'bg-neutral-700 text-white hover:bg-neutral-600',
		outline: 'border border-white/20 bg-transparent text-neutral-100 hover:bg-white/5',
		ghost: 'text-neutral-300 hover:bg-white/5 hover:text-white'
	};

	// Size classes
	const sizeClasses = {
		sm: 'h-8 px-3 text-sm rounded-md',
		md: 'h-10 px-4 py-2 text-sm rounded-md',
		lg: 'h-12 px-8 text-base rounded-lg'
	};

	// Combine all classes
	let classes = $derived(
		[
			baseClasses,
			variantClasses[variant],
			sizeClasses[size],
			loading && 'cursor-not-allowed',
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<button
	{type}
	{disabled}
	class={classes}
	onclick={(e) => {
		if (!disabled && !loading) {
			onclick?.(e);
			dispatch('click', e);
		}
	}}
	{...restProps}
>
	{#if loading}
		<svg
			class="animate-spin -ml-1 mr-2 h-4 w-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{@render children?.()}
</button>
