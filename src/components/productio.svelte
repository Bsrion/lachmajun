<script>
   import { onMount } from 'svelte';

  let products = $state([]);
  let error = $state(null);
  let editingRow = $state(null); // Track currently editing row

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
</script>

{#if error}
  <p style="color:red">{error}</p>
{:else if products.length === 0}
  <p>Loading products...</p>
{:else}
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>name</th>
      <th>name_arabic</th>
      <th>ion_instraction</th>
      <th>category</th>
      <th>emtsa_shavua_1</th>
      <th>emtsa_shavua_2</th>
      <th>seudat_mitsva_1</th>
      <th>seudat_mitsva_2</th>
      <th>keytering_leshabat_chatan_erev</th>
      <th>keytering_leshabat_chatan_yom</th>
      <th>keytering_leseuda_shelishit</th>
      <th>chatifim</th>
      <th>sensitiviti</th>
      <th>comment</th>
      <th>Action</th>
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
          <td><button onclick={() => saveEdit(index)}>Save</button></td>
        {:else}
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