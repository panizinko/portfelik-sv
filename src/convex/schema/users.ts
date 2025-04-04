import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		email: v.string(),
		password: v.string(),
		name: v.string(),
		createdAt: v.string()
	})
});
