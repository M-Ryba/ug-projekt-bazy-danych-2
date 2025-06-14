import { BACKEND_URL } from '$env/static/private';

export async function load(event) {
	const session = await event.locals.auth();

	const fetchUsers = await event.fetch(`${BACKEND_URL}/api/admin/users`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${session.access_token}`
		}
	});

	if (!fetchUsers.ok) {
		return { error: 'Failed to fetch users' };
	}

	const users = await fetchUsers.json();

	return {
		users
	};
}
