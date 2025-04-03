<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { setupConvex } from 'convex-svelte';
	import '../app.css';

	const queryClient = new QueryClient();

	const { children } = $props();
	setupConvex(PUBLIC_CONVEX_URL);
</script>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
