<script>
import CustomerForm from '../lib/CustomerForm.svelte';
import { onMount } from 'svelte';
import { blur, crossfade, draw, fade, fly, scale, slide} from 'svelte/transition';
import AddressAutocomplete from '../components/AddressAutocomplete.svelte';
import DateTimePicker from '../components/DatePicker.svelte';
import Tafritim from '../components/tafritim.svelte'
import ScrollUp from '../components/ scrollUp.svelte';

let customer = $state({
  firstName: '',
  lastName: '',
  phone: '',
  phone2: '',
  email: '',
  address: '',
  comment: '',
  userName: '',
  userPassword: '',
  dateOfSuplay:'',
  houerOfSuplay:null,
  deliveryCity:'ירושלים',
  deliveryPlace:'',
  deliveryPlaceNumber:'',
  deliveryPlaceNote:'',
  dateOfOrder:null,
  hotOrCold: '',
  comments: '',
  orderNum: null,
  orderStatus: 'פתוח',
  orderDay: '',
  orderDate: null,
  orderTime: null,
  orderType: null,
  numOfSets: 15,
  orderBasePrice: null,
  orderDeliveryPrice: null,
  orderItems: [],
  name: ''
});

let orderPrice = $derived(customer.orderBasePrice * customer.numOfSets);
let orderTotalPrice = $derived(orderPrice + customer.orderDeliveryPrice);
let orderDelveryFullAdd = $derived(customer.deliveryPlace + ' ' + customer.deliveryPlaceNumber + ', ' + customer.deliveryCity + ' - ' + customer.deliveryPlaceNote);
let showDeliveryInputs = $state(false);
let SelectedTafrit = $state('TafritHofshi');
let tafritimFixedPrice = $state(null);
let nameSuggestions = $state([]);
let showNewUserPrompt = $state(false);
let selectedIndex = $state(-1);
let suggestionRefs = $state([]);
let warning = $state('');
let selectedProducts = $state({});
let productExecutedBy = $state({});
let productQuantities = $state({});
let showInputs = $state(false);
let toDoOrder = $state([]);
let isNewCustomer = $state(false);
let showcustomersForm = $state(false);
let selectedCustomer = $state(null);

