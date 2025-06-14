<script>
	export let data;
	const { users } = data;
</script>

<h1>Lista użytkowników</h1>

{#if users.length > 0}
	<ul>
		{#each users as user (user.email)}
			<li>{user.username} ({user.email})</li>
		{/each}
	</ul>
{:else}
	<p>No users</p>
{/if}
