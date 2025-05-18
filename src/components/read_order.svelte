<script>
  import { onMount } from 'svelte';

  let orders = [];
  let error = null;

  let sortField = 'order_num';
  let sortDirection = 'asc';

  function parseOrderData(data) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }

  function sortOrders(orders) {
    return [...orders].sort((a, b) => {
      const aValue = extractSortValue(a, sortField);
      const bValue = extractSortValue(b, sortField);

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function extractSortValue(order, field) {
    const customer = order.parsed_data?.customer || {};
    switch (field) {
      case 'order_num':
        return Number(order.order_num);
      case 'phone':
        return customer.phone || '';
      case 'name':
        return customer.name?.toLowerCase() || '';
      case 'deliveryDate':
        return customer.deliveryDate || '';
      default:
        return '';
    }
  }

  function setSort(field) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }

  onMount(async () => {
    try {
      const res = await fetch('https://dilen-digital.co.il/api/get_orders.php');
      const data = await res.json();
      if (data.success) {
        orders = data.orders.map(order => ({
          ...order,
          parsed_data: parseOrderData(order.order_data)
        }));
      } else {
        error = data.error;
      }
    } catch (err) {
      error = err.message;
    }
  });
</script>

<style>
  .rtl-container {
    direction: rtl;
    font-family: Arial, sans-serif;
    padding: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    padding: 12px;
    border: 1px solid #ccc;
    text-align: right;
    vertical-align: top;
  }

  th {
    background-color: #f0f0f0;
    cursor: pointer;
    user-select: none;
  }

  .order-items {
    margin-top: 6px;
    font-size: 0.9rem;
    padding-right: 1rem;
  }

  .order-items li {
    margin-bottom: 4px;
  }

  .ltr {
    direction: ltr;
    text-align: left;
    font-family: monospace;
  }

  .sort-arrow {
    font-size: 0.8em;
    margin-right: 4px;
  }
</style>

<div class="rtl-container">
  {#if error}
    <p style="color:red">שגיאה: {error}</p>
  {:else}
    <h2>רשימת הזמנות</h2>
    <table>
      <thead>
        <tr>
          <th on:click={() => setSort('order_num')}>
            מספר הזמנה
            {#if sortField === 'order_num'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th on:click={() => setSort('phone')}>
            טלפון
            {#if sortField === 'phone'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th on:click={() => setSort('name')}>
            פרטי לקוח
            {#if sortField === 'name'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th>פרטי מוצרים</th>
          <th on:click={() => setSort('deliveryDate')}>
            תאריך משלוח
            {#if sortField === 'deliveryDate'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each sortOrders(orders) as order}
          <tr>
            <td class="ltr">{order.order_num}</td>
            <td class="ltr">{order.parsed_data?.customer?.phone || '—'}</td>
            <td>
              {#if order.parsed_data?.customer}
                <strong>{order.parsed_data.customer.name || '—'}</strong><br>
                🏠 {order.parsed_data.customer.address || '—'}<br>
                📝 {order.parsed_data.customer.comments || '—'}
              {:else}
                <em>אין נתוני לקוח</em>
              {/if}
            </td>
            <td>
              {#if order.parsed_data?.items}
                <ul class="order-items">
                  {#each order.parsed_data.items as item}
                    <li>
                      {item.name} (x{item.quantity}) — {item.category}
                      {#if item.comment}
                        <br><small><em>הערה: {item.comment}</em></small>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {:else}
                <em>אין פריטים</em>
              {/if}
            </td>
            <td class="ltr">{order.parsed_data?.customer?.deliveryDate || '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