// --- SEARCH: improved matching for any word start (like מיכל א matches מיכל אלבז) ---
function isMatch(cust, qWords) {
  const detailWords = [
    cust.firstName,
    cust.lastName,
    cust.phone,
    cust.address
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .split(/[\s,\-]+/)
    .filter(Boolean);

  // Each query word must be a prefix of *some* detail word
  return qWords.every(qw =>
    detailWords.some(dw => dw.startsWith(qw))
  );
}

async function onNameInput() {
  const input = (customer.name || '').trim();
  selectedIndex = -1;

  if (input.length < 1) {
    nameSuggestions = [];
    showNewUserPrompt = false;
    return;
  }

  const url = `https://dilen-digital.co.il/api/customers_list.php`;
  const params = new URLSearchParams();

  // If you want to always fetch a larger set (e.g. only by first name),
  // change this to fetch more results so you can filter them client-side.
  params.append('q', input.split(/\s+/)[0]); // fetch by first word for broader results

  const res = await fetch(`${url}?${params.toString()}`);

  if (res.ok) {
    const results = await res.json();

    // Split the search input into words
    const queryWords = input.toLowerCase().split(/\s+/).filter(Boolean);

    // Combine customer fields and split to words for each customer
    function isMatch(cust, qWords) {
      // This creates an array like ['מיכל','אלבז','050-6789012','פתח','תקווה','חן','23']
      const detailWords = [
        cust.firstName, cust.lastName, cust.phone, cust.address
      ].filter(Boolean).join(' ').toLowerCase().split(/[\s,\-]+/);

      // Every query word should be a prefix of *some* detail word
      return qWords.every(qw => detailWords.some(dw => dw.startsWith(qw)));
    }

    nameSuggestions = results.filter(cust => isMatch(cust, queryWords));
    showNewUserPrompt = nameSuggestions.length === 0;
  } else {
    nameSuggestions = [];
    showNewUserPrompt = false;
  }
}



// --- KEYBOARD NAV ---
function handleKeydown(event) {
  if (nameSuggestions.length === 0) return;
  if (event.key === 'ArrowDown') {
    selectedIndex = (selectedIndex + 1) % nameSuggestions.length;
    scrollSelectedIntoView();
    event.preventDefault();
  } else if (event.key === 'ArrowUp') {
    selectedIndex = (selectedIndex - 1 + nameSuggestions.length) % nameSuggestions.length;
    scrollSelectedIntoView();
    event.preventDefault();
  } else if (event.key === 'Enter' && selectedIndex >= 0) {
    selectCustomer(nameSuggestions[selectedIndex]);
    nameSuggestions = [];
    selectedIndex = -1;
  } else if (event.key === 'Escape') {
    nameSuggestions = [];
    selectedIndex = -1;
  }
}

function scrollSelectedIntoView() {
  const el = suggestionRefs[selectedIndex];
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// --- SELECT CUSTOMER ---
function selectCustomer(cust) {
  showInputs = true;
  customer = {
    ...customer,
    ...cust,
    name: `${cust.firstName} ${cust.lastName} - ${cust.phone} - ${cust.address}` // for display
  };
  nameSuggestions = [];
  showNewUserPrompt = false;
  isNewCustomer = false;
}

// --- CUSTOMER FORM HANDLERS ---
function handleSave(e) {
  const { updatedCustomer } = e.detail;
  customer = { ...updatedCustomer };
  showcustomersForm = false;
}
function handleCancel() {
  showcustomersForm = false;
}
function openEditCustomer() {
  selectedCustomer = { ...customer };
  showcustomersForm = true;
}
function onNewCustomerClick() {
  if (!showcustomersForm) selectedCustomer = null;
  showcustomersForm = !showcustomersForm;
}

// --- PRINT ---
function printPage() { window.print(); }

// --- SUBMIT ORDER (unchanged) ---
async function sendOrder() {
  if (!customer.firstName || !customer.lastName || !customer.phone || !customer.address) {
    alert("יש למלא את כל שדות החובה");
    return;
  }
  if (isNewCustomer) {
    const createRes = await fetch('https://dilen-digital.co.il/api/add_customer.php', {
      method: 'POST',
      body: JSON.stringify(customer),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!createRes.ok) { alert('שגיאה ביצירת לקוח חדש'); return }
    const newCustomerData = await createRes.json();
    customer.id = newCustomerData.id;
  }
  const response = await fetch("https://dilen-digital.co.il/api/submit_order.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: customer.id,
      order_data: {
        customer,
        items: sortedToDoOrder.filter(i => i.quantity > 0)
      }
    })
  });
  const data = await response.json();
  if (data.success) {
    alert(`הזמנה נשלחה! מספר הזמנה: ${data.order_num}`);
    customer = [...startPointCustomer];
    sortedToDoOrder = orderItems.map(item => ({
      ...item,
      quantity: 0
    }));
  } else {
    alert('שגיאה בשליחת הזמנה');
    console.error(data);
  }
}

// --- ORDER SORT/REMOVE ---
let sortKeyOrderTable = $state('category');
let sortAscOrderTable = $state(true);
let sortedToDoOrder = $derived.by(() => {
  let arr = [...toDoOrder];
  arr.sort((a, b) => {
    let aVal = a[sortKeyOrderTable] ?? '';
    let bVal = b[sortKeyOrderTable] ?? '';
    if (!isNaN(aVal) && !isNaN(bVal)) {
      aVal = +aVal;
      bVal = +bVal;
    }
    if (aVal === bVal) return 0;
    return sortAscOrderTable ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });
  return arr;
});
function removeItem(item) {
  if (confirm("אם תלחצו אישור, המוצר יוסר מרשימה.")) {
    toDoOrder = toDoOrder.filter(i => !(i.name === item.name && i.category === item.category));
    selectedProducts[`${item.category}_${item.name}`] = false;
    productExecutedBy[`${item.category}_${item.name}`] = '';
    productQuantities[`${item.category}_${item.name}`] = undefined;
  }
}
function sortOrderTable(key) {
  if (sortKeyOrderTable === key) {
    sortAscOrderTable = !sortAscOrderTable;
  } else {
    sortKeyOrderTable = key;
    sortAscOrderTable = true;
  }
}
</script>
<ScrollUp />
<h1>הצעת מחיר / הזמנה</h1>
<div class="form-container">
  <div class="toggleCustomesIndex">
    <div class="name-input-container">
      <div style="display: flex; position: relative;">
        <input
  type="text"
  bind:value={customer.name}
  oninput={onNameInput}
  onkeydown={handleKeydown}
  placeholder="שם הלקוח (פרטי או משפחה)"
  disabled={showInputs}
  autocomplete="off"
  autocorrect="off"
  autocapitalize="off"
  spellcheck="false"
  name="ignore-autocomplete"   
  id="ignore-autocomplete"
  data-form-autocomplete="off"     
  aria-autocomplete="none"        
  tabindex="0"
  style="width:50%;font-size: 1.1em; background: #f0f0f0; margin:0 0 10px 0; border-radius:10px; padding: 10px;"
