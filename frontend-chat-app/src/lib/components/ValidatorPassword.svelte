<script>
	import { m } from '$lib/paraglide/messages';
	const passwordPattern = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}';
</script>

<input
	type="password"
	class="input validator"
	required
	placeholder={m.password()}
	minlength="8"
	pattern={passwordPattern}
	title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
/>
<p class="validator-hint">
	Must be more than 8 characters, including
	<br />At least one number
	<br />At least one lowercase letter
	<br />At least one uppercase letter
</p>
