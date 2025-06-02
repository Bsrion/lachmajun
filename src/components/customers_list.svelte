<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import CustomerForm from '../lib/CustomerForm.svelte';

  const { customer = null, isEdit = false } = $props();
  const dispatch = createEventDispatcher();

  let customers = $state([]);
  let searchQuery = $state('');
  let sortKey = $state('id');
  let sortAsc = $state(true);
  let selectedCustomer = $state(null);
  let showForm = $state(false);
  let selectedIndex = $state(0);
  let tableRef;

  // Fetch customers
  async function fetchCustomers() {
    try {
      const q = searchQuery.trim();
      const url =
        q.length >= 1
          ? `https://dilen-digital.co.il/api/customers_list.php?q=${encodeURIComponent(q)}`
          : `https://dilen-digital.co.il/api/customers_list.php`;
      const res = await fetch(url);
      const data = await res.json();
      customers = data;
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  }

  // Debounced fetch
  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }
  const debouncedFetch = debounce(fetchCustomers, 300);

  // Filter + sort
  const filteredCustomers = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter(cust => {
      const combined = [
        cust.firstName, cust.lastName, cust.phone, cust.email, cust.address
      ].filter(Boolean).join(' - ').toLowerCase();

      const customerWords = combined.split(/[\s\-\,]+/).filter(Boolean);

      return q
        .split(/\s+/)
        .filter(Boolean)
        .every(word =>
          customerWords.some(fieldWord => fieldWord.trim().startsWith(word))
        );
    });
  });

  const sortedCustomers = $derived.by(() => {
    const list = filteredCustomers;
    const key = sortKey;
    const asc = sortAsc;
    return [...list].sort((a, b) => {
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      const bothAreNumbers = !isNaN(aNum) && !isNaN(bNum);
      if (bothAreNumbers) {
        return asc ? aNum - bNum : bNum - aNum;
      }
      return asc
        ? String(aVal).localeCompare(String(bVal), 'he')
        : String(bVal).localeCompare(String(aVal), 'he');
    });
  });

  // Sorting UI
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
    return sortAsc ? '▲' : '▼';
  }

  // Row UI
  function onRowDblClick(customer) {
    selectedCustomer = customer;
    showForm = true;
  }
  function onAddClick() {
    selectedCustomer = null;
    showForm = true;
  }
  function onCloseForm(event) {
    showForm = false;
    selectedCustomer = null;
    if (event.detail?.updated) fetchCustomers();
  }
  function updateCustomerInList(updated) {
    const index = customers.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      const updatedList = [...customers];
      updatedList[index] = { ...updatedList[index], ...updated };
      customers = updatedList;
    }
  }
  // Keyboard nav
  function handleKeyDown(event) {
    const total = sortedCustomers.length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (selectedIndex < total - 1) selectedIndex++;
      scrollToRow();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (selectedIndex > 0) selectedIndex--;
      scrollToRow();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (sortedCustomers[selectedIndex]) {
        selectedCustomer = sortedCustomers[selectedIndex];
        showForm = true;
      }
    }
  }
  function scrollToRow() {
    const rows = tableRef?.querySelectorAll('tbody tr');
    const selectedRow = rows?.[selectedIndex];
    if (selectedRow) {
      selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  function onRowMouseOver(index) {
    selectedIndex = index;
  }

  // Mount
  onMount(fetchCustomers);
  $effect(() => {
    debouncedFetch();
  });
</script>

<!-- UI -->
<div class:blurred={showForm}>
  <div class="search-bar sticky-top">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="🔍 חפש לקוח לפי שם..."
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      aria-label="חפש לקוח"
    />
    <button onclick={onAddClick}>+ לקוח חדש</button>
  </div>
  <div
    class="container"
    bind:this={tableRef}
    role="region"
    aria-label="Customer list"
  >
    <div class="table-wrapper" role="presentation">
      <table>
        <thead>
          <tr>
            <th><button type="button" onclick={() => sortBy('id')}># {getSortSymbol('id')}</button></th>
            <th><button type="button" onclick={() => sortBy('firstName')}>שם פרטי {getSortSymbol('firstName')}</button></th>
            <th><button type="button" onclick={() => sortBy('lastName')}>שם משפחה {getSortSymbol('lastName')}</button></th>
            <th><button type="button" onclick={() => sortBy('phone')}>טלפון {getSortSymbol('phone')}</button></th>
            <th><button type="button" onclick={() => sortBy('email')}>אימייל {getSortSymbol('email')}</button></th>
            <th><button type="button" onclick={() => sortBy('address')}>כתובת {getSortSymbol('address')}</button></th>
          </tr>
        </thead>
        <tbody>
          {#each sortedCustomers as customer, index (customer.id)}
            <tr
              class:selected={selectedIndex === index}
              tabindex="0"
              aria-selected={selectedIndex === index}
              onfocus={() => onRowMouseOver(index)}
              onmouseover={() => onRowMouseOver(index)}
              onkeydown={handleKeyDown}
              ondblclick={() => onRowDblClick(customer)}
            >
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
/* Sticky search bar at top */
.search-bar {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  align-items: center;
  max-width: clamp(500px, 50vw, 1200px);
  margin: 0 auto 0 auto;
  padding: 0.75em 0.5em 0.75em 0.5em;
  position: sticky;
  top: 0;
  background: #f9f9f9;
  z-index: 101;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 10px #00000013;
}

/* Table container */
.container {
  max-width: clamp(300px, 90vw, 1200px);
  height: 80vh;
  overflow: auto;
  margin: 0.2rem auto 5rem auto;
  padding: 0.2rem;
  direction: rtl;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Table wrapper */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.12);
  background: #fff;
}

/* Table styling */
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  background: #fff;
}
th, td {
  padding: 1em;
  text-align: right;
  white-space: nowrap;
  font-size: 1rem;
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
  transition: background 0.2s;
}
th button {
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  color: inherit;
  padding: 0;
}
th button:focus {
  outline: 2px solid #007a3d;
}
td {
  border-bottom: 1px solid #eee;
}
tr.selected, tr:hover {
  background-color: #dafaf5 !important;
  cursor: pointer;
}
input[type="text"] {
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
  transition: background 0.2s;
}
button:hover {
  background-color: #218838;
}
.blurred {
  filter: blur(5px);
  transition: filter 0.3s ease;
}
.edit-form-container {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.38);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.edit-form-container > * {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
