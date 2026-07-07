import { drizzle } from 'drizzle-orm/d1';
import * as authSchema from '$lib/server/auth-schema';
import * as progressSchema from '$lib/server/progress-schema';

export function createDb(db: D1Database) {
	return drizzle(db, { schema: { ...authSchema, ...progressSchema } });
}
