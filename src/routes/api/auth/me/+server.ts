import { json } from '@sveltejs/kit';
import { verifyJWT } from '../../../../convex/utils/jwt';
import type { RequestHandler } from './$types';

/**
 * GET handler for me endpoint
 * Verifies the JWT token in the cookie and returns user data
 */
export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const token = cookies.get('auth_token');

		if (!token) {
			return json({ authenticated: false }, { status: 401 });
		}

		try {
			const payload = verifyJWT(token);

			return json({
				id: payload.userId,
				email: payload.email,
				name: payload.name
			});
		} catch (error) {
			console.error('Token validation failed:', error);
			cookies.delete('auth_token', { path: '/' });
			return json({ authenticated: false, message: 'Invalid or expired token' }, { status: 401 });
		}
	} catch (error) {
		console.error('Error checking authentication:', error);
		return json({ authenticated: false, message: 'Internal server error' }, { status: 500 });
	}
};
