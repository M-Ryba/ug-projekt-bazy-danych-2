import { SvelteKitAuth } from '@auth/sveltekit';
import Keycloak from '@auth/sveltekit/providers/keycloak';
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, KEYCLOAK_ISSUER } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Keycloak({
			clientId: KEYCLOAK_CLIENT_ID,
			clientSecret: KEYCLOAK_CLIENT_SECRET,
			issuer: KEYCLOAK_ISSUER
		})
	],
	callbacks: {
		// Adding keycloak tokens to the session and jwt
		async session({ session, token }) {
			session.access_token = token.access_token;
			session.id_token = token.id_token;
			return session;
		},
		async jwt({ token, account }) {
			if (account) {
				token.access_token = account.access_token;
				token.id_token = account.id_token;
			}
			return token;
		}
	}
});
