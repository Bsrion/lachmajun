<script>
	let formData = $state({
		firstName:'',
		lastName: '',
		phone: '',
		phone2: '',
		email: '',
		address: '',
		comment: '',
		userName: '',
		userPassword: ''
	});

	let message = $state('');
	let errorDetails = $state('');

	async function submitForm(e) {
		e.preventDefault();
		message = '';
		errorDetails = '';

		try {
			const response = await fetch('https://dilen-digital.co.il/api/customers.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const text = await response.text(); 
			console.log('Server response:', text);

			let result;
			try {
				result = JSON.parse(text);
			} catch (jsonErr) {
				throw new Error('Invalid JSON from server. Raw: ' + text);
			}

			message = result.message;

			if (result.success) {
				formData = {
					firstName: '',
					lastName: '',
					phone: '',
					phone2: '',
					email: '',
					address: '',
					comment: '',
					userName: '',
					userPassword: ''
				};
			}
		} catch (err) {
			console.error('❌ submitForm error:', err);
			message = '⚠ שגיאה בשליחת הטופס לשרת';
			errorDetails = err.message;
		}
	}
</script>
	<h2>טופס לקוח חדש</h2>

<form onsubmit={submitForm} class="form-container" aria-label="Customer Form">
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

	<button type="submit">שמור</button>

	{#if message}
		<p class:success-message={message.includes('שמור')} class:error-message={!message.includes('שמור')}>
			{message}
		</p>
	{/if}

	{#if errorDetails}
		<pre class="error-details">{errorDetails}</pre>
	{/if}
</form>

<style>
	.form-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		max-width: 800px;
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
		width: 50%;
		place-self: center;
		background-color: #3498db;
		color: white;
		padding: 0.75rem 0;
		font-size: 1.1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 700;
		letter-spacing: 0.03em;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #2980b9;
	}

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
	@media screen and (max-width:550px){
.form-container {
		display: flex;
		flex-direction: column;
		max-width: 450px;
		gap: 5px 20px;
}
	}
</style>
