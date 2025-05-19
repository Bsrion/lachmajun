<script>

	import { onMount } from 'svelte';

	let customers = $state([]);
	let sortKey = 'id';
	let sortAsc = $state(true);
	let searchQuery = $state('');

	async function fetchCustomers() {
		try {
			const url = searchQuery.length >= 1
				? `https://dilen-digital.co.il/api/customers_list.php?q=${encodeURIComponent(searchQuery)}`
				: `https://dilen-digital.co.il/api/customers_list.php`;

			const res = await fetch(url);
			const data = await res.json();
			customers = data;
			sortBy(sortKey, true);
		} catch (err) {
			console.error('Error fetching customers:', err);
		}
	}
function getSortSymbol(key) {
	if (key !== sortKey) return '';
	return sortAsc ? '↑' : '↓';
}

function sortBy(key, preserveDirection = false) {
	if (!preserveDirection) {
		if (sortKey === key) sortAsc = !sortAsc;
		else {
			sortKey = key;
			sortAsc = true;
		}
	}

	customers.sort((a, b) => {
		const aVal = a[key] ?? '';
		const bVal = b[key] ?? '';

		// For phone numbers and any text, always use string comparison
		return sortAsc
			? String(aVal).localeCompare(String(bVal), 'he')
			: String(bVal).localeCompare(String(aVal), 'he');
	});

	customers = [...customers]; // trigger reactivity
}




	onMount(fetchCustomers);
</script>

<div class='serchInput'>
		<input
		type="text"
		bind:value={searchQuery}
		placeholder="🔍 חפש לקוח לפי שם..."
		oninput={fetchCustomers}
	/>
</div>
<div class="container">
	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th onclick={() => sortBy('id')}># {getSortSymbol('id')}</th>
					<th onclick={() => sortBy('firstName')}>שם פרטי {getSortSymbol('firstName')}</th>
					<th onclick={() => sortBy('lastName')}>שם משפחה {getSortSymbol('lastName')}</th>
					<th onclick={() => sortBy('phone')}>טלפון {getSortSymbol('phone')}</th>
					<th onclick={() => sortBy('email')}>אימייל {getSortSymbol('email')}</th>
					<th onclick={() => sortBy('address')}>כתובת {getSortSymbol('address')}</th>
				</tr>
			</thead>
			<tbody>
				{#each customers as customer}
					<tr>
						<td>{customer.id}</td>
						<td>{customer.firstName}</td>
						<td>{customer.lastName}</td>
						<td>{customer.phone}</td>
						<td>{customer.email}</td>
						<td>{customer.address}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.container {
		max-width: 1000px;
		height: 80vh;
		overflow: auto;
		margin: 5rem auto;
		padding: 1rem;
		direction: rtl;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		color: #333;
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid #e0e0e0;
		border-radius: 10px;
		box-shadow: 0 1px 5px rgba(0,0,0,0.05);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 700px;
	}

	th, td {
		padding: 1em;
		text-align: right;
		white-space: nowrap;
	}

	th {
		background-color: #f4f4f4;
		cursor: pointer;
		position: sticky;
		top: 0;
		z-index: 1;
		user-select: none;
		font-weight: bold;
		border-bottom: 1px solid #ddd;
	}

	td {
		border-bottom: 1px solid #eee;
	}

	tr:hover {
		background-color: #fafafa;
	}
.serchInput{
	display: flex;
	justify-content: center;
	max-width: 1000px;
	margin: 100px auto;
	position: sticky;
	top:0px;
	z-index: 100;
}
	input {
		padding: 0.75em 1em;
		margin-bottom: 1.5em;
		width: 100%;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.05);
	}
	@media (max-width: 768px) {
		td, th {
			font-size: 0.9rem;
		}
	}
</style>
