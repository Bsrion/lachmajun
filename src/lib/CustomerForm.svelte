<script>
	import { createEventDispatcher } from 'svelte';
	import {fade, scale } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	const { customer = {}, isEdit = false } = $props();

	let message = $state('');
	let errorDetails = $state('');

	

	let formData = $state({
		firstName: '',
		lastName: '',
		phone: '',
		phone2: '',
		email: '',
		address: '',
		comment: '',
		userName: '',
		userPassword: ''
	});

	$effect(() => {
		if (customer) {
			Object.assign(formData, customer);
			if (isEdit && customer.id) {
				formData.id = customer.id;
			}
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();

		message = '';
		errorDetails = '';

		try {
			const url = isEdit
				? `https://dilen-digital.co.il/api/update_customer.php?id=${customer.id}`
				: `https://dilen-digital.co.il/api/customers.php`;

			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const text = await res.text();
			const result = JSON.parse(text);
			message = result.message;

		if (result.success) {
			dispatch('save', { updatedCustomer: formData });
				dispatch('cancel');
		}
		} catch (err) {
			console.error(err);
			errorDetails = err.message;
			message = 'שגיאה בשליחת הטופס';
		}
	};
	// scroll in the table with arrows

</script>
<div class="form-wrapper" out:scale={{ duration: 350, easing: t => t * t }} in:scale={{ duration: 350, delay: 50, easing: t => t * t }}>
		<button type="button" onclick={() => dispatch('cancel')} class="close-btn">❌ &nbsp סגור ללא שמירה</button>
	<h2>טופס לקוח חדש / עדכון / עריכה</h2>
			<br>
			<button type="button" onclick={() => dispatch('cancel')} class="close-btn">❌ &nbsp סגור ללא שמירה</button>

<form 	

		onsubmit={handleSubmit} class="form-container" aria-label="Customer Form">

	<label>
		<span>שם פרטי *</span>
		<input bind:value={formData.firstName} placeholder="הכנס שם פרטי" required autocomplete="given-name" />
	</label>

	<label>
		<span>שם משפחה</span>
		<input bind:value={formData.lastName} placeholder="הכנס שם משפחה" autocomplete="family-name" />
	</label>

	<label>
		<span>טלפון *</span>
		<input bind:value={formData.phone} placeholder="050-1234567" required autocomplete="tel" />
	</label>

	<label>
		<span>טלפון נוסף</span>
		<input bind:value={formData.phone2} placeholder="טלפון נוסף" autocomplete="tel" />
	</label>

	<label>
		<span>אימייל</span>
		<input type="email" bind:value={formData.email} placeholder="email@example.com" autocomplete="email" />
	</label>

	<label>
		<span>כתובת *</span>
		<input bind:value={formData.address} placeholder="כתובת מגורים" required autocomplete="street-address" />
	</label>

	<label>
		<span>הערה</span>
		<input bind:value={formData.comment} placeholder="הערות נוספות" />
	</label>

	<label>
		<span>שם משתמש</span>
		<input bind:value={formData.userName} placeholder="שם משתמש (אם רלוונטי)" />
	</label>

	<label>
		<span>סיסמה</span>
		<input type="password" bind:value={formData.userPassword} placeholder="סיסמה" />
	</label>

	<button type="submit">{isEdit ? 'עדכן' : 'שמור'}</button>

	{#if message}
		<p class="success">{message}</p>
	{/if}
	{#if errorDetails}
		<p class="error">{errorDetails}</p>
	{/if}
</form>
</div>
<style>
	.form-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
		padding: 1rem;
		background: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		position: relative;
	}
	.form-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		width: clamp(550px, 50vw, 800px);	;
		gap: 5px 20px;
		margin: 2rem auto;
		padding: 2rem;
		background: #f9f9f9;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		direction: rtl;
		font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
	}

	h2 {
		text-align: center;
		color: #2c3e50;
		margin-bottom: 1.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		margin-bottom: 1.25rem;
		color: #34495e;
		font-weight: 600;
	}

	label span {
		margin-bottom: 0.4rem;
		font-size: 0.95rem;
	}

	input {
		padding: 0.5em 0.75em;
		border: 1.8px solid #ccc;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.25s ease;
	}

	input:focus {
		outline: none;
		border-color: #3498db;
		box-shadow: 0 0 8px rgba(52, 152, 219, 0.25);
	}

	button {
		width: 75%;
		place-self: center;
		 padding: 10px 20px;
		 font-size: 1.2rem;
    border: none;
    background: #000000;
    color: white;
    border: solid 1px #000000;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
		
	}

	button:hover {
background: #ffffff;
    border: solid 1px #000000;
    color: #000000;	}

	p {
		margin-top: 1rem;
		text-align: center;
		font-size: 1rem;
	}

	.success-message {
		color: #27ae60;
		font-weight: 600;
	}

	.error-message {
		color: #e74c3c;
		font-weight: 600;
	}

	.error-details {
		margin-top: 0.5rem;
		color: #c0392b;
		font-size: 0.85rem;
		white-space: pre-wrap;
		background: #fcebea;
		padding: 0.5rem;
		border-radius: 5px;
	}
	.close-btn {
		position: absolute;
		top: 5%;
		right: 5%;
		width: fit-content;
		background: none;
		border: none;
		font-size: 0.75rem;
		cursor: pointer;
		color: #e74c3c;
		background-color: #f2f2f2;
		box-shadow: 0 2px 4px rgba(0,0,0,0.15);
	}
	@media screen and (max-width:550px){
.form-container {
		display: flex;
		flex-direction: column;
		max-width: 450px;
		gap: 5px 20px;
}
	}
</style>
