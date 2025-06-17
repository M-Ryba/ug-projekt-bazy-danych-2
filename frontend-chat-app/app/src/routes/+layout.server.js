import { env } from '$env/dynamic/private';

export async function load(event) {
	const session = await event.locals.auth();

	let user = null;
	if (session?.access_token) {
		try {
			const res = await event.fetch(`${env.BACKEND_URL}/api/users/me`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${session.access_token}`
				}
			});
			if (res.ok) {
				user = await res.json();
			}
		} catch (e) {
			console.error('Error downloading user data:', e);
		}
	}

	return {
		session,
		user
	};
}
