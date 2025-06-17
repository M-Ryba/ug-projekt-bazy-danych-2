import { SvelteKitAuth } from '@auth/sveltekit';
import Keycloak from '@auth/sveltekit/providers/keycloak';
import { jwtDecode } from 'jwt-decode';
import { env } from '$env/dynamic/private';
async function refreshKeycloakToken(refresh_token) {
	const params = new URLSearchParams();
	params.append('grant_type', 'refresh_token');
	params.append('client_id', env.KEYCLOAK_CLIENT_ID);
	params.append('client_secret', env.KEYCLOAK_CLIENT_SECRET);
	params.append('refresh_token', refresh_token);

	const response = await fetch(`${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params
	});
	if (!response.ok) throw new Error('Failed to refresh token');
	return response.json();
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Keycloak({
			clientId: env.KEYCLOAK_CLIENT_ID,
			clientSecret: env.KEYCLOAK_CLIENT_SECRET,
			issuer: env.KEYCLOAK_ISSUER,
			authorization: {
				params: {
					prompt: 'login'
				}
			}
		})
	],
	trustHost: true,
	callbacks: {
		// Add keycloak tokens to the session and jwt
		async session({ session, token }) {
			session.access_token = token.access_token;
			session.id_token = token.id_token;
			// Get user roles from access_token
			if (token.access_token) {
				const payload = jwtDecode(token.access_token);
				session.roles = payload.realm_access?.roles || [];
			}
			return session;
		},
		async jwt({ token, account }) {
			if (account) {
				token.access_token = account.access_token;
				token.id_token = account.id_token;
				token.refresh_token = account.refresh_token;
				token.expires_at = account.expires_at || (account.expires_in ? Math.floor(Date.now() / 1000) + account.expires_in : undefined);
			}
			// Refresh token if it is about to expire
			if (token.expires_at && Date.now() / 1000 > token.expires_at - 60 && token.refresh_token) {
				try {
					const refreshed = await refreshKeycloakToken(token.refresh_token);
					token.access_token = refreshed.access_token;
					token.id_token = refreshed.id_token;
					token.refresh_token = refreshed.refresh_token || token.refresh_token;
					token.expires_at = Math.floor(Date.now() / 1000) + refreshed.expires_in;
				} catch (e) {
					console.error('Error refreshing keycloak token:', e);
					token.error = 'RefreshTokenError';
				}
			}
			return token;
		}
	}
});
