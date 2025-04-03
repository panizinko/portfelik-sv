import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST handler for login endpoint
 * Receives JWT token from client and sets it as an HttpOnly cookie
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const data = await request.json();
		const { token } = data;

		if (!token) {
			return json({ success: false, message: 'Token is required' }, { status: 400 });
		}

		cookies.set('auth_token', token, {
			httpOnly: true,
			secure: import.meta.env.PROD,
			sameSite: 'strict',
			path: '/',
			maxAge: 60 * 60 * 24
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error setting auth cookie:', error);
		return json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
};
