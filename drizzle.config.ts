import { defineConfig } from 'drizzle-kit';
import process from 'node:process';

export default defineConfig({
	schema: ['./src/lib/server/auth-schema.ts', './src/lib/server/progress-schema.ts'],
	out: './drizzle',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
		databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? '',
		token: process.env.CLOUDFLARE_API_TOKEN ?? ''
	}
});
