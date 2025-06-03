<script>
  import { onMount, onDestroy } from 'svelte';

  let products = $state([]);
  let editingRow = $state(null); // Holds product_id or temp_id
  let sortKey = $state('product_id');
  let sortAsc = $state(true);

  let isRowClick = $state(false);

  // Fetch products from API
  async function fetchProducts() {
    const res = await fetch('https://dilen-digital.co.il/api/production.php');
    products = await res.json();
    sortTable(sortKey, true);
  }

  // Sorting logic
  function sortTable(key, forceAsc = false) {
    if (sortKey === key && !forceAsc) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
    products = [...products].sort((a, b) => {
      let aVal = a[key] ?? '';
      let bVal = b[key] ?? '';
      if (!isNaN(aVal) && !isNaN(bVal)) {
        aVal = +aVal; bVal = +bVal;
      }
      if (aVal === bVal) return 0;
      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }

  // Handle edit row
  function editRow(row) {
    editingRow = row.product_id || row.temp_id;
  }

  function onRowClick(row) {
    if (editingRow === (row.product_id || row.temp_id)) {
      isRowClick = true;
    } else {
      editingRow = null;
    }
  }

  // Save edited or new row
  async function saveRow(row) {
    let saveUrl = row.product_id
      ? 'https://dilen-digital.co.il/api/update_product.php'
      : 'https://dilen-digital.co.il/api/add_product.php';
    let saveRow = { ...row };
    if (!saveRow.product_id) delete saveRow.product_id;
    await fetch(saveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveRow)
    });
    editingRow = null;
    await fetchProducts();
  }

  function cancelEdit() {
    editingRow = null;
    fetchProducts(); // Restore original values if cancelled
  }

  // Add product logic
  function addProduct() {
    if (products.length > 0) {
      const last = products[products.length - 1];
      if (!last.name?.trim() || !last.category?.trim()) {
        alert('נא למלא שם מוצר וקטגוריה לפני שמוסיפים מוצר חדש');
        return;
      }
    }
    const emptyProduct = {
      temp_id: `temp_${Date.now()}`,
      product_id: '',
      name: '',
      name_arabic: '',
      above_25: '',
      less_than_25: '',
      production_instraction: '',
      category: '',
      emtsa_shavua_1: false,
      emtsa_shavua_2: false,
      seudat_mitsva_1: false,
      seudat_mitsva_2: false,
      keytering_leshabat_chatan_erev: false,
      keytering_leshabat_chatan_yom: false,
      keytering_leseuda_shelishit: false,
      chatifim: false,
      sensitiviti: false,
      comment: ''
    };
    products = [...products, emptyProduct];
    editingRow = emptyProduct.temp_id;
  }

  // Delete row logic
  async function deleteRow(row) {
    if (!row.product_id) {
      if (confirm("This product is not saved yet. Remove it from the list?")) {
        products = products.filter(r => (r.product_id || r.temp_id) !== (row.product_id || row.temp_id));
      }
      return;
    }
    const confirmation = prompt(`Type the product name "${row.name}" to confirm deletion:`);
    if (confirmation !== row.name) {
      alert("Deletion cancelled. Name didn't match.");
      return;
    }
    await fetch('https://dilen-digital.co.il/api/delete_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: row.product_id })
    });
    products = products.filter(r => r.product_id !== row.product_id);
  }

  // Handle click outside editable row to close edit mode
  function handleClickOutside() {
    if (!isRowClick) {
      editingRow = null;
    }
    isRowClick = false;
  }

  onMount(() => {
    fetchProducts();
    window.addEventListener('click', handleClickOutside);
  });
  onDestroy(() => {
    window.removeEventListener('click', handleClickOutside);
  });
</script>