/>

        {#if showInputs}
          <button
            style="position: absolute; right:calc(50% - 30px); height: 50%; top:50%; transform: translateY(calc(-50% - 5px)); padding: 0px 10px;"
            onclick={() => {
              if (confirm("אם תלחצו אישור, פרטי הלקוח ימחקו. התאריך, השעה וכתובת המשלוח יישארו כמו שהם.")) {
                customer.name = '';
                showInputs = false;
              }
            }}
          >
            נקה
          </button>
        {:else}
          {#if !showInputs && !showNewUserPrompt} 
          <button 
            style="position: absolute; right:calc(50% - 60px); height: 50%; top:50%; transform: translateY(calc(-50% - 5px)); padding: 0px 10px;"
            onclick={onNewCustomerClick}
          >
            לקוח חדש
          </button>
        {/if}
        {/if}
      </div>
      {#if nameSuggestions.length > 0}
        <ul class="suggestion-list" role="listbox">
          {#each nameSuggestions as suggestion, index}
            <li
              bind:this={suggestionRefs[index]}
              class:selected={index === selectedIndex}
              role="option"
              aria-selected={index === selectedIndex}
              tabindex="-1"
            >
              <button
                type="button"
                style="all: unset; cursor: pointer; width: 100%; display: block;"
                onclick={() => selectCustomer(suggestion)}
                tabindex="0"
              >
                {suggestion.firstName || ''} {suggestion.lastName || ''} -
                {suggestion.phone || 'ללא טלפון'} -
                {suggestion.address || 'ללא כתובת'} -
                מס׳ לקוח {suggestion.id != null ? suggestion.id : '---'}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
      {#if showNewUserPrompt && !showInputs}
        <div class="new-user-confirm">
          לקוח לא נמצא.
          <button onclick={()=>{showcustomersForm = true; showNewUserPrompt = !showNewUserPrompt}}>הוסף כלקוח חדש</button>
        </div>
      {/if}
      <div>
        {#if showcustomersForm}
          <div in:scale={{duration:1000}} out:scale={{duration:1000}}>
            <div class="edit-form-container">
              <CustomerForm
                customer={selectedCustomer}
                isEdit={selectedCustomer !== null}
                on:save={handleSave}
                on:cancel={handleCancel}
              />
            </div>
          </div>
        {/if}
        {#if showInputs && !showcustomersForm}
          
          <div in:fly={{duration:500, y:200}} out:fly={{duration:500, y:-200}} style="width: 50%;">
            <div style="position: relative;">
            <input type="text"  style="width: 100%;" bind:value={customer.id} placeholder="customer id" readonly/>
            {#if !showcustomersForm}
            <button onclick={openEditCustomer}
              style='margin-right:10px; padding:0px 10px; height:50%; position: absolute; top:50%;
                     right: 100%; transform: translateX(calc(50% + 20px)) translateY(calc(-50%))'> ערוך </button>
          {/if}
          </div>
            <input type="text"  style="width: 100%;" bind:value={customer.firstName} placeholder="firstName" readonly/>
            <input type="text"  style="width: 100%;" bind:value={customer.lastName} placeholder="lastName" readonly/>
            <input type="text"  style="width: 100%;" bind:value={customer.phone} placeholder="phone" readonly/>
            <input type="text"  style="width: 100%; margin-bottom: 10px;" bind:value={customer.address} placeholder="phone" readonly/>
          </div>
        {/if}
        <div>
          <input
            type="text"
            bind:value={orderDelveryFullAdd}
            onclick={() => showDeliveryInputs = !showDeliveryInputs}
            placeholder="כתובת המשלוח"
            id="missingDetails"
            autocomplete="off"
            readonly
            style="cursor:pointer; width:50%; border-radius:10px; margin:0 0 10px 0; font-size: 1.1em; padding: 10px; background: #f0f0f0; border: 1px solid #ccc;"
          />
        </div>
        {#if showDeliveryInputs}
          <div style=" width:50%; position: relative;"
            in:fly={{ duration: 750, x: -500 }}
            out:fly={{ duration: 750, x: 500 }}
            onintroend={() => {
              const input = document.querySelector('#street-input');
              input?.focus();
            }}
          >
            <button
              onclick={() => showDeliveryInputs = false}
              style="position: absolute; right:5px; top:0px;"
            >סגור</button>
            <AddressAutocomplete
              city={customer.deliveryCity}
              street={customer.deliveryPlace}
              houseNumber={customer.deliveryPlaceNumber}
              houseNotes={customer.deliveryPlaceNote}
              on:streetSelect={(e) => {
                customer.deliveryCity        = e.detail.city;
                customer.deliveryPlace       = e.detail.streetName;
                customer.deliveryPlaceNumber = e.detail.streetNumber;
                customer.deliveryPlaceNote   = e.detail.streetNote;
                showDeliveryInputs = false;
              }}
            />
          </div>
        {/if}
        <div>
          <DateTimePicker
            date={customer.dateOfSuplay}
            time={customer.houerOfSuplay}
            idDate="date-input"
            idTime="time-input"
            {warning}
            on:dateOrTimeChange={(e) => {
              customer.dateOfSuplay = e.detail.date;
              customer.houerOfSuplay = e.detail.time;
            }}
          />
          <Tafritim
            on:MachirMana={(data) => {
              customer.orderBasePrice = data.detail.price;
              SelectedTafrit = data.detail.sugTafrit;
              customer.numOfSets = data.detail.numberOfPuple;
              tafritimFixedPrice = data.detail.price;
            }}
            on:updateOrderItems={(e) => toDoOrder = e.detail.items }
            bind:numberOfPuple = {customer.numOfSets }
            bind:selectedProducts = {selectedProducts}
            bind:productExecutedBy
            bind:productQuantities
          />
          {#if customer.orderDay && !warning}
            <span class="lachmajun-hebrew-day">יום {customer.orderDay}</span>
          {/if}
        </div>
        {#if warning}
          <div class="lachmajun-warning">{warning}</div>
        {/if}
      </div>
    </div>
  </div>
<!-- ... (the rest of your markup remains unchanged) ... -->


<!-- sum acount section -->

<div class="sumAcount upgradedSumAcount">
  <!-- Hot/Cold Radio -->
  <label class="sumLabel" for="hotOrCold-hot">אוכל חם / קר:</label>
  <div class="radio-group">
    <label class="radio-option" for="hotOrCold-hot">
      <input id="hotOrCold-hot" type="radio" name="hotOrCold" bind:group={customer.hotOrCold} value="חם" />
      <span>חם</span>
    </label>
    <label class="radio-option" for="hotOrCold-cold">
      <input id="hotOrCold-cold" type="radio" name="hotOrCold" bind:group={customer.hotOrCold} value="קר" />
      <span>קר</span>
    </label>
  </div>

  <!-- Number of People -->
  <label class="sumLabel" for="numOfSetsInput">כמות אנשים:</label>
  <input
    id="numOfSetsInput"
    class="sumInput"
    type="number"
    bind:value={customer.numOfSets}
    min="1"
    placeholder="כמות מנות"
    autocomplete="off"
  />

  <!-- Price per Plate -->
  <label class="sumLabel" for="orderBasePriceInput">מחיר למנה:</label>
  <div class="input-warning-wrap">
    <input
      id="orderBasePriceInput"
      class="sumInput"
      type="number"
      bind:value={customer.orderBasePrice}
      placeholder="מחיר למנה"
      style:border-color={tafritimFixedPrice !== null && customer.orderBasePrice != tafritimFixedPrice ? 'red' : ''}
      style:background={tafritimFixedPrice !== null && customer.orderBasePrice != tafritimFixedPrice ? '#ffeaea' : ''}
      autocomplete="off"
    />
    {#if tafritimFixedPrice !== null && customer.orderBasePrice != tafritimFixedPrice}
      <span class="input-warning">
        מחיר זה שונה מהמחיר הקבוע של התפריט ({tafritimFixedPrice} ש"ח)
      </span>
    {/if}
  </div>

  <!-- Total Price (readonly) -->
  <label class="sumLabel" for="orderPriceInput">סה״כ לתשלום:</label>
  <input
    id="orderPriceInput"
    class="sumInput"
    type="number"
    bind:value={orderPrice}
    placeholder="סה״כ לתשלום"
    readonly
  />

  <!-- Delivery Price -->
  <label class="sumLabel" for="orderDeliveryPriceInput">עלות משלוח:</label>
  <input
    id="orderDeliveryPriceInput"
    class="sumInput"
    type="number"
    bind:value={customer.orderDeliveryPrice}
    min="0"
    placeholder="עלות משלוח"
    autocomplete="off"
  />

  <!-- Grand Total (readonly) -->
  <label class="sumLabel" for="orderTotalPriceInput">סה״כ כולל משלוח:</label>
  <input
    id="orderTotalPriceInput"
    class="sumInput"
    type="number"
    bind:value={orderTotalPrice}
    placeholder="סה״כ כולל משלוח"
    readonly
  />

  <!-- Comments -->
  <label class="sumLabel" for="orderCommentsInput" style="grid-column: 1/3;">הערות:</label>
  <textarea
    id="orderCommentsInput"
    class="sumTextarea"
    bind:value={customer.comments}
    rows="2"
    placeholder="הערות"
    style="grid-column: 1/3;"
  ></textarea>
</div>

<div class="buttons sumAcount-buttons">
  {#if customer.dateOfSuplay && customer.houerOfSuplay && customer.deliveryPlace}
    <button type="button" onclick={sendOrder}>שמור הזמנה</button>
  {:else}
    <button type="button" class="missing-fields-btn">
      נא למלא את כל השדות:
      {#if !customer.deliveryPlace}
        <a href="#missingDetails" class="highlight-link"> <span class="buttonSpan">כתובת אספקה -</span></a>
      {/if}
      {#if !customer.dateOfSuplay}
        <a href="#lachmajun-dateOfSuplay" class="highlight-link"> <span class="buttonSpan">תאריך אספקה -</span></a>
      {/if}
      {#if !customer.houerOfSuplay}
        <a href="#lachmajun-houerOfSuplay" class="highlight-link"> <span class="buttonSpan">שעת אספקה</span></a>
      {/if}
    </button>
  {/if}
  <button type="button" onclick={printPage}>הדפס</button>
</div>
</div>
 <div class="orderCheckout">
  {#if sortedToDoOrder.length === 0}
    <h1>לא נוספו פריטים להזמנה</h1>
  {:else}
    <h2 style="text-align: center;">הזמנה סופית - <span>{customer.name}</span></h2>
    <table>
      <thead>
  <tr style="cursor: pointer;">
    <th onclick={() => sortOrderTable('name')}>
      שם הפריט
      {#if sortKeyOrderTable === 'name'}
        {sortAscOrderTable ? ' ↑' : ' ↓'}
      {/if}
    </th>
    <th onclick={() => sortOrderTable('category')}>
      קטגוריה
      {#if sortKeyOrderTable === 'category'}
        {sortAscOrderTable ? ' ↑' : ' ↓'}
      {/if}
    </th>
    <th onclick={() => sortOrderTable('quantity')}>
      כמות
      {#if sortKeyOrderTable === 'quantity'}
        {sortAscOrderTable ? ' ↑' : ' ↓'}
      {/if}
    </th>
    <th onclick={() => sortOrderTable('total')}>
      סה״כ
      {#if sortKeyOrderTable === 'total'}
        {sortAscOrderTable ? ' ↑' : ' ↓'}
      {/if}
    </th>
    <th onclick={() => sortOrderTable('ExecutedBy')}>
      יבוצע ע״י
      {#if sortKeyOrderTable === 'ExecutedBy'}
        {sortAscOrderTable ? ' ↑' : ' ↓'}
      {/if}
    </th>
    <th onclick={() => sortOrderTable('comment')}>
      הערות
      {#if sortKeyOrderTable === 'comment'}
        {sortAscOrderTable ? ' ↑' : ' ↓'}
      {/if}
    </th>
      <th>הסר</th>
  </tr>
</thead>

      <tbody>
  {#each sortedToDoOrder as item}
    <tr class:orderdItem={item.quantity > 0} in:fly={{duration:500, y:200}} out:fly={{duration:500, y:200}}>
      <td>{item.name}</td>
      <td>{item.category.split(' ').slice(0, 2).join(' ')}</td>
      <td>{item.quantity}</td>
      <td>{item.total}</td>
      <td>{item.ExecutedBy}</td>
      <td>{item.comment}</td>
       <td style='text-align:center'>
        <button onclick={() => removeItem(item)} title="הסר פריט" style="padding:5px 10px">❌</button>
      </td>
    </tr>
  {/each}
</tbody> </table>
  {/if}
</div>

<!-- item: category, name, product_id: product.product_id || null, quantity: Number(productQuantities[key]) || 1,
        ExecutedBy: productExecutedBy[key] || '', comment: productComments[key] || '', total: category === 'סלטים'
      ? getSaladTotal(product)
      : ((Number(productQuantities[key]) || 0) * (Number(numberOfPuple) || 1)), -->
<style>
  body {
  font-family: Arial, sans-serif;
  background: #f7f8fa;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 14px;
  font-family: inherit;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

h2 {
  margin-top: 30px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

input::placeholder,
textarea::placeholder,
select {
  direction: rtl;
}

select {
  width: 90%;
  padding: 8px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #fff;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%23000' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 10px center;
  background-size: 10px 6px;
  padding-left: 30px;
}

select:focus {
  border-color: #007BFF;
  outline: none;
  box-shadow: 0 0 5px rgba(0,123,255,0.5);
}

/* =========================
   SumAcount (Order Summary)
   ========================= */
.sumAcount,
.sumAcount.upgradedSumAcount {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 18px 30px;
  margin: 30px auto 20px auto;
  padding: 28px 30px 22px 30px;
  background: #fff;
  border: 1.5px solid #ddd;
  border-radius: 14px;
  box-shadow: 0 2px 12px #0001;
  max-width: 680px;
  font-size: 1.14em;
  direction: rtl;
  font-family: inherit;
}

.sumAcount .sumLabel {
  color: #242424;
  font-weight: 600;
  margin-bottom: 0.15em;
  letter-spacing: 0.04em;
}

.sumAcount .sumInput,
.sumAcount .sumTextarea {
  box-shadow: 0 1px 3px #0001;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  padding: 9px 13px;
  font-size: 1em;
  margin: 2px 0 10px 0;
  transition: border-color 0.18s, box-shadow 0.18s;
  width: 96%;
  background: #fff;
}

.sumAcount .sumInput:focus,
.sumAcount .sumTextarea:focus {
  border-color: #007acc;
  background: #f6fafd;
  outline: none;
}

.sumAcount .radio-group {
  display: flex;
  gap: 38px;
  align-items: center;
}

.sumAcount .radio-option {
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: normal;
  font-size: 1em;
}

.sumAcount .radio-option input[type="radio"] {
  accent-color: #007acc;
  margin-left: 4px;
  cursor: pointer;
}

.sumAcount .radio-option span {
  font-size: 1em;
  font-weight: 500;
}

.sumAcount .input-warning-wrap {
  position: relative;
}

.sumAcount .input-warning {
  position: absolute;
  top: 50%;
  left: 110%;
  transform: translateY(-50%);
  font-size: 0.95em;
  color: #b30000;
  white-space: nowrap;
  z-index: 10;
}

.sumAcount-buttons,
.buttons {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 18px;
}

.sumAcount .missing-fields-btn {
  background: #ffdbdb;
  color: #a70000;
  border: 1.5px solid #fbb;
  font-weight: bold;
  box-shadow: none;
}
.sumAcount .missing-fields-btn .buttonSpan {
  color: #b30000;
}

/* ======================
   Universal Inputs/Buttons
   ====================== */
input[type='number'],
input[type='text'],
input[type='date'],
input[type='time'],
textarea {
  font-family: inherit;
}

input[type='number'] {
  width: 70%;
  padding: min(8px, 1vw);
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
input[type='text'],
input[type='date'],
input[type='time'] {
  width: 90%;
  height: 1.5rem;
  padding: 8px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

textarea {
  resize: vertical;
}

button {
  padding: 10px 20px;
  border: none;
  background: #000000;
  color: white;
  border: solid 1px #000000;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

button:hover {
  background: #ffffff;
  border: solid 1px #000000;
  color: #000000;
}
button:active {
  filter: brightness(0.92);
}

.buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* ======================
   Table Styles
   ====================== */
.orderCheckout {
  margin: 30px auto 100px auto;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 10px;
  max-width: 1200px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  direction: rtl;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: right;
}

th {
  background: #f4f4f4;
  cursor: pointer;
  user-select: none;
}

tr.orderdItem {
  background-color: #b3e7ff; /* light blue background */
  font-weight: bold;
}

tr {
  display: grid;
  grid-template-columns: 1.5fr 0.7fr 0.4fr 0.4fr 0.4fr 1.5fr 0.4fr;
}

/* ======================
   Suggestions, Alerts, Warnings
   ====================== */
.suggestion-list {
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  max-width: 52%;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.95em;
  font-family: inherit;
  box-sizing: border-box;
  z-index: 1000;
  padding: 5px;
  margin: 0;
  list-style: none;
  direction: rtl;
  position: absolute;
  right: 0;
  left: 0;
}

.suggestion-list li {
  padding: 8px 10px;
  cursor: pointer;
}

.suggestion-list li:hover {
  background-color: #f0f0f0;
}
.suggestion-list li.selected {
  background-color: #eee;
  font-weight: bold;
}

.new-user-confirm {
  margin-top: 5px;
  max-width: 50%;
  color: #b30000;
  background: #ffeaea;
  padding: 10px;
  border: 1px solid #ffbfbf;
  border-radius: 5px;
  margin-bottom: 10px;
}

.input-warning-wrap {
  position: relative;
}
.input-warning {
  position: absolute;
  top: 50%;
  left: 33%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: #b30000;
}

/* ======================
   Misc. Styling
   ====================== */
.name-input-container {
  position: relative;
  width: 100%;
}

.highlight-link {
  color: rgb(255, 255, 177);
  text-decoration: underline;
  font-weight: bold;
  cursor: pointer;
}
button:hover .buttonSpan {
  color: #000000;
}
button:hover .buttonSpan:hover {
  color: #ff0000;
}

#lachmajun-dateOfSuplay,
#lachmajun-houerOfSuplay,
#missingDetails {
  background-color: #fff5f5;
  border: 1px solid red;
  color: red;
  font-weight: bold;
  scroll-margin-top: 150px; /* Adjust as needed */
}

.lachmajun-input {
  padding: 8px;
  border-radius: 4px;
  border: 2px solid #ccc;
  font-size: 16px;
}
.lachmajun-input.invalid {
  border-color: red;
  background-color: #ffe6e6;
}
.lachmajun-warning {
  color: red;
  margin-top: 4px;
  font-weight: bold;
}
.lachmajun-hebrew-day {
  margin-top: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #006400;
}

/* ======================
   Print styles
   ====================== */
@media print {
  button, input, textarea {
    display: none !important;
  }
  .form-container {
    border: none;
    box-shadow: none;
    padding: 0;
  }
}

/* ======================
   Responsive design
   ====================== */
@media (max-width: 800px) {
  .form-container,
  .orderCheckout {
    padding: 12px 2vw;
    max-width: 95vw;
    font-size: 1em;
  }

  .sumAcount,
  .sumAcount.upgradedSumAcount {
    max-width: 100vw;
    padding: 18px 4vw;
    font-size: 1em;
    grid-template-columns: 1fr;
    gap: 14px 0;
  }
  .sumAcount .sumInput,
  .sumAcount .sumTextarea {
    width: 100%;
  }
  tr {
    grid-template-columns: repeat(7, 1fr);
  }
}

/* ======================
   RTL tweaks
   ====================== */
body,
.form-container,
.sumAcount,
.orderCheckout,
.suggestion-list,
table {
  direction: rtl;
}

</style>
