import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	transactions: defineTable({
		amount: v.number(),
		description: v.string(),
		createdAt: v.string(),
		userId: v.id('users')
	})
});
