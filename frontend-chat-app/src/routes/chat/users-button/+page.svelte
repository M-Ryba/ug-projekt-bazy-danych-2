<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	const users = $derived($page.form?.users || []);
</script>

<form method="POST" action="?/getUsers" use:enhance>
	<button class="btn btn-accent mb-10">Get all users</button>
</form>

{#if users.length > 0}
	<ul>
		{#each users as user (user.email)}
			<li>{user.name} ({user.email})</li>
		{/each}
	</ul>
{/if}
