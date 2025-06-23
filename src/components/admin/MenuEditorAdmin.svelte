<script>
  import { onMount } from 'svelte';

  let tafritim = [];
  let error = '';
  let saveStatus = {};
  let newRow = {
    sug_tafrit: '',
    hebrew_name: '',
    price: '',
    max_salad: '',
    max_starter: '',
    max_starter_option2: '',
    max_mimoulaim: '',
    max_mimoulaim_one: '',
    max_main: '',
    max_main_2: '',
    max_hot_sides: '',
    max_hot_sides_paid: '',
    max_bread: '',
    max_bread_paid: ''
  };

  const tafritLabelMap = {
    TafritHofshi: "תפריט חופשי",
    emtsa_shavua_1: "אמצע שבוע - 1",
    emtsa_shavua_2: "אמצע שבוע - 2",
    seudat_mitsva_1: "סעודת מצווה - 1",
    seudat_mitsva_2: "סעודת מצווה - 2",
    keytering_leshabat_chatan_erev: "קייטרינג לשבת חתן - ערב",
    keytering_leshabat_chatan_yom: "קייטרינג לשבת חתן - יום",
    keytering_leseuda_shelishit: "קייטרינג לסעודה שלישית",
    chatifim: "חטיפים"
  };

  const columns = [
    { key: 'sug_tafrit', label: 'סוג תפריט (אנגלית)', type: 'text' },
    { key: 'hebrew_name', label: 'שם בעברית', type: 'text' },
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

  // Load tafritim list
  async function loadTafritim() {
    error = '';
    try {
      const res = await fetch('https://dilen-digital.co.il/api/get_tafritim.php');
      tafritim = await res.json();
    } catch (e) {
      error = 'Error loading tafritim';
    }
  }

  // Save row (update or insert)
  async function saveRow(row, isNew = false) {
    error = '';
    if (!row.sug_tafrit || !row.hebrew_name) {
      error = 'נא למלא שם בעברית וסוג תפריט';
      return;
    }
    saveStatus[row.id || 'new'] = 'saving';
    try {
      const url = isNew
        ? 'https://dilen-digital.co.il/api/add_tafrit.php'
        : 'https://dilen-digital.co.il/api/update_tafrit.php';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
      });
      const data = await res.json();
      if (data.success) {
        saveStatus[row.id || 'new'] = 'saved';
        if (isNew) {
          newRow = {
            sug_tafrit: '', hebrew_name: '', price: '', max_salad: '', max_starter: '', max_starter_option2: '',
            max_mimoulaim: '', max_mimoulaim_one: '', max_main: '', max_main_2: '', max_hot_sides: '',
            max_hot_sides_paid: '', max_bread: '', max_bread_paid: ''
          };
        }
        loadTafritim();
        setTimeout(() => { saveStatus[row.id || 'new'] = ''; }, 1200);
      } else {
        saveStatus[row.id || 'new'] = 'error';
        error = 'Update failed';
      }
    } catch (e) {
      saveStatus[row.id || 'new'] = 'error';
      error = 'Update failed';
    }
  }

  // Delete row with confirmation
  async function deleteRow(id, hebName = '') {
    if (!confirm(`למחוק את סוג התפריט "${hebName}"?`)) return;
    error = '';
    try {
      const res = await fetch('https://dilen-digital.co.il/api/delete_tafrit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        tafritim = tafritim.filter(r => r.id !== id);
      } else {
        error = 'Delete failed';
      }
    } catch (e) {
      error = 'Delete failed';
    }
  }

  // Autofill hebrew name when editing English
  function autofillHebrew(row) {
    if (tafritLabelMap[row.sug_tafrit] && !row.hebrew_name) {
      row.hebrew_name = tafritLabelMap[row.sug_tafrit];
    }
  }

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
      <th>מחק</th>
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
                if (col.type === 'number') {
                  row[col.key] = row[col.key] === '' ? '' : Number(row[col.key]);
                }
                if (col.key === 'sug_tafrit') {
                  autofillHebrew(row);
                }
              }}
            />
          </td>
        {/each}
        <td>
          <button onclick={() => saveRow(row, false)}>
            {saveStatus[row.id] === 'saving'
              ? 'שומר...'
              : saveStatus[row.id] === 'saved'
              ? '✓ נשמר!'
              : saveStatus[row.id] === 'error'
              ? 'שגיאה'
              : 'שמור'}
          </button>
        </td>
        <td>
          <button onclick={() => deleteRow(row.id, row.hebrew_name)} style="background:#ff6b6b">
            מחק
          </button>
        </td>
      </tr>
    {/each}

    <!-- Add new row -->
    <tr>
      <td></td>
      {#each columns as col}
        <td>
          <input
            type={col.type}
            bind:value={newRow[col.key]}
            oninput={() => {
              if (col.type === 'number') {
                newRow[col.key] = newRow[col.key] === '' ? '' : Number(newRow[col.key]);
              }
              if (col.key === 'sug_tafrit') {
                autofillHebrew(newRow);
              }
            }}
            placeholder={col.label}
          />
        </td>
      {/each}
      <td>
        <button onclick={() => saveRow(newRow, true)}>
          {saveStatus['new'] === 'saving'
            ? 'מוסיף...'
            : saveStatus['new'] === 'saved'
            ? '✓ נוסף!'
            : saveStatus['new'] === 'error'
            ? 'שגיאה'
            : 'הוסף'}
        </button>
      </td>
      <td></td>
    </tr>
  </tbody>
</table>

<style>

.tafritim-admin-table {
  border-collapse: collapse;
  margin-top: 20px;
  direction: rtl;
  background: #fff;
  box-shadow: 0 2px 12px #0001;
  /* REMOVE table-layout: fixed to allow content-based sizing */
}

.tafritim-admin-table th,
.tafritim-admin-table td {
  border: 1px solid #e2e2e2;
  padding: 7px 6px;
  text-align: center;
  font-size: 15px;
  overflow: hidden;
}

/* ID column - small fixed size */
.tafritim-admin-table th:first-child,
.tafritim-admin-table td:first-child {
  width: 40px;
  min-width: 40px;
  max-width: 40px;
}

/* 2nd and 3rd columns - fit-content with limits */
.tafritim-admin-table th:nth-child(2),
.tafritim-admin-table td:nth-child(2),
.tafritim-admin-table th:nth-child(3),
.tafritim-admin-table td:nth-child(3) {
  width: fit-content;
  min-width: 125px;
  max-width: 200px;
  white-space: nowrap;
}

/* All remaining columns share remaining space equally */
.tafritim-admin-table th:not(:nth-child(-n+3)),
.tafritim-admin-table td:not(:nth-child(-n+3)) {
  width: auto;
}

/* Input styling */
.tafritim-admin-table input[type="text"],
.tafritim-admin-table input[type="number"] {
  width: 85%;
  padding: 2px 5px;
  border: 0.5px solid #ccc;
  border-radius: 5px;
  text-align: center;
  font-size: 15px;
}

/* Button styling */
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

/* Error message */
.error {
  color: red;
  margin: 14px 0;
  font-weight: bold;
  text-align: center;
}


</style>
