import { env } from '$env/dynamic/private';

export async function load() {
	return {
		wsUrl: env.BACKEND_URL
	};
}
