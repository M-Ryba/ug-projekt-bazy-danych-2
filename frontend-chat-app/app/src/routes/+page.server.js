import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.getSession();
	console.log('Roles:', session?.roles);

	if (session?.roles?.includes('admin')) {
		// If user is an admin, redirect to /admin
		throw redirect(303, '/admin');
	}
	if (session?.user) {
		// If user is authenticated, redirect to /chat
		throw redirect(303, '/chat');
	}
}
