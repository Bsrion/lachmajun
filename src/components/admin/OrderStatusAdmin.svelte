<script>
  import { onMount } from 'svelte';

  let orders = $state([]);
  let error = $state(null);
  let sortByDeliveryDate = $state(true); // default to delivery date


  // Date filters bound to inputs, but only applied on button click
let todayStr = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
let fromDateInput = $state(todayStr);
let toDateInput = $state(todayStr);

  // Actual dates used for filtering
  let fromDate = $state(null);
  let toDate = $state(null);

  // Sorting
  let sortField = $state('date_of_order');
  let sortDirection = $state('desc'); // newest first by default

  // Show all by default (no filter)
  let filterMode = $state('all'); // 'all', 'today', 'nextDay', 'range'
  let filterDate = $state(null); // for today/nextDay filter

  function parseOrderData(data) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }

  function formatDate(sqlDateString) {
    if (!sqlDateString) return '';
    const date = new Date(sqlDateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jerusalem'
    };
    return new Intl.DateTimeFormat('he-IL', options).format(date);
  }

  function extractSortValue(order, field) {
  const customer = order.parsed_data?.customer || {};
  switch (field) {
    case 'id':
      return Number(customer.id || 0); // add this line
    case 'order_num':
      return Number(order.order_num);
    case 'phone':
      return customer.phone || '';
    case 'name':
      return customer.name?.toLowerCase() || '';
    case 'deliveryDate':
      return customer.dateOfSuplay || '';
    case 'date_of_order':
      return new Date(order.date_of_order);
       case 'orderStatus':
      return customer.orderStatus || '';
    default:
      return '';
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
function getOrderDate(order) {
  const deliveryDate = order.parsed_data?.delivery_date;
  const date = order.parsed_data?.date;
  return new Date(deliveryDate || date || 0);
}

  function filterOrdersByDate(orders) {
    return orders.filter(order => {
      if (!order.date_of_order) return false;
      const orderDate = new Date(order.date_of_order);

      if (filterMode === 'all') {
        return true; // no filter
      } else if (filterMode === 'today' || filterMode === 'nextDay') {
        // compare only date part ignoring time
        const od = orderDate.setHours(0, 0, 0, 0);
        const fd = filterDate.setHours(0, 0, 0, 0);
        return od === fd;
      } else if (filterMode === 'range') {
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);
        if (from && orderDate < from) return false;
        if (to && orderDate > to) return false;
        return true;
      }
      return true;
    });
  }

  function setSort(field) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }
  // ...existing code...

function showAll() {
  filterMode = 'all';
  filterDate = null;
  fromDate = null;
  toDate = null;
}

