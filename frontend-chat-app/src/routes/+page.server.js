import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.getSession();
	if (session?.user) {
		// If user is authenticated, redirect to /chat
		throw redirect(303, '/chat');
	}
}
