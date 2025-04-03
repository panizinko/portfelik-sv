import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST handler for logout endpoint
 * Clears the auth token cookie
 */
export const POST: RequestHandler = async ({ cookies }) => {
	try {
		cookies.delete('auth_token', { path: '/' });

		return json({ success: true });
	} catch (error) {
		console.error('Error clearing auth cookie:', error);
		return json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
};
