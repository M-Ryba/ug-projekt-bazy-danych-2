<script>
	import { goto } from '$app/navigation';
</script>

<button class="btn btn-accent mb-10" onclick={() => goto('/admin/users')}>Users list</button>
<button class="btn btn-warning mb-10" onclick={() => goto('/admin/users-button')}>Users list (manual)</button>