{#if products.length}
  <table>
    <thead>
      <tr>
        <th onclick={() => sortTable('product_id')}>מס' מזהה</th>
        <th onclick={() => sortTable('name')}>שם מוצר</th>
        <th onclick={() => sortTable('name_arabic')}>שם בערבית</th>
        <th onclick={() => sortTable('category')}>קטגוריה</th>
        <th onclick={() => sortTable('less_than_25')}>פחות מ-25</th>
        <th onclick={() => sortTable('above_25')}>מעל 25</th>
        <th onclick={() => sortTable('production_instraction')}>הוראת ייצור</th>
        <th onclick={() => sortTable('emtsa_shavua_1')}>אמצע שבוע 1</th>
        <th onclick={() => sortTable('emtsa_shavua_2')}>אמצע שבוע 2</th>
        <th onclick={() => sortTable('seudat_mitsva_1')}>סעודת מצווה 1</th>
        <th onclick={() => sortTable('seudat_mitsva_2')}>סעודת מצווה 2</th>
        <th onclick={() => sortTable('keytering_leshabat_chatan_erev')}>קייטרינג לשבת חתן ערב</th>
        <th onclick={() => sortTable('keytering_leshabat_chatan_yom')}>קייטרינג לשבת חתן יום</th>
        <th onclick={() => sortTable('keytering_leseuda_shelishit')}>קייטרינג לסעודה שישית</th>
        <th onclick={() => sortTable('chatifim')}>חטיפים</th>
        <th onclick={() => sortTable('sensitiviti')}>רגישויות</th>       
        <th onclick={() => sortTable('comment')}>הערות</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each products as row (row.product_id || row.temp_id)}
        <tr
          class:editing={editingRow === (row.product_id || row.temp_id)}
          ondblclick={() => editRow(row)}
          onclick={() => onRowClick(row)}
        >
          {#if editingRow === (row.product_id || row.temp_id)}
            <td>{row.product_id}</td>
            <td>
              <input type="text" bind:value={row.name} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.name_arabic} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.category} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.less_than_25} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.above_25} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.production_instraction} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.emtsa_shavua_1} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.emtsa_shavua_2} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.seudat_mitsva_1} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.seudat_mitsva_2} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.keytering_leshabat_chatan_erev} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.keytering_leshabat_chatan_yom} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.keytering_leseuda_shelishit} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.chatifim} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.sensitiviti} onclick={() => isRowClick = true} />
            </td>
            <td>
              <input type="text" bind:value={row.comment} onclick={() => isRowClick = true} />
            </td>
            <td>
              <div class="action-buttons">
                <button onclick={() => { isRowClick = true; saveRow(row); }}>שמור</button>
                <button class="cancel" onclick={() => { isRowClick = true; cancelEdit(); }}>בטל</button>
                <button class="delete" onclick={() => { isRowClick = true; deleteRow(row); }}>מחק</button>
              </div>
            </td>
          {:else}
            <td>{row.product_id}</td>
            <td>{row.name}</td>
            <td>{row.name_arabic}</td>
            <td>{row.category}</td>
            <td>{row.less_than_25}</td>
            <td>{row.above_25}</td>
            <td>{row.production_instraction}</td>
            <td>{row.emtsa_shavua_1}</td>
            <td>{row.emtsa_shavua_2}</td>
            <td>{row.seudat_mitsva_1}</td>
            <td>{row.seudat_mitsva_2}</td>
            <td>{row.keytering_leshabat_chatan_erev}</td>
            <td>{row.keytering_leshabat_chatan_yom}</td>
            <td>{row.keytering_leseuda_shelishit}</td>
            <td>{row.chatifim}</td>
            <td>{row.sensitiviti}</td>
            <td>{row.comment}</td>
            <td></td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>טוען נתונים...</p>
{/if}

<button onclick={addProduct} style="position:fixed; bottom:65px; right:35px">➕ הוסף מוצר</button>

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
    font-size: 1rem;
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
    transition: background 0.2s;
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
    font-size: 1rem;
  }
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
  button.delete {
    background-color: #9c27b0;
  }
  button:hover:not(.cancel):not(.delete) {
    background-color: #1b5e20;
  }
  button.cancel:hover {
    background-color: #b71c1c;
  }
  button.delete:hover {
    background-color: #7b1fa2;
  }
  thead {
    position: sticky;
    top: 40px;
    background: #e9ecef;
    z-index: 10;
    box-shadow: 0 2px 4px #0001;
    border-bottom: 2px solid #bdbdbd;
  }
</style>
