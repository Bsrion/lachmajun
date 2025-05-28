<script>
   import { onMount } from 'svelte';

  let products = $state([]);
  let error = $state(null);
  let editingRow = $state(null); // Track currently editing row
// sorting code

let sortKey = $state(null);
let sortDirection = $state('asc'); // 'asc' or 'desc'

function sortBy(key) {
  if (sortKey === key) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key;
    sortDirection = 'asc';
  }

  products = [...products].sort((a, b) => {
    const aVal = a[key] || '';
    const bVal = b[key] || '';

    if (!isNaN(aVal) && !isNaN(bVal)) {
      return sortDirection === 'asc'
        ? aVal - bVal
        : bVal - aVal;
    }

    return sortDirection === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
}

  onMount(async () => {
    try {
      const res = await fetch('https://dilen-digital.co.il/api/production.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      products = await res.json();
    } catch (e) {
      error = e.message;
    }

    // quit edit mode when clickig out from the raw

      const handleClick = (e) => {
    if (
      editingRow !== null &&
      !e.target.closest('tr[tabindex="0"]') // Clicked outside the row
    ) {
      editingRow = null;
    }
  };

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
  });

  function startEdit(index) {
    editingRow = index;
  }

  async function saveEdit(index) {
    const updatedProduct = products[index];

    try {
      const res = await fetch('https://dilen-digital.co.il/api/update_product.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) throw new Error('Failed to update product');
      editingRow = null;
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  }

  function handleInputChange(index, key, value) {
    products[index][key] = value;
  }

  // add or remove raws of products
function addProduct() {
  const emptyProduct = {
    product_id: '', // leave empty for auto ID
    name: '',
    name_arabic: '',
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
  editingRow = products.length - 1;
}

async function deleteProduct(index) {
  const product = products[index];

  if (!product.product_id) {
    if (confirm("This product is not saved yet. Remove it from the list?")) {
      products = products.filter((_, i) => i !== index);
    }
    return;
  }

  const confirmation = prompt(`Type the product name "${product.name}" to confirm deletion:`);

  if (confirmation !== product.name) {
    alert("Deletion cancelled. Name didn't match.");
    return;
  }

  try {
    const res = await fetch('https://dilen-digital.co.il/api/delete_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.product_id })
    });

    if (!res.ok) throw new Error('Failed to delete product');
    products = products.filter((_, i) => i !== index);
  } catch (e) {
    alert(`Delete failed: ${e.message}`);
  }
}


</script>

{#if error}
  <p style="color:red">{error}</p>
{:else if products.length === 0}
  <p>Loading products...</p>
{:else}
<table >
<thead style="height: 75px">
  <tr>
    {#each Object.keys(products[0] || {}) as key}
      <th
        style="cursor: pointer; user-select: none;"
        onclick={() => sortBy(key)}
      >
        {key}
        {#if sortKey === key}
          {sortDirection === 'asc' ? ' ↑' : ' ↓'}
        {/if}
      </th>
    {/each}
    <th>Actions</th>
  </tr>
</thead>

  <tbody>
    {#each products as product, index}
      <tr
        ondblclick={() => startEdit(index)}
        onkeydown={(e) => {
          if (e.key === 'Escape') editingRow = null;
        }}
        tabindex="0"
      >
        {#if editingRow === index}
        {#each Object.keys(product) as key}
  <td>
    <input
      type="text"
      bind:value={products[index][key]}
      oninput={(e) => handleInputChange(index, key, e.target.value)}
      class:nameCategoryInput={key === 'name' || key === 'category'}
      class:smallInput={key !== 'name' && key !== 'category'}
    />
  </td>
{/each}
<td>
  <button onclick={() => saveEdit(index)}>💾 Save</button>
  <button onclick={() => deleteProduct(index)} style="margin-left: 10px; color: red;">🗑 Delete</button>
</td>        {:else}
          {#each Object.keys(product) as key}
            <td>{product[key]}</td>
          {/each}
          <td></td>
        {/if}
      </tr>
    {/each}
  </tbody>
</table>
{/if}
<button onclick={addProduct} style="margin: 0 20px 50px 0x; padding: 10px 20px">➕ Add Product</button>
<style>
  input.nameCategoryInput {
  width: 180px;  /* bigger width */
  font-size: 1.1rem;
  padding: 8px 10px;
}

input.smallInput {
  width: 90px;   /* smaller width */
  font-size: 0.85rem;
  padding: 5px 7px;
}
tr th.veryWideTh{
  min-width:200px;
}
tr th.WideTh{
  min-width:120px;
}
table tr th{
    min-width:50px;
    word-break: break-word;
    text-align: right;
}
  table {
    width: 100%;
    max-width: 1200px;
    margin: 120px 20px;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  thead tr {
    background-color: #007acc;
    color: white;
    height: 60px;
    white-space: normal;
  }

  thead th {
    padding: 12px 10px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #005fa3;
  }

  tbody tr {
    border-bottom: 1px solid #ddd;
    transition: background-color 0.2s ease;
    cursor: pointer;
  }

  tbody tr:hover {
    background-color: #f0f8ff;
  }

  tbody tr:focus {
    outline: 2px solid #007acc;
    background-color: #e6f2ff;
  }

  tbody td {
    padding: 8px 10px;
    vertical-align: middle;
  }

  input[type="text"] {
    width: 100%;
    box-sizing: border-box;
    padding: 6px 8px;
    font-size: 0.95rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    background-color: #007acc;
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #005fa3;
  }
</style>