<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import CustomerForm from '../lib/CustomerForm.svelte';

  const dispatch = createEventDispatcher();

  let customers = $state([]);
  let sortKey = $state('id');
  let sortAsc = $state(true);
  let searchQuery = $state('');
  let selectedCustomer = $state(null);
  let showForm = $state(false);

  const sortedCustomers = $derived.by(() => {
	const list = customers;
	const key = sortKey;
	const asc = sortAsc;

	return [...list].sort((a, b) => {
		const aVal = a[key] ?? '';
		const bVal = b[key] ?? '';

		// Try to convert to numbers
		const aNum = parseFloat(aVal);
		const bNum = parseFloat(bVal);

		const bothAreNumbers = !isNaN(aNum) && !isNaN(bNum);

		if (bothAreNumbers) {
			return asc ? aNum - bNum : bNum - aNum;
		} else {
			return asc
				? String(aVal).localeCompare(String(bVal), 'he')
				: String(bVal).localeCompare(String(aVal), 'he');
		}
	});
});



  async function fetchCustomers() {
    try {
      const q = searchQuery;
      const url = q.length >= 1
        ? `https://dilen-digital.co.il/api/customers_list.php?q=${encodeURIComponent(q)}`
        : `https://dilen-digital.co.il/api/customers_list.php`;

      const res = await fetch(url);
      const data = await res.json();
      customers = data;
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  }

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedFetch = debounce(fetchCustomers, 300);

  function sortBy(key) {
	if (sortKey === key) {
		sortAsc = !sortAsc;
	} else {
		sortKey = key;
		sortAsc = true;
	}
}


 function getSortSymbol(key) {
	if (key !== sortKey) return '';
	return sortAsc ? '↑' : '↓';
}


 function onRowDblClick(customer) {
	selectedCustomer = customer;
	showForm = true;
}

function onAddClick() {
	selectedCustomer =- null;
	showForm = true;
}

function onCloseForm(event) {
	showForm = false;
	selectedCustomer = null;
	if (event.detail?.updated) {
		fetchCustomers();
	}
}

function updateCustomerInList(updated) {
	const index = customers.findIndex(c => c.id === updated.id);
	if (index !== -1) {
		const updatedList = [...customers];
		updatedList[index] = { ...updatedList[index], ...updated };
		customers = updatedList;
	}
}

  onMount(fetchCustomers);
</script>


<!-- Blurred background when form is open -->
<div class:blurred={showForm}>
  <!-- Search and Add -->
  <div class="serchInput">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="🔍 חפש לקוח לפי שם..."
      oninput={() => debouncedFetch()}
    />
    <button onclick={onAddClick}>+ לקוח חדש</button>
  </div>

  <!-- Table -->
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
         {#each sortedCustomers as customer (customer.id)}
	<tr ondblclick={() => onRowDblClick(customer)} style="cursor: pointer;">
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
</div>

<!-- Form -->
{#if showForm}
  <div class="edit-form-container">
    <CustomerForm
      customer={selectedCustomer}
      isEdit={selectedCustomer !== null}
      on:save={(e) => updateCustomerInList(e.detail.updatedCustomer)}
      on:cancel={onCloseForm}
    />
  </div>
{/if}


<style>
.blurred {
  filter: blur(5px);
  transition: filter 0.3s ease;
}

.edit-form-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-form-container > * {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.edit-form-container{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
  }

  .edit-form-container > * {
	background-color: white;
	padding: 2rem;
	border-radius: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  }
  .container {
    max-width: 1000px;
    height: 80vh;
    overflow: auto;
    margin: 0.2rem auto 5rem auto;
    padding: 0.2rem;
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

  .serchInput {
    display: flex;
    gap: 1rem;
    justify-content: center;
    max-width: 1000px;
    margin: 0 auto 0 auto;
    position: sticky;
    top: 0px;
    z-index: 100;
  }

  input {
    padding: 0.75em 1em;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    flex: 1;
  }

  button {
    padding: 0.75em 1.5em;
    font-size: 1rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  button:hover {
    background-color: #218838;
  }
</style>
