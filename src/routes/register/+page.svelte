<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth/authStore';
	import { createMutation } from '@tanstack/svelte-query';
	import { useConvexClient } from 'convex-svelte';
	import { onMount } from 'svelte';
	import { api } from '../../convex/functions/_generated/api';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let formError = '';

	const client = useConvexClient();

	const registerMutation = createMutation({
		mutationFn: async ({
			name,
			email,
			password
		}: {
			name: string;
			email: string;
			password: string;
		}) => {
			return client.mutation(api.auth.register, { name, email, password });
		},
		onSuccess: (data) => {
			if (data.success) {
				setTimeout(() => {
					goto('/login');
				}, 2000);
			}
		}
	});

	async function handleRegister() {
		formError = '';

		if (!name || !email || !password || !confirmPassword) {
			formError = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			formError = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			formError = 'Password must be at least 8 characters long';
			return;
		}

		$registerMutation.mutate({ name, email, password });
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
			<h2 class="text-2xl font-bold text-center mb-6">Create an account</h2>

			{#if formError}
				<div class="alert alert-error mb-4">
					<span>{formError}</span>
				</div>
			{/if}

			{#if $registerMutation.isError}
				<div class="alert alert-error mb-4">
					<span>An error occurred during registration</span>
				</div>
			{/if}

			{#if $registerMutation.data && !$registerMutation.data.success}
				<div class="alert alert-error mb-4">
					<span>{$registerMutation.data.message || 'Registration failed'}</span>
				</div>
			{/if}

			{#if $registerMutation.data && $registerMutation.data.success}
				<div class="alert alert-success mb-4">
					<span>Registration successful! Redirecting to login...</span>
				</div>
			{/if}

			<form on:submit|preventDefault={handleRegister} class="flex flex-col gap-4">
				<div class="form-control">
					<label for="name" class="label">
						<span class="label-text">Full Name</span>
					</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						class="input input-bordered"
						disabled={$registerMutation.isPending}
						placeholder="John Doe"
					/>
				</div>

				<div class="form-control">
					<label for="email" class="label">
						<span class="label-text">Email</span>
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="input input-bordered"
						disabled={$registerMutation.isPending}
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
						disabled={$registerMutation.isPending}
						placeholder="Min. 8 characters"
					/>
				</div>

				<div class="form-control">
					<label for="confirmPassword" class="label">
						<span class="label-text">Confirm Password</span>
					</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={confirmPassword}
						class="input input-bordered"
						disabled={$registerMutation.isPending}
						placeholder="Confirm your password"
					/>
				</div>

				<div class="form-control mt-4">
					<button type="submit" class="btn btn-primary" disabled={$registerMutation.isPending}>
						{#if $registerMutation.isPending}
							<span class="loading loading-spinner loading-sm mr-2"></span>
							Creating Account...
						{:else}
							Register
						{/if}
					</button>
				</div>

				<div class="text-center text-sm mt-2 text-gray-500">
					<p>
						Already have an account?
						<a href="/login" class="text-primary hover:underline">Login</a>
					</p>
				</div>
			</form>
		</div>
	</div>
</div>
