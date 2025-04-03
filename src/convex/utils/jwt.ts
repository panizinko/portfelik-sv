/**
 * JWT utility functions for token generation and verification.
 */

const JWT_SECRET = 'my_secure_jwt_secret_key_should_be_long_and_random';
const TOKEN_EXPIRATION = 24 * 60 * 60;

interface JWTPayload {
	userId: string;
	email: string;
	name: string;
	exp?: number;
	iat?: number;
}

export function generateJWT(payload: JWTPayload): string {
	const now = Math.floor(Date.now() / 1000);
	const exp = now + TOKEN_EXPIRATION;

	const tokenPayload = {
		...payload,
		iat: now,
		exp
	};

	const header = {
		alg: 'HS256',
		typ: 'JWT'
	};

	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

	const signature = createSignature(`${encodedHeader}.${encodedPayload}`);

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify a JWT token and return the payload if valid
 * Throws an error if the token is invalid
 */
export function verifyJWT(token: string): JWTPayload {
	try {
		const [encodedHeader, encodedPayload, signature] = token.split('.');

		if (!encodedHeader || !encodedPayload || !signature) {
			throw new Error('Invalid token format');
		}

		const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`);
		if (signature !== expectedSignature) {
			throw new Error('Invalid token signature');
		}

		const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;

		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) {
			throw new Error('Token has expired');
		}

		return payload;
	} catch (error) {
		throw new Error('Invalid token: ' + (error instanceof Error ? error.message : 'unknown error'));
	}
}

/**
 * Utility function to create a simple signature
 */
function createSignature(data: string): string {
	const encoder = new TextEncoder();
	const key = encoder.encode(JWT_SECRET);
	const message = encoder.encode(data);

	let signature = '';
	for (let i = 0; i < message.length; i++) {
		signature += ((message[i] ^ key[i % key.length]) + 65).toString(36);
	}

	return base64UrlEncode(signature);
}

/**
 * Base64Url encode a string
 */
function base64UrlEncode(str: string): string {
	return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64Url decode a string
 */
function base64UrlDecode(str: string): string {
	str = str.replace(/-/g, '+').replace(/_/g, '/');
	while (str.length % 4) {
		str += '=';
	}

	return atob(str);
}
