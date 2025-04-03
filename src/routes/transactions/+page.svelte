<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth/authStore';
	import { onMount } from 'svelte';

	let user: { id: string; email: string; name: string } | null = null;

	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/functions/_generated/api';

	const transactionsQuery = useQuery(api.transactions.getTransactions, {});

	onMount(() => {
		if (browser) {
			authStore.initialize();
		}

		const unsubscribe = authStore.subscribe((state) => {
			console.log('auth state changed:', state);
			user = state.user;

			if (!state.isLoading && !state.isAuthenticated) {
				goto('/login');
			}
		});

		return unsubscribe;
	});

	function handleLogout() {
		console.log('Logging out');
		authStore.logout();
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-2xl font-bold">Transactions</h1>

		<div class="flex items-center gap-4">
			{#if user}
				<div class="text-sm">Welcome, {user.name}</div>
			{/if}
			<button on:click={handleLogout} class="btn btn-sm btn-outline"> Logout </button>
		</div>
	</div>

	<div class="card bg-base-100 shadow-lg">
		<div class="card-body">
			<h2 class="card-title mb-4">Your Transactions</h2>

			<div class="alert alert-info">
				<span>This is a protected page. You are successfully authenticated.</span>
			</div>

			<div class="mt-4">
				{#if transactionsQuery.isLoading}
					Loading...
				{:else if transactionsQuery.error}
					failed to load: {transactionsQuery.error.toString()}
				{:else if transactionsQuery.data && transactionsQuery.data.length === 0}
					<p>No transactions found</p>
				{:else}
					<ul>
						{#each transactionsQuery.data as transaction}
							<li>
								<span>Amount: {transaction.amount}</span>
								<span>Description: {transaction.description}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
</div>
