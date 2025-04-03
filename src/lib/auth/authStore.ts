import { browser } from '$app/environment';
import { writable } from 'svelte/store';

interface AuthState {
	isAuthenticated: boolean;
	userId: string | null;
	user: {
		id: string;
		email: string;
		name: string;
	} | null;
	isLoading: boolean;
}

const initialState: AuthState = {
	isAuthenticated: false,
	userId: null,
	user: null,
	isLoading: true
};

function createAuthStore() {
	const state = { ...initialState };

	const { subscribe, set, update } = writable<AuthState>(state);

	const initialize = async () => {
		if (browser) {
			try {
				const response = await fetch('/api/auth/me', {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (response.ok) {
					const userData = await response.json();
					update((state) => ({
						...state,
						isAuthenticated: true,
						userId: userData.id,
						user: userData,
						isLoading: false
					}));
				} else {
					set({ ...initialState, isLoading: false });
				}
			} catch (error) {
				console.error('Error checking authentication status:', error);
				set({ ...initialState, isLoading: false });
			}
		} else {
			set({ ...initialState, isLoading: false });
		}
	};

	initialize();

	return {
		subscribe,

		login: (userData: { id: string; email: string; name: string }) => {
			update((state) => ({
				...state,
				isAuthenticated: true,
				userId: userData.id,
				user: userData,
				isLoading: false
			}));
		},

		logout: async () => {
			if (browser) {
				try {
					await fetch('/api/auth/logout', {
						method: 'POST',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json'
						}
					});
				} catch (error) {
					console.error('Error during logout:', error);
				}
			}

			set({
				...initialState,
				isLoading: false
			});
		},

		setUser: (userData: { id: string; email: string; name: string } | null) => {
			update((state) => ({
				...state,
				user: userData,
				isAuthenticated: !!userData,
				isLoading: false
			}));
		},

		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, isLoading }));
		},

		initialize
	};
}

export const authStore = createAuthStore();
