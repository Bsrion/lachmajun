<script>
  import { onMount, onDestroy } from 'svelte';

  // Salads array, currently editing row id, sort key, sort direction
  let salads = $state([]);
  let editingRow = $state(null);
  let sortKey = $state('product_id');
  let sortAsc = $state(true);

  // Used to know if the last click was inside the edited row
  let isRowClick = false;

  // Fetch all salad rows from backend and sort initially
  async function fetchSalads() {
    const res = await fetch('https://dilen-digital.co.il/api/get_salad_quantity.php');
    salads = await res.json();
    sortTable(sortKey);
  }

  // Sort table by column (toggle direction if already sorting by this column)
  function sortTable(key) {
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
    // Spread into new array so Svelte/Runes sees the change
    salads = [...salads].sort((a, b) => {
      let aVal = a[key] ?? '';
      let bVal = b[key] ?? '';
      if (!isNaN(aVal) && !isNaN(bVal)) {
        aVal = +aVal; bVal = +bVal;
      }
      if (aVal === bVal) return 0;
      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }

  // Enter edit mode for this row
  function editRow(row) {
    editingRow = row.product_id;
  }

  // Save changes (update backend), then exit edit mode and refresh data
  async function saveRow(row) {
    await fetch('https://dilen-digital.co.il/api/update_salad_quantity.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });
    editingRow = null;
    await fetchSalads();
  }

  // Cancel edit mode without saving
  function cancelEdit() {
    editingRow = null;
  }

  // Handle clicks outside the open row: if not a row click, exit edit mode
  function handleClickOutside(event) {
    if (!isRowClick) {
      editingRow = null;
    }
    isRowClick = false;
  }

  // Setup: fetch data and global click handler; cleanup on destroy
  onMount(() => {
    fetchSalads();
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  });
</script>

{#if salads.length}
  <!-- Table: Editable salad rows -->
  <table>
    <thead>
      <tr>
<th onclick={() => sortTable('product_id')}>מס' מזהה</th>
<th onclick={() => sortTable('salad_name')}>שם סלט</th>
<th onclick={() => sortTable('0_16')}>0-16</th>
<th onclick={() => sortTable('17_26')}>17-26</th>
<th onclick={() => sortTable('27_36')}>27-36</th>
<th onclick={() => sortTable('37_52')}>37-52</th>
<th onclick={() => sortTable('53_62')}>53-62</th>
<th onclick={() => sortTable('63_72')}>63-72</th>
<th onclick={() => sortTable('73_82')}>73-82</th>
<th onclick={() => sortTable('comments')}>הערות</th>
<th></th>

      </tr>
    </thead>
    <tbody>
      {#each salads as row (row.product_id)}
        <!--
  Each row:
  - Double click to enter edit mode
  - Single click inside edited row just sets flag to prevent closing edit mode
  - Single click on another row closes editing
-->
        <tr
  class:editing={editingRow === row.product_id}
  ondblclick={() => editRow(row)}
  onclick={() => {
    if (editingRow === row.product_id) {
      isRowClick = true;
    } else {
      editingRow = null;
    }
  }}
>
  <td>{row.product_id}</td>
  <td>{row.salad_name}</td>
  <td>
    <input
      type="text"
      bind:value={row['0_16']}
      style="width:64px;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    <input
      type="text"
      bind:value={row['17_26']}
      style="width:64px;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    <input
      type="text"
      bind:value={row['27_36']}
      style="width:64px;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    <input
      type="text"
      bind:value={row['37_52']}
      style="width:64px;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    <input
      type="text"
      bind:value={row['53_62']}
      style="width:64px;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    <input
      type="text"
      bind:value={row['63_72']}
      style="width:64px;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    <input
      type="text"
      bind:value={row['73_82']}
      style="width:64px;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    <input
      type="text"
      bind:value={row.comments}
      placeholder="הערה"
      style="width:98%;"
      disabled={editingRow !== row.product_id}
    />
  </td>
  <td>
    {#if editingRow === row.product_id}
      <div class="action-buttons">
        <button onclick={() => saveRow(row)}>שמור</button>
        <button class="cancel" onclick={cancelEdit}>בטל</button>
      </div>
    {/if}
  </td>
</tr>

      {/each}
    </tbody>
  </table>
{:else}
  <!-- Loading message if no data yet -->
  <p>טוען נתונים...</p>
{/if}

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    direction: rtl;
    font-family: 'Arial', sans-serif;
    background: #fff;
    box-shadow: 0 2px 8px #0001;
    margin-top: 2em;
    margin-bottom: 5em;
  }
  th, td {
    border: 1px solid #d4d4d4;
    padding: 0.5em 1em;
    text-align: right;
    background: #f7f7f7;
  }
  th {
    cursor: pointer;
    background: #e9ecef;
    user-select: none;
    transition: background 0.2s;
  }
  th:hover {
    background: #dde3ea;
  }
  tr {
    cursor: pointer;
  }
  tr.editing {
    background: #fff3cd !important;
  }
  tr:nth-child(even) td {
    background: #f2f6fa;
  }
  input {
    width: 95%;
    padding: 0.3em;
    border: 1px solid #bdbdbd;
    border-radius: 5px;
    direction: rtl;
    text-align: right;
  }
  /* Inline action buttons for edit mode */
  .action-buttons {
    display: flex;
    gap: 0.5em;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  button {
    padding: 0.4em 1em;
    border: none;
    background-color: #2e7d32;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
    margin: 0;
    font-size: 1em;
  }
  button.cancel {
    background-color: #d32f2f;
  }
  button:hover:not(.cancel) {
    background-color: #1b5e20;
  }
  button.cancel:hover {
    background-color: #b71c1c;
  }
</style>