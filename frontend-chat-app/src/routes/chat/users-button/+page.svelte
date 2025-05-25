<script>
	import { enhance } from '$app/forms';

	let users = $state([]);

	function handleSubmit() {
		return async ({ result }) => {
			if (result.type === 'success') {
				users = result.data.users;
			}
		};
	}
</script>

<form method="POST" action="?/getUsers" use:enhance={handleSubmit}>
	<button class="btn btn-accent">Get all users</button>
</form>

{#if users.length > 0}
	<ul>
		{#each users as user (user.email)}
			<li>{user.name} ({user.email})</li>
		{/each}
	</ul>
{/if}
