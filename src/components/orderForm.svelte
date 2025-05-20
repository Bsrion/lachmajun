<script>

    import { readonly } from 'svelte/store';
import Customers from './customers.svelte';
import { blur, crossfade, draw, fade, fly, scale, slide} from 'svelte/transition';

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
    deliveryPlace:null,
    dateOfOrder:null,

  });
  


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
let orderItems = $state([
  { category: 'סלטים', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['סלטים'] },
  { category: 'רטבים לסלט', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['רטבים לסלט'] },
  { category: 'מבחר עיקריות', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['מבחר עיקריות'] },
  { category: 'מבחר תוספות', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['מבחר תוספות'] },
  { category: 'מבחר ממולאים / ראשונות', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['מבחר ממולאים / ראשונות'] },
  { category: 'חד פעמי', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['חדפעמי'] },
  { category: 'אלומיניום לתיבול', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['אלומיניום לתיבול'] },
  { category: 'לחמים', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['לחמים'] },
  { category: 'שתייה', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['שתייה'] },
  { category: 'שונות', name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory['שונות'] }
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


  let toDoOrder = $derived.by(() => orderItems.filter(i => i.quantity > 0 && i.name !== ''));

  function printPage() {
    window.print();
  }

 async function sendOrder() {
  if (!customer.name || !customer.phone || !customer.email || !customer.address) {
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
      user_id: 1,
      order_data: {
        customer,
        items: orderItems.filter(i => i.quantity > 0)
      }
    })
  });

  const data = await response.json();
  if (data.success) {
    alert(`הזמנה נשלחה! מספר הזמנה: ${data.order_num}`);
  } else {
    alert('שגיאה בשליחת הזמנה');
    console.error(data);
  }
}


let nameSuggestions = $state([]);
let showNewUserPrompt = $state(false);


