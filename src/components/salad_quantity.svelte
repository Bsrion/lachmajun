<script>
  import { onMount } from 'svelte';

  let salads = $state([]);
  let editingRow = $state(null);
  let sortKey = $state('product_id');
  let sortAsc = $state(true);

  // Add new salad logic
  let newSalad = $state({
    grouped: '', salad_name: '', '0_16': '', '17_26': '', '27_36': '', '37_52': '',
    '53_62': '', '63_72': '', '73_82': '', comments: ''
  });
  let showAddRow = $state(false);
  let tableRef;

  function addNewSaladBtn() {
    newSalad = {
      grouped: '', salad_name: '', '0_16': '', '17_26': '', '27_36': '', '37_52': '',
      '53_62': '', '63_72': '', '73_82': '', comments: ''
    };
    showAddRow = true;
    setTimeout(() => {
      if (tableRef) tableRef.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  }
  async function saveNewSalad() {
    if (!newSalad.salad_name.trim()) { alert('יש להזין שם סלט'); return; }
    await fetch('https://dilen-digital.co.il/api/add_salad_quantity.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSalad)
    });
    showAddRow = false;
    await fetchSalads();
  }
  function cancelNewSalad() { showAddRow = false; }

  // --- Group Edit Logic ---
  let showGroupUpdate = $state(false);
  let groupEditValue = $state('');

  // Only numeric and grouped fields
  let groupEditKeys = [
    { key: 'grouped', label: 'קבוצה' },
    { key: '0_16', label: '0-16' },
    { key: '17_26', label: '17-26' },
    { key: '27_36', label: '27-36' },
    { key: '37_52', label: '37-52' },
    { key: '53_62', label: '53-62' },
    { key: '63_72', label: '63-72' },
    { key: '73_82', label: '73-82' }
  ];

  let groupEditFields = $state({
    grouped: '',
    '0_16': '', '17_26': '', '27_36': '', '37_52': '',
    '53_62': '', '63_72': '', '73_82': ''
  });

  let popupRef = $state(null);

  let groupOptions = $derived.by(() =>
    [...new Set(salads.map(s => s.grouped).filter(Boolean))]
  );

  function openGroupUpdate() {
    groupEditValue = '';
    Object.keys(groupEditFields).forEach(k => groupEditFields[k] = '');
    showGroupUpdate = true;
    setTimeout(() => {
      if (popupRef) popupRef.focus();
      window.addEventListener('click', handlePopupClick);
    }, 30);
  }

  function onSelectGroup(val) {
  groupEditValue = val;
  // For each field, find the first non-empty value for that field in this group
  groupEditKeys.forEach(({ key }) => {
    // Find the first row in this group with a non-empty value for this field
    const found = salads.find(
      s => s.grouped === val && s[key] !== undefined && String(s[key]).trim() !== ''
    );
    groupEditFields[key] = found ? found[key] : '';
  });
}


  async function confirmGroupUpdate() {
    if (!groupEditValue.trim()) return alert('בחר קבוצה לעדכון');
    // Send only non-empty fields!
    let fieldsToSend = {};
    for (const { key } of groupEditKeys) {
      if (groupEditFields[key] !== '') fieldsToSend[key] = groupEditFields[key];
    }
    if (Object.keys(fieldsToSend).length === 0) {
      alert('אין שדות לעדכן (השארת הכל ריק)');
      return;
    }
    await fetch('https://dilen-digital.co.il/api/update_salad_group.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group: groupEditValue, values: fieldsToSend })
    });
    closeGroupUpdate();
    await fetchSalads();
  }

  function closeGroupUpdate() {
    showGroupUpdate = false;
    groupEditValue = '';
    Object.keys(groupEditFields).forEach(k => groupEditFields[k] = '');
    window.removeEventListener('click', handlePopupClick);
  }
  function handlePopupClick(event) {
    if (popupRef && !popupRef.contains(event.target)) closeGroupUpdate();
  }
  function handlePopupKeydown(event) {
    if (showGroupUpdate && event.key === 'Escape') closeGroupUpdate();
  }

  // --- Row Logic ---
  function editRow(row) { editingRow = row.product_id; }
  async function saveRow(row) {
    if (!row.salad_name.trim()) { alert('יש להזין שם סלט'); return; }
    await fetch('https://dilen-digital.co.il/api/update_salad_quantity.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });
    editingRow = null;
    await fetchSalads();
  }
  function cancelEdit() { editingRow = null; }

  // --- Out-click Row Logic ---
  let isRowClick = $state(false);
  function handleClickOutside() { if (!isRowClick) editingRow = null; isRowClick = false; }

  // --- Sorting ---
  function sortTable(key, forceAsc = false) {
    if (sortKey === key && !forceAsc) sortAsc = !sortAsc;
    else { sortKey = key; sortAsc = true; }
    salads = [...salads].sort((a, b) => {
      let aVal = a[key] ?? '', bVal = b[key] ?? '';
      if (!isNaN(aVal) && !isNaN(bVal)) { aVal = +aVal; bVal = +bVal; }
      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }

  async function fetchSalads() {
    const res = await fetch('https://dilen-digital.co.il/api/get_salad_quantity.php');
    salads = await res.json();
    sortTable(sortKey, true);
  }

  onMount(() => {
    fetchSalads();
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handlePopupKeydown);

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handlePopupKeydown);
      window.removeEventListener('click', handlePopupClick);
    };
  });