// ...existing code...

  function showToday() {
    filterMode = 'today';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filterDate = today;

    // Clear date range inputs
    fromDate = null;
    toDate = null;
  }

  function showNextDay() {
    filterMode = 'nextDay';
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    filterDate = nextDay;

    // Clear date range input
    fromDate = null;
    toDate = null;
  }

  function applyDateRange() {
    if (fromDateInput && toDateInput) {
      filterMode = 'range';
      fromDate = fromDateInput;
      toDate = toDateInput;
      filterDate = null;
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

   // Assuming this is per each `order`
  function groupItemsByCategory(items) {
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }
    return grouped;
  }
  let expandedRows = $state(new Set());

function toggleRowExpansion(orderNum) {
  if (expandedRows.has(orderNum)) {
    expandedRows.delete(orderNum);
  } else {
    expandedRows.add(orderNum);
  }
  // $state workaround: re-assign to trigger Svelte reactivity
  expandedRows = new Set(expandedRows);
}

</script>


<div class="rtl-container">
  {#if error}
    <p style="color:red">שגיאה: {error}</p>
  {:else}
   <h2>רשימת הזמנות</h2>
  
<div class="filter-box">
  <div class="filter-buttons">
    
    <button class="flat-button" onclick={showAll}>הצג כל ההזמנות</button>
    <button class="flat-button" onclick={showToday}>הצג הזמנות של היום</button>
    <button class="flat-button" onclick={showNextDay}>הצג הזמנות של מחר</button>
  </div>

  <div class="date-range">
<p>מיון לפי: {sortField === 'deliveryDate' ? 'תאריך משלוח' : 'תאריך הזמנה / אחר'}</p>

    <label>
      <span>מתאריך</span>
      <input type="date" bind:value={fromDateInput} />
    </label>
    <label>
      <span>עד תאריך</span>
      <input type="date" bind:value={toDateInput} />
    </label>
    <button class="flat-button outlined" onclick={applyDateRange}>החל סינון תאריכים</button>
  </div>
</div>

<div class="sort-controls flex items-center gap-4 mb-4">
  <select
    bind:value={sortField}
    class="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="date_of_order">תאריך הזמנה</option>
    <option value="id">מספר לקוח</option>
    <option value="name">שם לקוח</option>
    <option value="orderStatus">סטטוס</option>
    <option value="deliveryDate"> תאריך משלוח</option>
    <option value="total_price">סכום כולל</option>
    <option value="order_num">מספר הזמנה</option>
    <option value="phone">טלפון</option>
    <option value="address">כתובת</option>
  </select>

  <button
    class="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200"
    onclick={() => sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'}
  >
    החלף כיוון מיון
  </button>

  <button
    class="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded hover:bg-red-200"
    onclick={() => {
      sortField = 'date_of_order';
      sortDirection = 'desc';
    }}
  >
    אפס מיון
  </button>
</div>


    <table>
      <thead>
        <tr>
          
          <th onclick={() => setSort('order_num')} style="max-width:15px">
            מספר הזמנה
            {#if sortField === 'order_num'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th onclick={() => setSort('date_of_order')} style="max-width:50px">
            תאריך
            {#if sortField === 'date_of_order'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th onclick={() => setSort('id')} style="max-width:15px">
            מספר לקוח
            {#if sortField === 'id'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th onclick={() => setSort('name')} style="max-width:100px">
            פרטי לקוח
            {#if sortField === 'name'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th>פרטי מוצרים</th>
          <th onclick={() => setSort('deliveryDate')} style="max-width:30px">
            תאריך ושעת משלוח
            {#if sortField === 'deliveryDate'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>
          <th onclick={() => setSort('orderStatus')} style="max-width:15px">
            סטטוס ההזמנה
            {#if sortField === 'orderStatus'}
              <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </th>

        </tr>
      </thead>
      <tbody>
{#each sortOrders(filterOrdersByDate(orders)) as order (order.order_num)}

          <tr>
            <td class="rtl">{order.order_num}</td>
            <td class="rtl" style="max-width:65px">{formatDate(order.date_of_order)}</td>
            <td class="rtl" style="max-width:15px">{order.parsed_data?.customer?.id || '—'}</td>
            <td style="max-width:100px">
              {#if order.parsed_data?.customer}
                                                <strong>שם:</strong>
                <strong>{order.parsed_data.customer.firstName || '—'} 
                {order.parsed_data.customer.lastName || '—'}</strong><br>
                <strong>טלפון :</strong>
                <strong>{order.parsed_data.customer.phone || '—'} </strong><br>
                                                <strong>מייל:</strong>
                {order.parsed_data.customer.email || '—'}<br>
                                <strong>🏠:</strong>
                 {order.parsed_data.customer.address || '—'}<br>
                                                 <strong>📝 :</strong>
                {order.parsed_data.customer.comments || '—'}
              {:else}
                <em>אין נתוני לקוח</em>
              {/if}
            </td>
            <td style="max-width:300px; min-width:120px;">
              <div class="accordion-content"
                style="overflow:hidden; transition:max-height 0.32s cubic-bezier(.45,1.65,.35,1.06), opacity 0.28s;"
                class:expanded={expandedRows.has(order.order_num)}
              >
                {#if order.parsed_data?.items}
                  <ul class="order-items">
                    {#each Object.entries(groupItemsByCategory(order.parsed_data.items)) as [category, items]}
                      <li>
                        <strong>{category}</strong><hr>
                        <ul>
                          {#each items as item}
                            <li>
                              {item.name} (x{item.quantity})
                              {#if item.comment}
                                <br><small><em>הערה: {item.comment}</em></small>
                              {/if}
                            </li>
                          {/each}
                        </ul>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <em>אין פריטים</em>
                {/if}
              </div>
              {#if order.parsed_data?.items && Object.values(order.parsed_data.items).length > 2}
                <button
                  class="show-more-btn"
                  onclick={() => toggleRowExpansion(order.order_num)}
                >
                  {expandedRows.has(order.order_num) ? 'הסתר' : 'הצג הכל'}
                </button>
              {/if}
            </td>


            <td class="rtl" style="max-width:30px">{order.parsed_data?.customer?.dateOfSuplay || '—'} <br>
                            {order.parsed_data?.customer?.houerOfSuplay || '—'} <br>
                            {order.parsed_data?.customer?.orderDay || '—'} </td>
            <td class="rtl" style="max-width:15px">{order.parsed_data?.customer?.orderStatus || '—'}</td>

          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
.accordion-content {
  max-height: 120px;
  opacity: 0.8;
  position: relative;
  transition: max-height 0.3s cubic-bezier(.45,1.65,.35,1.06), opacity 0.28s;
  overflow: hidden;
}

.accordion-content.expanded {
  max-height: 900px; /* enough for most content */
  opacity: 1;
  transition: max-height 0.5s cubic-bezier(.45,1.65,.35,1.06), opacity 0.36s;
}

.show-more-btn {
  margin-top: 6px;
  margin-right: calc(100% - 85px);
  margin-left: 0;
  background: #f2f2ff;
  color: #282828;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  padding: 3px 14px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.22s;
  direction: rtl;
}
.show-more-btn:hover {
  background: #e3eafd;
}

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
  .filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-buttons,
.date-range {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-btn,
.apply-btn {
  background-color: #0077cc;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.filter-btn:hover,
.apply-btn:hover {
  background-color: #005fa3;
}

.date-range label {
  font-weight: bold;
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
}

.date-range input[type="date"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-top: 4px;
  min-width: 160px;
}
.filter-panel {
  background: #fefefe;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e5e5;
}

.filter-group,
.date-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

input[type="date"] {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
  background-color: #fff;
  transition: border-color 0.2s ease;
  min-width: 100px;
}

input[type="date"]:focus {
  border-color: #0077cc;
  outline: none;
}

.btn-primary {
  background: linear-gradient(to right, #1e90ff, #0077cc);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(to right, #0077cc, #005fa3);
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #e2e2e2;
}
.filter-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 2rem;
}

.filter-buttons,
.date-range {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

input[type="date"] {
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f9f9f9;
  min-width: 160px;
  transition: border 0.2s ease;
}

input[type="date"]:focus {
  border-color: #007bff;
  outline: none;
  background: #fff;
}

.flat-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 18px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.flat-button:hover {
  background-color: #005fc0;
}

.flat-button.outlined {
  background-color: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.flat-button.outlined:hover {
  background-color: #007bff;
  color: white;
}
.sort-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
  align-items: center;
}

.sort-controls select,
.sort-controls button {
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

.reset-sort-button {
  background-color: #e0e0e0;
  border: 1px solid #bbb;
  border-radius: 4px;
  color: #333;
  transition: background-color 0.2s ease;
}

.reset-sort-button:hover {
  background-color: #ccc;
}
  .sort-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
  }

  .sort-controls select,
  .sort-controls button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
  }

  .sort-controls button:hover {
    background-color: #eee;
    cursor: pointer;
  }

  .sort-controls .reset-sort-button {
    background-color: #ffecec;
    color: #c00;
    border-color: #f5c2c2;
  }

  .sort-controls .reset-sort-button:hover {
    background-color: #fdd;
  }

  .order-items > li {
  margin-bottom: 1rem;
}
.order-items ul {
  margin-right: 1rem;
  list-style-type: disc;
        padding-inline-start:5px;

}

</style>

