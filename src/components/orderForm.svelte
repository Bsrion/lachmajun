<script>

import CustomerForm from '../lib/CustomerForm.svelte';
import { onMount } from 'svelte';
import { blur, crossfade, draw, fade, fly, scale, slide} from 'svelte/transition';
import AddressSearch from '../components/AddressAutocomplete.svelte';
import DateTimePicker from '../components/DatePicker.svelte';
import Tafritim from '../components/tafritim.svelte'

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
    numOfSets: 1,
    orderBasePrice: null,
    orderDeliveryPrice: null,
    // orderTotalPrice: 0,
    orderItems: [],

  });


  let orderPrice = $derived(customer.orderBasePrice * customer.numOfSets);
  let orderTotalPrice = $derived(orderPrice + customer.orderDeliveryPrice);
  let orderDelveryFullAdd = $derived(customer.deliveryPlace + ' ' + customer.deliveryPlaceNumber + ', ' + customer.deliveryCity + ' - ' + customer.deliveryPlaceNote)  ;
  let showDeliveryInputs = $state(false);
  let SelectedTafrit = $state('TafritHofshi');
  let tafritimFixedPrice = $state(null);

  let showInputs = $state(false);
  const optionsByCategory = {
  'סלטים': ['חומוס', 'טחינה', 'סלט גזר', 'סלט כרוב', 'סלט ירקות קצוץ'],
  'רטבים לסלט': ['וינגרט', 'רוטב שום לימון', 'בלסמי', 'צ׳ילי מתוק'],
  'מבחר עיקריות': ['שניצל', 'פרגיות בתנור', 'קציצות ברוטב עגבניות', 'חזה עוף', 'מוסקה'],
  'מבחר תוספות': ['אורז לבן', 'קוסקוס', 'תפוחי אדמה בתנור', 'פירה'],
  'מבחר ממולאים / ראשונות': ['עלי גפן', 'קובה', 'בורקס גבינה', 'לביבות ירק'],
  'לחמים': ['לחמניות', 'פיתות', 'חלה'],
  'שתייה': ['מים מינרלים', 'קולה', 'ספרייט', 'מים בטעמים'],
  'חדפעמי': ['צלחות', 'סכום', 'כוסות', 'מפות'],
  'אלומיניום לתיבול': ['מגש אלומיניום קטן', 'מגש אלומיניום גדול'],
  'שונות': ['מגבונים', 'ניילון נצמד', 'נייר כסף']
};

// product list from server
let products = $state([]);
 onMount(async () => {
    try {
      const res = await fetch('https://dilen-digital.co.il/api/production.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      products = await res.json();
    } catch (e) {
      error = e.message;
    }
  });

  // product list from server


let orderItems = $state([
  { category: 'סלטים', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['סלטים'] },
  { category: 'רטבים לסלט', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['רטבים לסלט'] },
  { category: 'מבחר עיקריות', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['מבחר עיקריות'] },
  { category: 'מבחר תוספות', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['מבחר תוספות'] },
  { category: 'מבחר ממולאים / ראשונות', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['מבחר ממולאים / ראשונות'] },
  { category: 'חד פעמי', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['חדפעמי'] },
  { category: 'אלומיניום לתיבול', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['אלומיניום לתיבול'] },
  { category: 'לחמים', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['לחמים'] },
  { category: 'שתייה', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['שתייה'] },
  { category: 'שונות', name: '', quantity: null, amount: null, comment: '', options: optionsByCategory['שונות'] }
]);


function maybeAddNewRow(item) {
  // Check if this item is the last in its category
  const itemsInCategory = orderItems.filter(i => i.category === item.category);
  const isLast = itemsInCategory[itemsInCategory.length - 1] === item;

  // If it's the last row in category and has a name or quantity > 0, add a new empty row
  if (isLast && (item.name.trim() !== '' || item.quantity > 0)) {
    orderItems = [
      ...orderItems,
      {
        category: item.category,
        name: '',
        quantity: 0,
        amount: 0,
        comment: '',
        options: optionsByCategory[item.category] || []
      }
    ];
  }
}


  let toDoOrder = $derived.by(() =>
    orderItems.filter(i => i.quantity > 0 && i.name !== ''));

  function printPage() {
    window.print();
  }

 async function sendOrder() {
  if (!customer.firstName || !customer.lastName || !customer.phone || !customer.address) {
  alert("יש למלא את כל שדות החובה");
  return;
}
 
   // אם זה לקוח חדש – צור אותו קודם
  if (isNewCustomer) {
    const createRes = await fetch('https://dilen-digital.co.il/api/add_customer.php', {
      method: 'POST',
      body: JSON.stringify(customer),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!createRes.ok) {
      alert('שגיאה ביצירת לקוח חדש');
      return;
    }

    const newCustomerData = await createRes.json();
    customer.id = newCustomerData.id; // אם ה-API מחזיר את ה-id של הלקוח
  }
            

  // המשך בשליחת ההזמנה
  const response = await fetch("https://dilen-digital.co.il/api/submit_order.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: customer.id,
      order_data: {
        customer,
        items: orderItems.filter(i => i.quantity > 0)
      }
    })
  });

  const data = await response.json();
  if (data.success) {
     alert(`הזמנה נשלחה! מספר הזמנה: ${data.order_num}`);
  
  // איפוס פרטי הלקוח
  customer = [...startPointCustomer];


  // איפוס פרטי ההזמנה
  orderItems = orderItems.map(item => ({
    ...item,
    quantity: 0
  }));

  // אם אתה משתמש ב-state (למשל Svelte עם Runes או reactive vars), תצטרך גם להפעיל update

} else {
  alert('שגיאה בשליחת הזמנה');
  console.error(data);
}
}


  let nameSuggestions = $state([]);
  let showNewUserPrompt = $state(false);
  let selectedIndex = $state(-1);
  let suggestionRefs = $state([]);
  let warning = $state('');

