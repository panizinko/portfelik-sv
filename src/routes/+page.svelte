<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth/authStore';
	import { onMount } from 'svelte';

	let isLoading = true;

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			isLoading = state.isLoading;
			if (!state.isLoading && state.isAuthenticated) {
				goto('/transactions');
			} else {
				goto('/login');
			}
		});

		return unsubscribe;
	});
</script>

<div class="flex items-center justify-center min-h-screen bg-base-200">
	{#if isLoading}
		<div class="flex flex-col items-center">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="mt-4 text-base-content">Loading the account...</p>
		</div>
	{/if}
</div>
