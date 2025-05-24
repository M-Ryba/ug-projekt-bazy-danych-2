import { paraglideMiddleware } from '$lib/paraglide/server';
import { handle as handleAuth } from './auth.server';

const handleParaglide = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle = async (event) => {
	const authHandled = await handleAuth(event, async (eventAfterAuth) => {
		return handleParaglide({ event: eventAfterAuth, resolve: event.resolve });
	});
	return authHandled;
};
