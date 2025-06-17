import { env } from '$env/dynamic/private';

export const actions = {
	getUsers: async ({ locals }) => {
		const session = await locals.auth();

		const fetchUsers = await fetch(`${env.BACKEND_URL}/api/admin/users`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`
			}
		});

		if (!fetchUsers.ok) {
			return { error: 'Failed to fetch users' };
		}

		const users = await fetchUsers.json();

		return { users };
	}
};
