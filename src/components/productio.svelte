<script>
  import { onMount } from 'svelte';

  let products = $state([]);
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('https://dilen-digital.co.il/api/production.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      products = await res.json();
    } catch (e) {
      error = e.message;
    }
  });
</script>

{#if error}
  <p style="color:red">{error}</p>
{:else if products.length === 0}
  <p>Loading products...</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>Product ID</th>
        <th>Category</th>
        <th>Hebrew Name</th>
        <th>Arabic Name</th>
        <th>Comments</th>
      </tr>
    </thead>
    <tbody>
      {#each products as product}
        <tr>
          <td>{product.product_id}</td>
          <td>{product.category}</td>
          <td>{product.heb_name}</td>
          <td>{product.arabic_name}</td>
          <td>{product.comments || '-'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
