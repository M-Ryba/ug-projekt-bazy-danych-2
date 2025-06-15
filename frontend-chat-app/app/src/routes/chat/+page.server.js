import { BACKEND_URL } from '$env/static/private';

export async function load() {
	return {
		wsUrl: BACKEND_URL
	};
}
