<script>
	import { m } from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	const passwordPattern = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}';
	let username = '';
	let email = '';
	let password = '';
</script>

<h1>{m.greeting()}</h1>

<div class="authForm">
	<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
		<legend class="fieldset-legend">{m.register()}</legend>

		<label class="label" for="username">{m.username()}</label>
		<input
			id="username"
			type="text"
			class="input validator"
			required
			placeholder="Username"
			pattern="[A-Za-z][A-Za-z0-9\-]*"
			minlength="3"
			maxlength="30"
			title="Only letters, numbers or dash"
			bind:value={username}
		/>
		<p class="validator-hint">Must be 3 to 30 characters (letters, numbers or dash)</p>

		<label class="label" for="email">Email</label>
		<input id="email" class="input validator" type="email" required placeholder="joe@example.com" bind:value={email} />
		<div class="validator-hint">{m.invalid_email()}</div>

		<label class="label" for="password">{m.password()}</label>
		<input
			type="password"
			class="input validator"
			required
			placeholder={m.password()}
			minlength="8"
			pattern={passwordPattern}
			title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
			bind:value={password}
		/>
		<p class="validator-hint">
			Must be more than 8 characters, including
			<br />At least one number
			<br />At least one lowercase letter
			<br />At least one uppercase letter
		</p>

		<button
			class="btn btn-neutral mt-4"
			onclick={() => {
				const email = document.getElementById('email').value;
				goto(`/login?registerRedirect=true&email=${encodeURIComponent(email)}`);
			}}>{m.register()}</button
		>
	</fieldset>

	<div class="textAndButton">
		<span>{m.already_have_account()}</span>
		<button class="btn btn-secondary ml-2" onclick={() => goto('/login')}>{m.login()}</button>
	</div>
</div>
