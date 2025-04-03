<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth/authStore';
	import { createMutation } from '@tanstack/svelte-query';
	import { useConvexClient } from 'convex-svelte';
	import { onMount } from 'svelte';
	import { api } from '../../convex/functions/_generated/api';

	let email = '';
	let password = '';
	let formError = '';

	const client = useConvexClient();

	const loginMutation = createMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			try {
				const authResult = await client.mutation(api.auth.login, { email, password });

				if (authResult.success && authResult.token) {
					const response = await fetch('/api/auth/login', {
						method: 'POST',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ token: authResult.token })
					});

					if (response.ok) {
						return authResult;
					} else {
						throw new Error('Failed to set authentication cookie');
					}
				}

				return authResult;
			} catch (error) {
				console.error('Login error:', error);
				throw error;
			}
		},
		onSuccess: (data) => {
			if (data.success && data.user) {
				authStore.login(data.user);
				goto('/transactions');
			}
		}
	});

	async function handleLogin() {
		if (!email || !password) {
			formError = 'Please enter both email and password';
			return;
		}

		formError = '';
		$loginMutation.mutate({ email, password });
	}

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			if (state.isAuthenticated) {
				goto('/transactions');
			}
		});

		return unsubscribe;
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200">
	<div class="card w-full max-w-md bg-base-100 shadow-lg">
		<div class="card-body">
			<h2 class="text-2xl font-bold text-center mb-6">Login to your account</h2>

			{#if formError}
				<div class="alert alert-error mb-4">
					<span>{formError}</span>
				</div>
			{/if}

			{#if $loginMutation.isError}
				<div class="alert alert-error mb-4">
					<span>An error occurred during login</span>
				</div>
			{/if}

			{#if $loginMutation.data && !$loginMutation.data.success}
				<div class="alert alert-error mb-4">
					<span>{$loginMutation.data.message || 'Invalid credentials'}</span>
				</div>
			{/if}

			<form on:submit|preventDefault={handleLogin} class="flex flex-col gap-4">
				<div class="form-control">
					<label for="email" class="label">
						<span class="label-text">Email</span>
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="input input-bordered"
						disabled={$loginMutation.isPending}
						placeholder="user@example.com"
					/>
				</div>

				<div class="form-control">
					<label for="password" class="label">
						<span class="label-text">Password</span>
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="input input-bordered"
						disabled={$loginMutation.isPending}
						placeholder="Enter your password"
					/>
				</div>

				<div class="form-control mt-4">
					<button type="submit" class="btn btn-primary" disabled={$loginMutation.isPending}>
						{#if $loginMutation.isPending}
							<span class="loading loading-spinner loading-sm mr-2"></span>
							Logging in...
						{:else}
							Login
						{/if}
					</button>
				</div>

				<div class="text-center text-sm mt-2 text-gray-500">
					<p>
						<a href="/register" class="text-primary hover:underline">Create an account</a>
					</p>
				</div>
			</form>
		</div>
	</div>
</div>