async function onNameInput() {
  const input = customer.name.trim();
  selectedIndex = -1;

  if (input.length < 1) {
    nameSuggestions = [];
    showNewUserPrompt = false;
    return;
  }

  const url = `https://dilen-digital.co.il/api/customers_list.php`;
  const params = new URLSearchParams();

  if (/^\d+$/.test(input)) {
    params.append('id', input);
  } else {
    params.append('q', input);
  }

  const res = await fetch(`${url}?${params.toString()}`);

  if (res.ok) {
    const results = await res.json();
    nameSuggestions = results;
    showNewUserPrompt = results.length === 0;
  } else {
    nameSuggestions = [];
    showNewUserPrompt = false;
  }
}

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
  }else if (event.key === 'Escape') {
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

let isNewCustomer = $state(false);

function selectCustomer(cust) {
  showInputs = true;
  customer = {
    ...customer,
    ...cust,
    name: `${cust.firstName} ${cust.lastName} - ${cust.phone} - ${cust.address}` // optional, for display only
  };
  nameSuggestions = [];
  showNewUserPrompt = false;n
  isNewCustomer = false;
}

let showcustomersForm = $state(false);

// convert date to dd/mm/yyyy
  function formatToDDMMYYYY(isoDate) {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  }


	function handleSave(event) {
		const { updatedCustomer } = event.detail;
		showcustomersForm = false; // hide form
	}
  function handleCancel() {
		showcustomersForm = false;
	}
</script>
  <h1>הצעת מחיר / הזמנה</h1>

<div class="form-container">
  <div class="toggleCustomesIndex">
  <label>חפש לקוח קיים</label>
  
  <!-- Name search input -->
  <div class="name-input-container">
  <div style="display: flex; position: relative;">
    <input
  type="text"
  bind:value={customer.name}
  oninput={onNameInput}
  onkeydown={handleKeydown}
  placeholder="שם הלקוח (פרטי או משפחה)"
  disabled={showInputs}
/>

    {#if showInputs}
      <button
        style=" position: absolute; left: 110px; height: 50%; top:50%; transform: translateY(-50%); padding: 0px 10px;"
        onclick={() => {
          if (confirm("אם תלחצו אישור, פרטי הלקוח ימחקו. התאריך, השעה וכתובת המשלוח יישארו כמו שהם.")) {
            customer.name = '';
            showInputs = false;
          }
        }}
      >
        clear
      </button>
    {/if}
  </div>


    <!-- Suggestions dropdown -->
{#if nameSuggestions.length > 0}
  <ul class="suggestion-list">
    {#each nameSuggestions as suggestion, index}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <li
    bind:this={suggestionRefs[index]}
    class:selected={index === selectedIndex}
    onclick={() => selectCustomer(suggestion)}
  >
    {suggestion.firstName || ''} {suggestion.lastName || ''} -
    {suggestion.phone || 'ללא טלפון'} -
    {suggestion.address || 'ללא כתובת'} -
    מס׳ לקוח {suggestion.id != null ? suggestion.id : '---'}
  </li>
{/each}
  </ul>
{/if}

    <!-- New customer prompt -->
    {#if showNewUserPrompt && !showInputs}
      <div class="new-user-confirm">
        לקוח לא נמצא.
        <button onclick={()=>{showcustomersForm = true; showNewUserPrompt = !showNewUserPrompt}}>הוסף כלקוח חדש</button>
      </div>
    {/if}

  <!-- Toggle form for fully new customers -->
  <div>
  <button onclick={() => showcustomersForm = !showcustomersForm} style="margin:10px 0;">
  {#if !showcustomersForm}
    לקוח חדש
    {:else}
    סגור חלון
  {/if}
  </button>
  {#if showcustomersForm}
  <div in:scale={{duration:1000}} out:scale={{duration:1000}}>
         <div class="edit-form-container">
    	<CustomerForm
		on:save={handleSave}
		on:cancel={handleCancel}
	/>
  </div>
  </div>
  {/if}
    {#if showInputs}
    <button onclick={editCustomerFilds} style='margin-right:10px'> ערוך פרטי לקוח </button>
    <div in:fly={{duration:500, y:200}} out:fly={{duration:500, y:-200}}>
    <input type="text"  bind:value={customer.id} placeholder="customer id" readonly/>
    <input type="text"  bind:value={customer.firstName} placeholder="firstName"/>
    <input type="text"  bind:value={customer.lastName} placeholder="lastName"/>
    <input type="text"  bind:value={customer.phone} placeholder="phone"/>
    <input type="text"  bind:value={customer.address} placeholder="phone"/>
    </div>
    {/if}
    <div> <input
  type="text"
  bind:value={orderDelveryFullAdd}
  onclick={() => showDeliveryInputs = !showDeliveryInputs}
  placeholder="כתובת המשלוח"
  id="missingDetails"
  autocomplete="off"
  readonly
  style="cursor:pointer; width:50%"
/></div>

{#if showDeliveryInputs}
  <div
    style="position: relative;"
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
    >
      close
    </button>

   <AddressSearch
  city={customer.deliveryCity}
  street={customer.deliveryPlace}
  houseNumber={customer.deliveryPlaceNumber}
  houseNotes={customer.deliveryPlaceNote}
  on:streetSelect={(e) => {
    customer.deliveryCity        = e.detail.city;
    customer.deliveryPlace       = e.detail.streetName;
    customer.deliveryPlaceNumber = e.detail.streetNumber;
    customer.deliveryPlaceNote       = e.detail.streetNote;
    showDeliveryInputs = false;
  }}
/>

  </div>
{/if}

  <div><div>
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
    tafritimFixedPrice = data.detail.price; // Add this line!
  }}
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
</div>



<!-- sum acount section -->

<div class="sumAcount">
  <label class="sumLabel">אוכל חם / קר:</label>
  <div class="radio-group">
    <label class="radio-option">
      <input type="radio" name="hotOrCold" bind:group={customer.hotOrCold} value="חם" />
      <span>חם</span>
    </label>
    <label class="radio-option">
      <input type="radio" name="hotOrCold" bind:group={customer.hotOrCold} value="קר" />
      <span>קר</span>
    </label>
  </div>

  <label class="sumLabel">כמות אנשים:</label>
  <input class="sumInput" type="number" bind:value={customer.numOfSets} min="1" placeholder="כמות מנות" />

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
  />
  {#if tafritimFixedPrice !== null && customer.orderBasePrice != tafritimFixedPrice}
    <span class="input-warning">
      מחיר זה שונה מהמחיר הקבוע של התפריט ({tafritimFixedPrice} ש"ח)
    </span>
  {/if}
</div>

  <label class="sumLabel">סה״כ לתשלום:</label>
  <input class="sumInput" type="number" bind:value={orderPrice} placeholder="סה״כ לתשלום" readonly />

  <label class="sumLabel">עלות משלוח:</label>
  <input class="sumInput" type="number" bind:value={customer.orderDeliveryPrice} min="0" placeholder="עלות משלוח" />

  <label class="sumLabel">סה״כ כולל משלוח:</label>
  <input class="sumInput" type="number" bind:value={orderTotalPrice} placeholder="סה״כ כולל משלוח" readonly />

  <label class="sumLabel" style="grid-column: 1/3;">הערות:</label>
  <textarea class="sumTextarea" bind:value={customer.comments} style="grid-column: 1/3;" rows="2" placeholder="הערות"></textarea>
</div>

  <div class="buttons">
    {#if customer.dateOfSuplay && customer.houerOfSuplay && customer.deliveryPlace}
    <button onclick={sendOrder}>שמור הזמנה </button>
    {:else}
    <button>נא למלא את כל השדות: 
        {#if !customer.deliveryPlace}
      <a href="#missingDetails" class="highlight-link"> <span class="buttonSpan" > כתובת אספקה -</span></a>
    {/if}
    {#if !customer.dateOfSuplay}
     <a href="#lachmajun-dateOfSuplay" class="highlight-link"> <span class="buttonSpan" >תאריך אספקה -</span></a>
    {/if}
    {#if !customer.houerOfSuplay}
      <a href="#lachmajun-houerOfSuplay" class="highlight-link"> <span class="buttonSpan" >שעת אספקה</span></a>
    {/if}


    </button>
    {/if}
    <button onclick={printPage}>הדפס</button>
  </div>
</div>

  <div class="orderCheckout">
{#if toDoOrder.length === 0 && toDoOrder}
<h1>לא נוספו פריטים להזמנה</h1>
{:else}
    <h2 style="text-align: center;">הזמנה סופית - <span>{customer.name}</span></h2>
    <table>
      <thead>
        <tr>
          <th>פריט</th>
          <th>כמות</th>
          <th>סה״כ</th>
          <th>הערות</th>
          <th>נקה</th>
        </tr>
      </thead>
      <tbody>
        {#each toDoOrder as item}
          <tr class:orderdItem={item.quantity > 0}>
            <td>{item.name}</td>
            <td>{item.quantity}</td>
            <td>{item.amount}</td>
            <td>{item.comment}</td>
          </tr>
        {/each}
      </tbody>
    </table>
{/if}
  </div>

<style>
  .input-warning-wrap{
    position: relative;
  }
.input-warning{
  position: absolute;
  top:50%;
  left: 33%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: #b30000;
}

.sumAcount {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 12px 16px;
  margin: 20px 0 35px 0;
  padding: 18px 16px 12px 16px;
  background: #fafbfc;
  border: 1px solid #ddd;
  border-radius: 10px;
  direction: rtl;
  font-family: inherit;
  font-size: 1.09em;
}

.sumLabel {
  color: #222;
  font-weight: bold;
  margin-bottom: 0.15em;
  letter-spacing: 0.04em;
}

.sumInput {
  width: 85%;
  min-width: 95px;
  font-size: 1em;
  padding: 7px 10px;
  margin: 2px 0;
  border: 1.5px solid #ccc;
  border-radius: 5px;
  background: #fff;
  transition: border-color 0.18s;
}
.sumInput:focus {
  border-color: #007acc;
  outline: none;
  background: #f8fbff;
}

.sumTextarea {
  width: 99%;
  min-width: 120px;
  padding: 7px 12px;
  border: 1.5px solid #ccc;
  border-radius: 5px;
  background: #fff;
  font-size: 1em;
  resize: vertical;
  margin-bottom: 0.3em;
}

.radio-group {
  display: flex;
  gap: 24px;
  align-items: center;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: normal;
  font-size: 1em;
}

.radio-option input[type="radio"] {
  accent-color: #007acc;
  margin-left: 4px;
  cursor: pointer;
}

  .form-container {
    max-width:1200px;
    margin: 0 auto;
    padding: 20px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-family: Arial, sans-serif;
  }
  input::placeholder, textarea::placeholder, select {
  direction: rtl;
}

select {
  width: 90%;
  padding: 8px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #fff;
  font-family: Arial, sans-serif;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%23000' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
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

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  h2 {
    margin-top: 30px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
  }
  tr{
    display: grid;
    grid-template-columns: 1fr 0.5fr 0.5fr 2fr 0.4fr;
  }

  input[type='number'] {
    width: 70%;
    padding: min(8px, 1vw);
    margin: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  input[type='text'], input[type='date'], input[type='time'], textarea {
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

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: right;
  }

  th {
    background: #f4f4f4;
  }

  .buttons {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 20px;
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
  }

  button:hover {
    background: #ffffff;
    border: solid 1px #000000;
    color: #000000;
  }
tr.orderdItem {
  background-color: #b3e7ff; /* light blue background */
  font-weight: bold;
}
  
.orderCheckout {
    margin: 30px auto 100px auto;
    padding: 20px;
    background: #f9f9f9;
    border: 1px solid #ccc;
    border-radius: 10px;
    max-width: 1000px;
  }
/* .suggestion-list {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  padding: 0;
  margin: 0;
  list-style: none;
  direction: rtl;
} */
.suggestion-list {
 
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  padding: 0;
  margin: 0;
  list-style: none;
  direction: rtl;
}
.suggestion-list li {
  padding: 8px 10px;
  cursor: pointer;
}

.suggestion-list li:hover {
  background-color: #f0f0f0;
}
.new-user-confirm {
  margin-top: 5px;
  color: #b30000;
  background: #ffeaea;
  padding: 10px;
  border: 1px solid #ffbfbf;
  border-radius: 5px;
}
.sumAcount{
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  padding: 15px;
  background: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 5px;
}
 .suggestion-list li.selected {
    background-color: #eee;
    font-weight: bold;
  }

  #lachmajun-dateOfSuplay,
  #lachmajun-houerOfSuplay,
  #missingDetails {
    background-color: #fff5f5;
    border: 1px solid red;
    color: red;
    font-weight: bold;
    scroll-margin-top: 150px; /* Adjust this value as needed */
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
  .name-input-container {
  position: relative;
  width: 100%;
}

</style>
