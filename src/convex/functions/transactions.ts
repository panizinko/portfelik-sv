import { query } from './_generated/server';

export const getTransactions = query({
	args: {},
	handler: async (ctx) => {
		const transactions = await ctx.db.query('transactions').collect();
		return transactions;
	}
});
