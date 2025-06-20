<script>
  import { onMount } from 'svelte';

  let tafritim = [];
  let error = '';
  let saveStatus = {};

  // Fetch all tafritim from your API
  async function loadTafritim() {
    error = '';
    try {
      const res = await fetch('https://dilen-digital.co.il/api/get_tafritim.php');
      tafritim = await res.json();
    } catch (e) {
      error = 'Error loading tafritim';
    }
  }

  // Save one row
  async function saveRow(row) {
    error = '';
    saveStatus[row.id] = 'saving';
    try {
      const res = await fetch('https://dilen-digital.co.il/api/update_tafrit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
      });
      const data = await res.json();
      if (data.success) {
        saveStatus[row.id] = 'saved';
        setTimeout(() => { saveStatus[row.id] = ''; }, 1200);
      } else {
        saveStatus[row.id] = 'error';
        error = 'Update failed';
      }
    } catch (e) {
      saveStatus[row.id] = 'error';
      error = 'Update failed';
    }
  }

  // Allow editing of all fields
  const columns = [
    { key: 'sug_tafrit', label: 'סוג תפריט', type: 'text' },
    { key: 'price', label: 'מחיר', type: 'number' },
    { key: 'max_salad', label: 'סלטים', type: 'number' },
    { key: 'max_starter', label: 'מנה ראשונה', type: 'number' },
    { key: 'max_starter_option2', label: 'מנה ראשונה אופציה שניה', type: 'number' },
    { key: 'max_mimoulaim', label: 'ממולאים', type: 'number' },
    { key: 'max_mimoulaim_one', label: 'ממולאים 1 לבחירה', type: 'number' },
    { key: 'max_main', label: 'עיקרית', type: 'number' },
    { key: 'max_main_2', label: 'עיקרית 2', type: 'number' },
    { key: 'max_hot_sides', label: 'תוספות חמות', type: 'number' },
    { key: 'max_hot_sides_paid', label: 'תוספות חמות בתוספת תשלום', type: 'number' },
    { key: 'max_bread', label: 'לחמים', type: 'number' },
    { key: 'max_bread_paid', label: 'לחמים בתוספת תשלום', type: 'number' }
  ];

  onMount(loadTafritim);
</script>

{#if error}
  <div class="error">{error}</div>
{/if}

<table class="tafritim-admin-table">
  <thead>
    <tr>
      <th>ID</th>
      {#each columns as col}
        <th>{col.label}</th>
      {/each}
      <th>שמירה</th>
    </tr>
  </thead>
  <tbody>
    {#each tafritim as row (row.id)}
      <tr>
        <td>{row.id}</td>
        {#each columns as col}
          <td>
            <input
              type={col.type}
              bind:value={row[col.key]}
              oninput={() => {
                // If type is number, sanitize as integer or empty string
                if (col.type === 'number') {
                  row[col.key] = row[col.key] === '' ? '' : Number(row[col.key]);
                }
              }}
              style="width:90px;"
            />
          </td>
        {/each}
        <td>
          <button onclick={() => saveRow(row)}>
            {saveStatus[row.id] === 'saving'
              ? 'שומר...'
              : saveStatus[row.id] === 'saved'
              ? '✓ נשמר!'
              : saveStatus[row.id] === 'error'
              ? 'שגיאה'
              : 'שמור'}
          </button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>

.tafritim-admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  direction: rtl;
  background: #fff;
  box-shadow: 0 2px 12px #0001;
}
.tafritim-admin-table th,
.tafritim-admin-table td {
  border: 1px solid #e2e2e2;
  padding: 7px 6px;
  text-align: center;
  font-size: 15px;
}
.tafritim-admin-table th:nth-of-type(2),
.tafritim-admin-table td:nth-of-type(2) {
  width: 150px;
}
.tafritim-admin-table input[type="text"],
.tafritim-admin-table input[type="number"] {
  min-width: 90%;
  max-width: 90px;
  padding: 2px 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
  font-size: 15px;
}

    .tafritim-admin-table button {
    padding: 4px 13px;
    border-radius: 6px;
  background: #0077cc;
  color: #fff;
  border: none;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.tafritim-admin-table button:hover {
  background: #005fa3;
}
.error {
  color: red;
  margin: 14px 0;
  font-weight: bold;
  text-align: center;
}
</style>
