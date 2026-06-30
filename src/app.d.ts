// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, User } from 'better-auth';

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
			user: User | null;
		}

		interface Platform {
			env: Env & {
				BETTER_AUTH_SECRET: string;
				BETTER_AUTH_URL: string;
				GITHUB_CLIENT_ID: string;
				GITHUB_CLIENT_SECRET: string;
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
