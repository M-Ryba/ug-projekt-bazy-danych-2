<script>
	let { data } = $props();
	const { wsUrl } = data;
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
	import { page } from '$app/stores';
	import { m } from '$lib/paraglide/messages';

	const user = $page.data.user;
	const senderId = user.id;

	let socket;
	let message = $state('');
	let messages = $state([]);
	let chatId = $state(1);
	let editingId = $state(null);
	let editContent = $state('');

	onMount(() => {
		socket = io(wsUrl);

		socket.emit('join_chat', chatId);

		socket.on('chat_history', (history) => {
			messages = history;
		});

		socket.on('receive_message', (msg) => {
			messages = [...messages, msg];
		});

		socket.on('message_edited', (msg) => {
			messages = messages.map((message) => (message._id === msg._id ? msg : message));
		});

		socket.on('message_deleted', ({ messageId }) => {
			messages = messages.map((message) => (message._id === messageId ? { ...message, isDeleted: true, content: '' } : message));
		});
	});

	function sendMessage() {
		if (message.trim()) {
			const data = {
				chatId,
				senderId,
				content: message,
				type: 'text'
			};
			socket.emit('send_message', data);
			message = '';
		}
	}

	function startEdit(msg) {
		editingId = msg._id;
		editContent = msg.content;
	}

	function saveEdit(msg) {
		socket.emit('edit_message', { messageId: msg._id, senderId, content: editContent });
		editingId = null;
		editContent = '';
	}

	function deleteMessage(msg) {
		socket.emit('delete_message', { messageId: msg._id, senderId });
	}
</script>

<div class="bg-base-200 mx-auto mt-8 w-full max-w-xl rounded p-4 shadow">
	<h2 class="mb-4 text-2xl font-bold">{m.chat_room}: {chatId}</h2>
	<p class="mb-2 text-sm text-gray-500"></p>
	<div class="mb-4 flex h-80 flex-col gap-2 overflow-y-auto">
		{#each messages as msg (msg._id)}
			<div class="chat chat-{msg.senderId === senderId ? 'end' : 'start'}">
				<div class="chat-header flex items-center gap-2">
					<span class="font-semibold">{msg.senderId === senderId ? 'Ty' : msg.senderId}</span>
					{#if msg.isEdited}
						<span class="badge badge-xs badge-info">{m.edited}</span>
					{/if}
				</div>
				{#if msg.isDeleted}
					<div class="italic text-gray-400">()</div>
				{:else if editingId === msg._id}
					<input class="input input-bordered w-full" bind:value={editContent} />
					<button class="btn btn-success btn-xs ml-2" onclick={() => saveEdit(msg)}>{m.save}</button>
					<button class="btn btn-ghost btn-xs ml-2" onclick={() => (editingId = null)}>{m.cancel}</button>
				{:else}
					<div class="chat-bubble">{msg.content}</div>
				{/if}
				{#if msg.senderId === senderId && !msg.isDeleted}
					<div class="mt-1 flex gap-1">
						<button class="btn btn-xs btn-outline btn-info" onclick={() => startEdit(msg)}>{m.edit}</button>
						<button class="btn btn-xs btn-outline btn-error" onclick={() => deleteMessage(msg)}>{m.delete}</button>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="flex items-center gap-2">
		<input
			class="input input-bordered flex-1"
			type="text"
			bind:value={message}
			onkeydown={(e) => e.key === 'Enter' && sendMessage()}
			placeholder={m.message_box_placeholder}
		/>
		<button class="btn btn-primary" onclick={sendMessage}>{m.send}</button>
	</div>
</div>
