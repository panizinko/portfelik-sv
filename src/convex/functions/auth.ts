import { ConvexError, v } from 'convex/values';
import { compare, hash } from '../utils/crypto';
import { generateJWT, verifyJWT } from '../utils/jwt';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const register = mutation({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.string()
	},
	handler: async (ctx, args) => {
		const existingUser = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.first();

		if (existingUser) {
			throw new ConvexError('User with this email already exists');
		}

		const hashedPassword = await hash(args.password);

		const userId = await ctx.db.insert('users', {
			email: args.email,
			password: hashedPassword,
			name: args.name,
			createdAt: new Date().toISOString()
		});

		return {
			success: true,
			message: 'User registered successfully',
			userId
		};
	}
});

export const login = mutation({
	args: {
		email: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.unique();

		if (!user) {
			return { success: false, message: 'Invalid email or password' };
		}

		const passwordMatch = await compare(args.password, user.password);
		if (!passwordMatch) {
			return { success: false, message: 'Invalid email or password' };
		}

		const token = generateJWT({
			userId: user._id,
			email: user.email,
			name: user.name
		});

		return {
			success: true,
			user: {
				id: user._id,
				email: user.email,
				name: user.name
			},
			token
		};
	}
});

export const verifyToken = mutation({
	args: {
		token: v.string()
	},
	handler: async (ctx, args) => {
		try {
			// Verify the JWT token
			const payload = verifyJWT(args.token);

			// Check if user still exists in database
			const user = await ctx.db.get(payload.userId as Id<'users'>);

			if (!user) {
				return { success: false, message: 'User not found' };
			}

			return {
				success: true,
				user: {
					id: user._id,
					email: user.email,
					name: user.name
				}
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Invalid or expired token'
			};
		}
	}
});

export const getCurrentUser = query({
	args: {
		userId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		if (!args.userId) {
			return null;
		}

		try {
			const user = await ctx.db.get(args.userId as Id<'users'>);
			if (!user) {
				return null;
			}
			return {
				id: user._id,
				email: user.email,
				name: user.name
			};
		} catch (error) {
			console.error('Error fetching user:', error);
			return null;
		}
	}
});
