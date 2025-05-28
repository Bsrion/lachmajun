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
  <table style="margin: 120px 20px">
    <thead style="height: 75px">
      <tr >
        <th> ID</th>
        <th> name</th>
        <th> name_arabic</th>
        <th> ion_instraction</th>
        <th> category</th>
        <th> emtsa_shavua_1</th>
        <th> emtsa_shavua_2</th>
        <th> seudat_mitsva_1</th>
        <th> seudat_mitsva_2</th>
        <th> keytering_leshabat_chatan_erev</th>
        <th> keytering_leshabat_chatan_yom</th>
        <th> keytering_leseuda_shelishit</th>
        <th> chatifim</th>
        <th> sensitiviti</th>
        <th> comment</th>
      </tr>
    </thead>
    <tbody>
      {#each products as product}
        <tr>
          <td>{product.product_id}</td>
          <td>{product.name}</td>
          <td>{product.name_arabic  || ''}</td>
          <td>{product.production_instraction || '-'}</td>
          <td>{product.category || '-'}</td>
          <td>{product.emtsa_shavua_1 || ''}</td>
          <td>{product.emtsa_shavua_2	 || '-'}</td>
          <td>{product.seudat_mitsva_1 || '-'}</td>
          <td>{product.seudat_mitsva_2 || '-'}</td>
          <td>{product.keytering_leshabat_chatan_erev || '-'}</td>
          <td>{product.keytering_leshabat_chatan_yom|| '-'}</td>
          <td>{product.keytering_leseuda_shelishit || '-'}</td>
          <td>{product.chatifim || '-'}</td>
          <td>{product.sensitiviti || '-'}</td>
          <td>{product.comment || '-'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
