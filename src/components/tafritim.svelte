<script>
  import { onMount } from 'svelte';
  import { blur, crossfade, draw, fade, fly, scale, slide} from 'svelte/transition';
  let { Tafritim : TafritProp = 'TafritHofshi'} = $props();
  import { createEventDispatcher } from "svelte";
    import { Duration } from 'svelte-ux';
    import { derived } from 'svelte/store';
    
  const dispatch = createEventDispatcher();

  let products = $state([]);
  let error = $state(null);
  let selectedProducts = $state({});
  let numberOfPuple = $state(1);
  let productQuantities = $state({});
  let productComments = $state({});
  let productExecutedBy = $state({});

  onMount(async () =>{ 
    try {
      const res = await fetch('https://dilen-digital.co.il/api/production.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      products = await res.json();

    } catch (e) {
      error = e.message;
    }
  });
  let salad_quantity = $state([]);

  onMount(async () =>{ 
    try {
      const res = await fetch('https://dilen-digital.co.il/api/get_salad_quantity.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      salad_quantity = await res.json();
    } catch (e) {
      error = e.message;
    }
  });

function getProductTotal(product, numberOfPuple, quantity) {
  console.log(product, 'quantity ' + quantity, 'numberOfPuple ' + numberOfPuple)
  if (!product) return '';
  const numPeople = Number(numberOfPuple) || 1;
  let perPerson = 0;
  if (numPeople <= 25) {
    perPerson = Number(product.less_then_25) || 0;
  } else {
    perPerson = Number(product.above_25) || 0;
  }
  const qty = Number(quantity) || 1;
  return (perPerson * numPeople * qty).toFixed(2);
}



 function getSaladTotal(product) {

  if (!product || product.category !== 'סלטים' || !numberOfPuple || !Array.isArray(salad_quantity)) return '';

  const row = salad_quantity.find(q => Number(q.product_id) === Number(product.product_id));
  if (!row) return '';

  const num = Number(numberOfPuple);
  if (isNaN(num)) return '';

  let col = '';
  if (num <= 16) col = '0_16';
  else if (num <= 26) col = '17_26';
  else if (num <= 36) col = '27_36';
  else if (num <= 52) col = '37_52';
  else if (num <= 62) col = '53_62';
  else if (num <= 72) col = '63_72';
  else col = '73_82';

  // Return string only, fallback to empty string
  const val = row[col];
  return (typeof val === 'string' && val) ? val : '';
}



let Tafritim = $state('TafritHofshi'); // Default value for Tafritim

  // Reactive block to update price whenever Tafritim changes
  
 function selectTafrit(sugTafrit) {
  switch (sugTafrit) {
    case 'TafritHofshi':
      return {price:null, sugTafrit, numberOfPuple};

    case 'emtsa_shavua_1':
      return {
        price: 75,
        max: {
          סלטים: 6,
          מנה_ראשונה: 0,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 4,
          ממולאים_1_לבחירה: 0,
          עיקרית: 3,
          עיקרית_2: 1,
          תוספות_חמות: 3,
          תוספות_חמות_בתוספת_תשלום: 0,
          לחמים: 1,
          לחמים_בתוספת_תשלום: 3
        },
        sugTafrit, numberOfPuple
      };

    case 'emtsa_shavua_2':
      return {
        price: 85,
        max: {
          סלטים: 7,
          מנה_ראשונה: 0,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 4,
          ממולאים_1_לבחירה: 1,
          עיקרית: 3,
          עיקרית_2: 0,
          תוספות_חמות: 3,
          תוספות_חמות_בתוספת_תשלום: 0,
          לחמים: 1,
          לחמים_בתוספת_תשלום: 3
        },
        sugTafrit, numberOfPuple
      };

    case 'seudat_mitsva_1':
      return {
        price: 59,
        max: {
          סלטים: 5,
          מנה_ראשונה: 0,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 0,
          ממולאים_1_לבחירה: 0,
          עיקרית: 2,
          עיקרית_2: 2,
          תוספות_חמות: 3,
          תוספות_חמות_בתוספת_תשלום: 1,
          לחמים: 1,
          לחמים_בתוספת_תשלום: 3
        },
        sugTafrit, numberOfPuple
      };

    case 'seudat_mitsva_2':
      return {
        price: 75,
        max: {
          סלטים: 6,
          מנה_ראשונה: 1,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 2,
          ממולאים_1_לבחירה: 1,
          עיקרית: 1,
          עיקרית_2: 1,
          תוספות_חמות: 2,
          תוספות_חמות_בתוספת_תשלום: 1,
          לחמים: 1,
          לחמים_בתוספת_תשלום: 3
        },
        sugTafrit, numberOfPuple
      };

    case 'keytering_leshabat_chatan_erev':
      return {
        price: 90,
        max: {
          סלטים: 7,
          מנה_ראשונה: 2,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 2,
          ממולאים_1_לבחירה: 0,
          עיקרית: 2,
          עיקרית_2: 0,
          תוספות_חמות: 3,
          תוספות_חמות_בתוספת_תשלום: 0,
          לחמים: 0,
          לחמים_בתוספת_תשלום: 0
        },
        sugTafrit, numberOfPuple
      };

    case 'keytering_leshabat_chatan_yom':
      return {
        price: 80,
        max: {
          סלטים: 7,
          מנה_ראשונה: 0,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 4,
          ממולאים_1_לבחירה: 0,
          עיקרית: 2,
          עיקרית_2: 0,
          תוספות_חמות: 3,
          תוספות_חמות_בתוספת_תשלום: 0,
          לחמים: 0,
          לחמים_בתוספת_תשלום: 0
        },
        sugTafrit, numberOfPuple
      };

    case 'keytering_leseuda_shelishit':
      return {
        price: 65,
        max: {
          סלטים: 4,
          מנה_ראשונה: 0,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 0,
          ממולאים_1_לבחירה: 1,
          עיקרית: 1,
          עיקרית_2: 1,
          תוספות_חמות: 1,
          תוספות_חמות_בתוספת_תשלום: 0,
          לחמים: 1,
          לחמים_בתוספת_תשלום: 3
        },
        sugTafrit, numberOfPuple
      };

    case 'chatifim':
      return {
        price: 80,
        max: {
          סלטים: 1,
          מנה_ראשונה: 0,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 1,
          ממולאים_1_לבחירה: 0,
          עיקרית: 1,
          עיקרית_2: 0,
          תוספות_חמות: 0,
          תוספות_חמות_בתוספת_תשלום: 0,
          לחמים: 1,
          לחמים_בתוספת_תשלום: 0
        },
        sugTafrit, numberOfPuple
      };

    default:
      return null;
  }
}

let TafritimPrice = $derived.by(() => selectTafrit(Tafritim));

  const categoryOrder = [
  'סלטים',
  'מנה_ראשונה',
  'ממולאים',
  'ממולאים_1_לבחירה',
  'עיקרית',
  'עיקרית_2',
  'תוספות_חמות',
  'תוספות_חמות_בתוספת_תשלום',
  'לחמים',
  'לחמים_בתוספת_תשלום'
];

  // Group products by category where p[Tafritim] === "1"
let groupedByCategory = $derived.by(() =>
  products
    .filter(p => p[Tafritim] === "1")
    .reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {})
);
let checkIfMoreOrLessThen25 = $derived.by(()=>{
  if(Number(numberOfPuple) >=25){
   return true;
  }
});

// hendeling pressing radio btn in the middelr of ordering 

function handleTafritimChange(newValue) {
    // Are there any checked checkboxes?
    const anyChecked = Object.values(selectedProducts).some(Boolean);
    if (anyChecked && Tafritim !== newValue) {
      // Hebrew warning/confirm
      if (
        !confirm(
          "בחירת סוג תפריט אחר תאפס את כל הבחירות הקודמות.\nלהמשיך ולאפס את כל הבחירות?"
        )
      ) {
        // User clicked "Cancel" — do nothing!
        return;
      }
      // User confirmed: reset all checked and inputs
      selectedProducts = {};
      productQuantities = {};
      productComments = {};
      productExecutedBy = {};
    }
    Tafritim = newValue; // Set the new Tafritim value
    dispatch('MachirMana', selectTafrit(newValue));
  }
</script>

<div class="tafritim-container">
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "TafritHofshi"}
      onchange={() => handleTafritimChange('TafritHofshi')}
    />
    <span>תפריט חופשי</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "emtsa_shavua_1"}
      onchange={() => handleTafritimChange('emtsa_shavua_1')}
    />
    <span>אמצע שבוע - 1</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "emtsa_shavua_2"}
      onchange={() => handleTafritimChange('emtsa_shavua_2')}
    />
    <span>אמצע שבוע - 2</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "seudat_mitsva_1"}
      onchange={() => handleTafritimChange('seudat_mitsva_1')}
    />
    <span>סעודת מצווה - 1</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "seudat_mitsva_2"}
      onchange={() => handleTafritimChange('seudat_mitsva_2')}
    />
    <span>סעודת מצווה - 2</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "keytering_leshabat_chatan_erev"}
      onchange={() => handleTafritimChange('keytering_leshabat_chatan_erev')}
    />
    <span>קייטרינג לשבת חתן - ערב</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "keytering_leshabat_chatan_yom"}
      onchange={() => handleTafritimChange('keytering_leshabat_chatan_yom')}
    />
    <span>קייטרינג לשבת חתן - יום</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "keytering_leseuda_shelishit"}
      onchange={() => handleTafritimChange('keytering_leseuda_shelishit')}
    />
    <span>קייטרינג לסעודה שלישית</span>
  </label>
  <label>
    <input
      type="radio"
      name="tafritim"
      checked={Tafritim === "chatifim"}
      onchange={() => handleTafritimChange('chatifim')}
    />
    <span>חטיפים</span>
  </label>