</script>


<div style="margin: 20px 0; display: flex; gap: 20px;">
  <button onclick={addNewSaladBtn}>הוסף סלט חדש</button>
  <button onclick={openGroupUpdate}>עדכן קבוצה</button>
</div>

<!-- GROUP UPDATE POPUP -->
{#if showGroupUpdate}
  <div class="popup-bg">
    <div class="popup-content" tabindex="0" bind:this={popupRef}>
      <h3>עדכון קבוצה</h3>
      <label>בחר קבוצה:</label>
      <select bind:value={groupEditValue} onchange={e => onSelectGroup(e.target.value)}>
        <option value="">בחר</option>
        {#each groupOptions as g}
          <option value={g}>{g}</option>
        {/each}
      </select>
      {#if groupEditValue}
        <table class="popup-table">
          <tbody>
            {#each groupEditKeys as {key, label}}
              <tr>
                <td class="popup-td-label">{label}</td>
                <td>
                  <input type="text" bind:value={groupEditFields[key]} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div style="margin-top:14px;text-align:left;">
          <button onclick={confirmGroupUpdate}>עדכן את כל הסלטים בקבוצה</button>
          <button onclick={closeGroupUpdate} class="cancel">בטל</button>
        </div>
      {/if}
    </div>
  </div>
{/if}


<!-- MAIN TABLE -->
<div bind:this={tableRef}>
  <table>
    <thead>
      <tr>
        <th onclick={() => sortTable('product_id')}>מס' מזהה</th>
        <th onclick={() => sortTable('grouped')}>קבוצה</th>
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
        <tr
          class:editing={editingRow === row.product_id}
          ondblclick={() => editRow(row)}
          onclick={() => { if (editingRow === row.product_id) isRowClick = true; }}>
          <td>{row.product_id}</td>
          <td>{#if editingRow === row.product_id}
                <input type="text" bind:value={row.grouped} style="width:80px;" />
              {:else}{row.grouped}{/if}</td>
          <td>{#if editingRow === row.product_id}
                <input type="text" bind:value={row.salad_name} style="width:120px;" />
              {:else}{row.salad_name}{/if}</td>
          {#each ['0_16','17_26','27_36','37_52','53_62','63_72','73_82'] as col}
            <td>{#if editingRow === row.product_id}
                  <input type="text" bind:value={row[col]} style="width:64px;" />
                {:else}{row[col]}{/if}</td>
          {/each}
          <td>{#if editingRow === row.product_id}
                <input type="text" bind:value={row.comments} style="width:90px;" />
              {:else}{row.comments}{/if}</td>
          <td>
            {#if editingRow === row.product_id}
              <button onclick={() => saveRow(row)}>שמור</button>
              <button onclick={cancelEdit} class="cancel">בטל</button>
            {/if}
          </td>
        </tr>
      {/each}
      {#if showAddRow}
        <tr class="editing">
          <td></td>
          <td><input type="text" bind:value={newSalad.grouped} style="width:80px;" /></td>
          <td><input type="text" bind:value={newSalad.salad_name} style="width:120px;" /></td>
          {#each ['0_16','17_26','27_36','37_52','53_62','63_72','73_82'] as col}
            <td><input type="text" bind:value={newSalad[col]} style="width:64px;" /></td>
          {/each}
          <td><input type="text" bind:value={newSalad.comments} style="width:90px;" /></td>
          <td>
            <button onclick={saveNewSalad}>שמור</button>
            <button onclick={cancelNewSalad} class="cancel">בטל</button>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

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
  th, td { border: 1px solid #d4d4d4; padding: 0.5em 1em; text-align: right; background: #f7f7f7; }
  th { cursor: pointer; background: #e9ecef; user-select: none; }
  th:hover { background: #dde3ea; }
  tr { cursor: pointer; }
  tr.editing { background: #fff3cd !important; }
  tr:nth-child(even) td { background: #f2f6fa; }
  input { width: 95%; padding: 0.3em; border: 1px solid #bdbdbd; border-radius: 5px; direction: rtl; text-align: right; }
  button { padding: 0.4em 1em; border: none; background-color: #2e7d32; color: #fff; border-radius: 5px; cursor: pointer; margin: 0; font-size: 1em; }
  button.cancel { background-color: #d32f2f; }
  button:hover:not(.cancel) { background-color: #1b5e20; }
  button.cancel:hover { background-color: #b71c1c; }

  /* Popup styles */
  .popup-bg {
      position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  }
  .popup-content {
    background: #fff; border-radius: 14px; padding: 25px 32px; min-width: 380px; box-shadow: 0 4px 16px #0003;
    direction: rtl;
    outline: none;
  }
  .popup-content h3 { margin-top: 0; }
  .popup-content label { font-weight: 500; }
  .popup-content select { width: 140px; margin: 0 0 10px 0; }
  .popup-table {
    width: 100%; border-collapse: collapse; margin: 15px 0 0 0;
  }
  .popup-td-label {
    font-weight: 600; background: #f7f7fa; width: 90px;
    text-align: right;
    padding-right: 0.5em;
  }
  .popup-table input { width: 98%; padding: 5px; border-radius: 6px; border: 1px solid #ccc;}
  .popup-content button { margin-left: 10px; }
</style>
