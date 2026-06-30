import { building } from '$app/environment';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.platform?.env) {
		event.locals.session = null;
		event.locals.user = null;
		return resolve(event);
	}

	const auth = createAuth(event.platform.env);
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.session = session?.session ?? null;
	event.locals.user = session?.user ?? null;

	return svelteKitHandler({
		event,
		resolve,
		auth,
		building
	});
};