async function onNameInput() {
  const input = customer.name.trim();
  if (input.length < 1) {
    nameSuggestions = [];
    showNewUserPrompt = false;
    return;
  }

  const res = await fetch(`https://dilen-digital.co.il/api/customers_list.php?q=${encodeURIComponent(input)}`);
  if (res.ok) {
    const results = await res.json();
    nameSuggestions = results;
    showNewUserPrompt = results.length === 0;
  } else {
    nameSuggestions = [];
    showNewUserPrompt = false;
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
  showNewUserPrompt = false;
  isNewCustomer = false;
}

let showcustomersForm = $state(false);

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
      placeholder="שם הלקוח (פרטי או משפחה)"
      disabled={showInputs}
    />

    {#if showInputs}
      <button
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
        {#each nameSuggestions as suggestion}
          <li onclick={() => selectCustomer(suggestion)}>
            {suggestion.firstName} {suggestion.lastName} - {suggestion.phone} - {suggestion.address}
          </li>
        {/each}
      </ul>
    {/if}

    {#if showInputs}
    <div in:fly={{duration:500, y:200}}>
    <input type="text"  bind:value={customer.firstName} placeholder="firstName"/>
    <input type="text"  bind:value={customer.lastName} placeholder="lastName"/>
    <input type="text"  bind:value={customer.phone} placeholder="phone"/>
    <input type="text"  bind:value={customer.address} placeholder="phone"/>
    <input type="text"  bind:value={customer.deliveryPlace} placeholder="כתובת המשלוח"/>
    <input type="date"  bind:value={customer.dateOfSuplay} placeholder="dateOfSuplay"/>
    <input type="time" bind:value={customer.houerOfSuplay} placeholder="houerOfSuplay"/>

    </div>
    {/if}
    <!-- New customer prompt -->
    {#if showNewUserPrompt}
      <div class="new-user-confirm">
        לקוח לא נמצא. <button onclick={confirmNewCustomer}>הוסף כלקוח חדש</button>
      </div>
    {/if}
  </div>

  <!-- Toggle form for fully new customers -->
  <button onclick={() => showcustomersForm = !showcustomersForm} style="margin-top:15px;">
    לקוח חדש
  </button>
  {#if showcustomersForm}
    <Customers client:load />
  {/if}
</div>


  {#each [...new Set(orderItems.map(i => i.category))] as category}
    <h2>{category}</h2>
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
        {#each orderItems.filter(i => i.category === category) as item, index}
          <tr class:orderdItem={item.quantity > 0} in:fly={{duration:350, y:-100}} out:fade={{duration:500}}>
                <td><select bind:value={item.name}>
                    <option value="" disabled>בחר</option>
                    {#each optionsByCategory[item.category] ?? [] as opt}
                      <option value={opt}>{opt}</option>
                    {/each}

  <!-- Show custom name if it's not already in the list -->
  {#if item.name && !optionsByCategory[item.category]?.includes(item.name)}
    <option value={item.name}>{item.name}</option>
  {/if}

  <option value="אחר">אחר</option>
</select>

{#if item.name === 'אחר'}
  <input
    type="text"
    placeholder="הקלד שם פריט"
    bind:value={item.customName}
    onkeydown={(e) => {
      if (e.key === 'Enter' && item.customName.trim()) {
        item.name = item.customName.trim();
        item.customName = '';
      }
    }}
    onblur={() => {
      if (item.customName.trim()) {
        item.name = item.customName.trim();
        item.customName = '';
      }
    }}
  />
{/if}


</td>
            <td>
              <input type="number" min="0" bind:value={item.quantity} />
            </td>
            <td>
              <input type="number" min="0" bind:value={item.amount} />
            </td>
            <td>
              <input type="text" bind:value={item.comment} placeholder="הערות" />
            </td>
            <td>
              <!-- <button onclick={(index) => {orderItems.splice(index, 1); }} >נקה פריט</button> -->
<button
        onclick={() => {
          // find the real index of this item in the full array
          const globalIdx = orderItems.findIndex(i => i === item);
                    if(index === 0) return;

          orderItems.splice(globalIdx, 1);   // remove it
          orderItems = [...orderItems];      // force-reactivity
        }}>
        {index}- נקה פריט
      </button></td>
      {#if orderItems.filter(i => i.category === category).length === index + 1}
            <td style = "border:none">
              <button onclick={()=>{
                  orderItems.push({ category: item.category, name: '', quantity: 0, amount: 0, comment: '', options: optionsByCategory[item.category] });
              }} >הוסף פריט</button>
            </td>
          {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {/each}

  <label>אוכל חם / קר</label>
  <input bind:value={customer.hotOrCold} placeholder="לדוגמה: חם" />

  <label>כמות אנשים:</label>
  <input type="number" placeholder="לדוגמה: 69" />

  // not working --- not working
  <label>הערות:</label>
  <textarea bind:value={customer.comments}></textarea>

  <div class="buttons">
    {#if customer.dateOfSuplay && customer.houerOfSuplay && customer.deliveryPlace}
    <button onclick={sendOrder}>שמור הזמנה </button>
    {:else}
    <button>:נא למלא את כל השדות 
{#if !customer.dateOfSuplay}
      <span style="color: yellow;">(תאריך אספקה)</span>
    {/if}
    {#if !customer.houerOfSuplay}
      <span style="color: yellow;">(שעת אספקה)</span>
    {/if}
    {#if !customer.deliveryPlace}
      <span style="color: yellow;">(כתובת אספקה)</span>
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
    <h2>הזמנה סופית</h2>
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
    grid-template-columns: 1fr 0.5fr 0.5fr 2fr 0.3fr;
  }

  input[type='number'] {
    width: 70%;
    padding: 8px;
    margin: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  input[type='text'], textarea {
    width: 90%;
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
    background: #007BFF;
    color: white;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background: #0056b3;
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
    max-width: 800px;
  }
.suggestion-list {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  max-height: 150px;
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
}

</style>