</div>

<div class="people-input-box">
  <div class="people-input-wrap">
    <label for="people-count" class="people-label">
      <span>כמות האנשים</span>
      <input
        id="people-count"
        class="people-input"
        type="number"
        name="numberOfPupleInput"
        bind:value={numberOfPuple}
        onchange={()=>handleTafritimChange(Tafritim)}
        min="1"
      />
      <span class="badge {numberOfPuple < 25 ? 'badge-blue' : 'badge-green'}">
        {numberOfPuple < 25 ? 'מתחת ל-25 איש' : 'מעל ל-25 איש'}
      </span>
    </label>
    <!-- price info moved inside here, to the left side -->
    <p class="price-info">
      <span>מחיר מנה נבחרת:</span>
      <span class="price-value">
        {TafritimPrice.price ? TafritimPrice.price + ' ש"ח' : '— ללא מחיר —'}
      </span>
    </p>
  </div>
</div>



{#key Tafritim}
<div class="tatritimContainer" in:fly={{Duration:1000, y:-200}}>
  {#each categoryOrder as category}
  {#if groupedByCategory[category]}
    <h3>
      {category}
      - נבחרו:
      {groupedByCategory[category].filter(p => selectedProducts[`${category}_${p.name}`]).length}
      מתוך:
      {TafritimPrice?.max?.[category] ?? '∞'}
    </h3>
    <table style="width:100%; margin-bottom:16px;">
     <thead>
  <tr>
    <th style="width:32px;"></th>
    <th>שם הפריט</th>
    <th>כמות</th>
    <th>סה״כ</th>
    <th>יבוצע ע״י</th> <!-- NEW COLUMN -->
    <th>הערות</th>
  </tr>
</thead>

      <tbody>
      {#each groupedByCategory[category] as product, i}
        <tr class={
          Tafritim !== 'chatifim' &&
          !selectedProducts[`${category}_${product.name}`] &&
          groupedByCategory[category].filter(
            p => selectedProducts[`${category}_${p.name}`]
          ).length >= (TafritimPrice?.max?.[category] ?? Infinity)
            ? 'disabled'
            : ''
        }>
          <td>
           <input
  type="checkbox"
  bind:checked={selectedProducts[`${category}_${product.name}`]}
 onchange={() => {
  if (selectedProducts[`${category}_${product.name}`]) {
    if (category === 'סלטים') {
      productQuantities[`${category}_${product.name}`] = 1; // or ''
    } else {
      const numPeople = Number(numberOfPuple) || 1;
      productQuantities[`${category}_${product.name}`] =
        numPeople <= 25
          ? Number(product.less_than_25) || 0
          : Number(product.above_25) || 0;
    }
    productExecutedBy[`${category}_${product.name}`] = product.production_instraction || '';
  } else {
    productQuantities[`${category}_${product.name}`] = undefined;
    productExecutedBy[`${category}_${product.name}`] = '';
  }
}}
/>

          </td>
          <td>{product.name}</td>
          <td>
            <input
  type="number"
  min="0"
  bind:value={productQuantities[`${category}_${product.name}`]}
  oninput={() => {
    let v = Number(productQuantities[`${category}_${product.name}`]);
    productQuantities[`${category}_${product.name}`] = isNaN(v) || v < 1 ? 1 : v;
  }}
  disabled={!selectedProducts[`${category}_${product.name}`]}
/>

          </td>
     <td>
  <input
    type="text"
    readonly
    value={
      selectedProducts[`${category}_${product.name}`]
        ? (
            category === 'סלטים'
              ? getSaladTotal(product)
              : (Number(productQuantities[`${category}_${product.name}`]) || 0) * (Number(numberOfPuple) || 1)
          )
        : ''
    }
  />

</td>


<td>
        <input
          type="text"
          placeholder="יבוצע ע״י"
          bind:value={productExecutedBy[`${category}_${product.name}`]}
          disabled={!selectedProducts[`${category}_${product.name}`]}
        />
      </td>
          <td>
            <input
              type="text"
              placeholder="הערה"
              bind:value={productComments[`${category}_${product.name}`]}
              disabled={!selectedProducts[`${category}_${product.name}`]}
            />
          </td>
        </tr>
      {/each}
      </tbody>
    </table>
  {/if}
{/each}

</div>
{/key}




<style>
  .people-input-box {
  width: 100%;
  margin: 0 0 24px 0;
}
  .people-input-wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start; /* keep top aligned */
  gap: 25px;
  background: #f7fafd;
  border: 1.5px solid #d1e6fa;
  border-radius: 9px;
  padding: 17px 28px;
  font-family: inherit;
  direction: rtl;
}

.people-label {
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 500;
  font-size: 1.18em;
}
.price-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  margin-right: 32px; /* creates left-side effect in RTL */
  font-size: 1.14em;
  font-weight: 500;
}

.price-value {
  font-size: 1.13em;
  color: #0b7d38;
  font-weight: bold;
  background: #f5fbe7;
  border-radius: 7px;
  padding: 4px 13px;
  border: 1.2px solid #d1eab7;
}

.people-input {
  width: 72px;
  padding: 7px 10px;
  font-size: 1.09em;
  border: 1.5px solid #b3ceee;
  border-radius: 7px;
  background: #fff;
  margin-left: 8px;
  text-align: center;
  transition: border-color 0.2s;
}

.people-input:focus {
  border-color: #4ca3ff;
  outline: none;
  background: #f0f6fd;
}

.badge {
  display: inline-block;
  padding: 3px 13px;
  border-radius: 17px;
  font-size: 0.95em;
  font-weight: bold;
  background: #e5e7fa;
  color: #2d5d7b;
  margin-right: 7px;
  margin-left: 7px;
  vertical-align: middle;
}
.badge-blue {
  background: #e5effe;
  color: #175199;
  border: 1.2px solid #b8d3f8;
}
.badge-green {
  background: #e3fbe9;
  color: #236c26;
  border: 1.2px solid #8ed49a;
}

.price-info {
  margin: 0 0 20px 0;
  font-size: 1.18em;
  display: flex;
  gap: 10px;
  align-items: center;
  direction: rtl;
  font-weight: 500;
}

.price-value {
  font-size: 1.13em;
  color: #0b7d38;
  font-weight: bold;
  background: #f5fbe7;
  border-radius: 7px;
  padding: 4px 13px;
  border: 1.2px solid #d1eab7;
}

  /* --- Main Tafrit (Menu) Radio Container --- */
.tafritim-container {
  display: flex;
  gap: clamp(20px, 2vw, 30px);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  font-family: Arial, sans-serif;
  font-size: 18px;
  direction: rtl;
  border: #000000 solid 1px;
  padding: 15px;
  border-radius: 10px;
  background: #f9f9f9;
  margin: 35px auto 20px auto;
}

.tafritim-container label {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: gray;
  font-weight: normal;
}

.tafritim-container input[type="radio"] {
  margin-left: 6px;
  cursor: pointer;
}

.tafritim-container input[type="radio"]:checked + span {
  color: black;
  font-weight: bold;
  transition: all 0.3s ease;
}

.tafritim-container span {
  transition: all 0.3s ease;
}

/* --- End Tafritim Main Menu Styles --- */


/* --- START TABLE (tatritimContainer) STYLES --- */

.tatritimContainer {
  direction: rtl;
  padding: 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px #0002;
  margin-bottom: 40px;
}

/* Category titles */
.tatritimContainer h3 {
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 12px;
  color: #222;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Table styles */
.tatritimContainer table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
  background: #fff;
  box-shadow: 0 1px 6px #0001;
  border-radius: 8px;
  overflow: hidden;
}

/* Universal style for headers and cells */
.tatritimContainer th,
.tatritimContainer td {
  text-align: right;
  font-size: 16px;
  border-bottom: 1px solid #e2e2e2;
  padding: 8px 6px;
  box-sizing: border-box;
  background: #f9f9f9;
  transition: background 0.2s;
}

/* First column (checkbox) - very narrow */
.tatritimContainer th:first-child,
.tatritimContainer td:first-child {
  width: 40px;
  min-width: 36px;
  max-width: 50px;
  text-align: center;
  background: #f5f5f5;
}

/* Name column (second) - largest */
.tatritimContainer th:nth-child(2),
.tatritimContainer td:nth-child(2) {
  width: 200px;
  min-width: 160px;
  max-width: 240px;
  background: #f9f9f9;
  font-weight: 500;
}

/* Quantity column (third) - narrow */
.tatritimContainer th:nth-child(3),
.tatritimContainer td:nth-child(3) {
  width: 60px;
  min-width: 40px;
  max-width: 80px;
}

/* Total column (fourth) - narrow */
.tatritimContainer th:nth-child(4),
.tatritimContainer td:nth-child(4) {
  width: 100px;
  min-width: 125px;
  max-width: 150px;
}

/* Notes column (fifth) - wide */
.tatritimContainer th:nth-child(5),
.tatritimContainer td:nth-child(5) {
  width: 120px;
  min-width: 100px;
  max-width: 140px;
  background: #fafafa;
}
/* Notes column (fifth) - wide */
.tatritimContainer th:nth-child(6),
.tatritimContainer td:nth-child(6) {
  width: 180px;
  min-width: 120px;
  max-width: 250px;
  background: #fafafa;
}

/* Disabled rows (for category max) */
.tatritimContainer tr.disabled {
  opacity: 0.5;
  pointer-events: none;
  background: #f1f1f1;
}

/* Table header styling */
.tatritimContainer th {
  background: #eef2f7;
  font-weight: 600;
  letter-spacing: 0.4px;
}

/* Row hover effect */
.tatritimContainer tbody tr:not(.disabled):hover {
  background: #f0f4fa;
  transition: background 0.15s;
}

/* Input fields */
.tatritimContainer input[type="number"],
.tatritimContainer input[type="text"] {
  width: 90%;
  padding: 0.3em 0.5em;
  border: 1px solid #bdbdbd;
  border-radius: 5px;
  text-align: center;
  background: #fff;
  font-size: 15px;
  transition: border-color 0.2s;
}
.tatritimContainer input:focus {
  border-color: #2d89ef;
  outline: none;
}

/* Checkbox */
.tatritimContainer input[type="checkbox"] {
  accent-color: #2d89ef;
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
}

/* --- END TABLE (tatritimContainer) STYLES --- */


/* Responsive: smaller font on mobile */
@media (max-width: 700px) {
  .tatritimContainer th,
  .tatritimContainer td {
    font-size: 14px;
    padding: 5px 2px;
  }
  .tatritimContainer h3 {
    font-size: 16px;
  }
}

</style>
