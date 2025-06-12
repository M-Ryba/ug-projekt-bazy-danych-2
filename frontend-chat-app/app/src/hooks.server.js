import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { handle as authenticationHandle } from './auth.server';

const paraglideHandle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

async function authorizationHandle({ event, resolve }) {
	// Protect any routes under /chat
	if (event.url.pathname.startsWith('/chat')) {
		const session = await event.locals.auth();
		if (!session) {
			// Redirect to the signin page
			throw redirect(303, '/');
		}
	}

	// Protect /admin route (users with admin role only)
	if (event.url.pathname.startsWith('/admin')) {
		const session = await event.locals.auth();
		if (!session || !session.roles?.includes('admin')) {
			throw redirect(303, '/');
		}
	}

	// If the request is still here, just proceed as normally
	return resolve(event);
}

// First handle authentication, then authorization, paraglide at the end
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle = sequence(authenticationHandle, authorizationHandle, paraglideHandle);
