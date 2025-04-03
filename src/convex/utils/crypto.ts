/**
 * This is a simplified crypto utility for password hashing.
 * Convex has some limitations with external crypto libraries, so I'm using
 * a simple implementation here.
 */
function generateSalt(length = 16): string {
	return Array.from({ length })
		.map(() => Math.floor(Math.random() * 36).toString(36))
		.join('');
}

export async function hash(password: string): Promise<string> {
	const salt = generateSalt();
	const hashedPwd = await simulateHash(password, salt);
	return `${salt}:${hashedPwd}`;
}

export async function compare(password: string, storedHash: string): Promise<boolean> {
	const [salt, hash] = storedHash.split(':');

	if (!salt || !hash) {
		return false;
	}

	const hashedPwd = await simulateHash(password, salt);
	return hashedPwd === hash;
}

async function simulateHash(text: string, salt: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(salt + text);

	const hashBuffer = await crypto.subtle.digest('SHA-256', data);

	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
