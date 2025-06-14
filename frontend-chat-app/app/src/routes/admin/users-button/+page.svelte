<script>
	import { enhance } from '$app/forms';
	const { form } = $props();

	const users = $derived(form?.users || []);
</script>

<form method="POST" action="?/getUsers" use:enhance>
	<button class="btn btn-accent mb-10">Get all users</button>
</form>

{#if users.length > 0}
	<ul>
		{#each users as user (user.email)}
			<li>{user.username} ({user.email})</li>
		{/each}
	</ul>
{/if}
