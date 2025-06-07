<script>
  // Imports
  // ===============================

  import { onMount } from 'svelte';
  import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';
  import { createEventDispatcher } from "svelte";
  import { Duration } from 'svelte-ux';
  import { derived } from 'svelte/store';
  import CategoryStatusWidget from '../components/CategoryStatusWidget.svelte';


  // Props & State Initialization
  // ===============================

  let { Tafritim : TafritProp = 'TafritHofshi',
        numberOfPuple = 1,
        selectedProducts = $bindable({}),
        productExecutedBy = $bindable({}),
        productQuantities = $bindable({}),
        } = $props();
  const dispatch = createEventDispatcher();

  let products = $state([]);
  let error = $state();
  let productComments = $state({});
  let salad_quantity = $state([]);

  // Data Fetch: Products & Salad Quantity
  // ===============================

  onMount(async () => { 
    try {
      const res = await fetch('https://dilen-digital.co.il/api/production.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      products = await res.json();
    } catch (e) {
      error = e.message;
    }
  });

  onMount(async () => { 
    try {
      const res = await fetch('https://dilen-digital.co.il/api/get_salad_quantity.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      salad_quantity = await res.json();
    } catch (e) {
      error = e.message;
    }
  });

  // Helpers: Totals Calculation
  // ===============================

  function getProductTotal(product, numberOfPuple, quantity) {
    if (!product) return '';
    const numPeople = Number(numberOfPuple) || 1;
    let perPerson = 0;
    if (numPeople <= 25) perPerson = Number(product.less_then_25) || 0;
    else perPerson = Number(product.above_25) || 0;
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
    const val = row[col];
    return (typeof val === 'string' && val) ? val : '';
  }

  // Tafritim (Menu Type) Logic
  // ===============================

  let Tafritim = $state('TafritHofshi'); // Default value

 function selectTafrit(sugTafrit) {
  switch (sugTafrit) {
    case 'TafritHofshi':
      return { price: null, sugTafrit, numberOfPuple };

    case 'emtsa_shavua_1':
      return {
        price: 75,
        max: {
          'סלטים': 6,
          'מנה ראשונה': 0,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 4,
          'ממולאים 1 לבחירה': 0,
          'עיקרית': 3,
          'עיקרית 2': 1,
          'תוספות חמות': 3,
          'תוספות חמות בתוספת תשלום': 0,
          'לחמים': 1,
          'לחמים בתוספת תשלום': 3
        },
        sugTafrit, numberOfPuple
      };

    case 'emtsa_shavua_2':
      return {
        price: 85,
        max: {
          'סלטים': 7,
          'מנה ראשונה': 0,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 4,
          'ממולאים 1 לבחירה': 1,
          'עיקרית': 3,
          'עיקרית 2': 0,
          'תוספות חמות': 3,
          'תוספות חמות בתוספת תשלום': 1,
          'לחמים': 1,
          'לחמים בתוספת תשלום': 3
        },
        sugTafrit, numberOfPuple
      };

    case 'seudat_mitsva_1':
      return {
        price: 59,
        max: {
          'סלטים': 5,
          'מנה ראשונה': 0,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 0,
          'ממולאים 1 לבחירה': 0,
          'עיקרית': 2,
          'עיקרית 2': 2,
          'תוספות חמות': 3,
          'תוספות חמות בתוספת תשלום': 1,
          'לחמים': 1,
          'לחמים בתוספת תשלום': 3
        },
        sugTafrit, numberOfPuple
      };

    case 'seudat_mitsva_2':
      return {
        price: 75,
        max: {
          'סלטים': 6,
          'מנה ראשונה': 1,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 2,
          'ממולאים 1 לבחירה': 1,
          'עיקרית': 1,
          'עיקרית 2': 1,
          'תוספות חמות': 2,
          'תוספות חמות בתוספת תשלום': 1,
          'לחמים': 1,
          'לחמים בתוספת תשלום': 3
        },
        sugTafrit, numberOfPuple
      };

    case 'keytering_leshabat_chatan_erev':
      return {
        price: 90,
        max: {
          'סלטים': 7,
          'מנה ראשונה': 2,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 2,
          'ממולאים 1 לבחירה': 0,
          'עיקרית': 2,
          'עיקרית 2': 0,
          'תוספות חמות': 3,
          'תוספות חמות בתוספת תשלום': 0,
          'לחמים': 0,
          'לחמים בתוספת תשלום': 0
        },
        sugTafrit, numberOfPuple
      };

    case 'keytering_leshabat_chatan_yom':
      return {
        price: 80,
        max: {
          'סלטים': 7,
          'מנה ראשונה': 0,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 4,
          'ממולאים 1 לבחירה': 0,
          'עיקרית': 2,
          'עיקרית 2': 0,
          'תוספות חמות': 3,
          'תוספות חמות בתוספת תשלום': 0,
          'לחמים': 0,
          'לחמים בתוספת תשלום': 0
        },
        sugTafrit, numberOfPuple
      };

    case 'keytering_leseuda_shelishit':
      return {
        price: 65,
        max: {
          'סלטים': 4,
          'מנה ראשונה': 0,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 0,
          'ממולאים 1 לבחירה': 1,
          'עיקרית': 1,
          'עיקרית 2': 1,
          'תוספות חמות': 1,
          'תוספות חמות בתוספת תשלום': 0,
          'לחמים': 1,
          'לחמים בתוספת תשלום': 3
        },
        sugTafrit, numberOfPuple
      };

    case 'chatifim':
      return {
        price: 80,
        max: {
          'סלטים': 1,
          'מנה ראשונה': 0,
          'מנה ראשונה אופציה שניה': 0,
          'ממולאים': 1,
          'ממולאים 1 לבחירה': 0,
          'עיקרית': 1,
          'עיקרית 2': 0,
          'תוספות חמות': 0,
          'תוספות חמות בתוספת תשלום': 0,
          'לחמים': 1,
          'לחמים בתוספת תשלום': 0
        },
        sugTafrit, numberOfPuple
      };

    default:
      return null;
  }
}

  let TafritBuilder = $derived.by(() => selectTafrit(Tafritim));

  // Category Display Order
  // ===============================

        const categoryOrder = [
          'סלטים',
          'מנה ראשונה',
          'ממולאים',
          'ממולאים 1 לבחירה',
          'עיקרית',
          'עיקרית 2',
          'תוספות חמות',
          'תוספות חמות בתוספת תשלום',
          'לחמים',
          'לחמים בתוספת תשלום'
        ];


  // Derived: Grouped Products by Category
  // ===============================

  let groupedByCategory = $derived.by(() =>
    products
      .filter(p => p[Tafritim] === "1")
      .reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {})
  );

  // Derived: 25 People Check
  // ===============================

  let checkIfMoreOrLessThen25 = $derived.by(() => Number(numberOfPuple) >= 25);

  // Event Handlers: Tafritim (Menu) Change
  // ===============================

  function handleTafritimChange(newValue) {
    const anyChecked = Object.values(selectedProducts).some(Boolean);
    if (anyChecked && Tafritim !== newValue) {
      if (
        !confirm(
          "בחירת סוג תפריט אחר תאפס את כל הבחירות הקודמות.\nלהמשיך ולאפס את כל הבחירות?"
        )
      ) return;
      selectedProducts = {};
      productQuantities = {};
      productComments = {};
      productExecutedBy = {};
    }
    Tafritim = newValue;
    dispatch('MachirMana', selectTafrit(newValue));
  }

  // Helpers: Collect Selected Order Items
  // ===============================

  function getSelectedOrderItems() {
    let result = [];
    for (let key in selectedProducts) {
      if (selectedProducts[key]) {
        const [category, ...rest] = key.split('_');
        const name = rest.join('_');
        const product = products.find(
          p => p.category === category && p.name === name
        ) || {};
        result.push({
          name,
          category,
          product_id: product.product_id || null,
          quantity: Number(productQuantities[key]) || 1,
          ExecutedBy: productExecutedBy[key] || '',
          comment: productComments[key] || '',
          total: category === 'סלטים'
          ? getSaladTotal(product)
          : Math.ceil((Number(productQuantities[key]) || 0) * (Number(numberOfPuple) || 1)),
        });
      }
    }
    return result;
  }
  
        let selectedOrderItems = $derived.by(() => getSelectedOrderItems());


        // Dispatch Order Item Changes to Parent
        // ===============================

        $effect(() => {
          dispatch('updateOrderItems', { items: selectedOrderItems });
        });

        // check if order complete
        // ===============================
            let categoriesStatus = $derived.by(() => {
        // null safety
        if (!TafritBuilder?.max) return { perCategory: {}, allCategoriesFull: false };

        let perCategory = {};
        let allFull = true;

        for (const category of categoryOrder) {
          // Only calculate for categories present in groupedByCategory and with a max in TafritBuilder
          if (!groupedByCategory[category]) continue;
          const max = TafritBuilder.max[category] ?? Infinity;
          const selectedCount = groupedByCategory[category].filter(
            p => selectedProducts[`${category}_${p.name}`]
          ).length;
          const isFull = max !== Infinity && selectedCount >= max;
          if (!isFull) allFull = false;

          perCategory[category] = {
            category,
            selectedCount,
            max,
            isFull,
            status: max === Infinity
              ? `נבחרו ${selectedCount} מתוך ∞`
              : `נבחרו ${selectedCount} מתוך ${max}` + (isFull ? " (מלא)" : "")
          };
        }

        return {
          perCategory,
          allCategoriesFull: allFull
        };
      });


</script>

<!-- ===============================
     Tafritim (Menu) Selection Radios
=============================== -->
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

<!-- ===============================
     People Count and Price Info
=============================== -->
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
    <p class="price-info">
      <span>מחיר מנה נבחרת:</span>
      <span class="price-value">
        {TafritBuilder.price ? TafritBuilder.price + ' ש"ח' : '— ללא מחיר —'}
      </span>
    </p>
  </div>
</div>

<!-- ===============================
     Main Table: Product Categories
=============================== -->
{#key Tafritim}
  <div class="tatritimContainer" in:fly={{Duration:1000, y:-200}}>
    {#each categoryOrder as category}
      {#if groupedByCategory[category]}
        <h3>
          {category}
          - נבחרו:
          {groupedByCategory[category].filter(p => selectedProducts[`${category}_${p.name}`]).length}
          מתוך:
          {TafritBuilder?.max?.[category] ?? '∞'}
        </h3>
        <table style="width:100%; margin-bottom:16px;">
          <thead>
            <tr>
              <th style="width:32px;"></th>
              <th>שם הפריט</th>
              <th>כמות</th>
              <th>סה״כ</th>
              <th>יבוצע ע״י</th>
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
                ).length >= (TafritBuilder?.max?.[category] ?? Infinity)
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
                          productQuantities[`${category}_${product.name}`] = 1;
                        } else {
                          const numPeople = Number(numberOfPuple) || 1;
                          productQuantities[`${category}_${product.name}`] =
                            numPeople <= 25
                              ? Number(product.less_than_25) || 0
                              : Number(product.above_25) || 0;
                        }
                        productExecutedBy[`${category}_${product.name}`] = product.production_instraction || '';
                        productComments[`${category}_${product.name}`] = product.comment || '';
                      } else {
                        productQuantities[`${category}_${product.name}`] = undefined;
                        productExecutedBy[`${category}_${product.name}`] = '';
                        productComments[`${category}_${product.name}`] = '';
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
                              : Number(
                                (
                                  (Number(productQuantities[`${category}_${product.name}`]) || 0) *
                                  (Number(numberOfPuple) || 1)
                                ).toFixed(2)
                              )
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

                  <CategoryStatusWidget {categoriesStatus}/>

<style>
  .categories-status-summary {
  background: #f8fafb;
  border: 1.5px solid #dbeafe;
  border-radius: 10px;
  margin: 1.5em auto 2em auto;
  max-width: 420px;
  padding: 1.2em 1.6em;
  direction: rtl;
  box-shadow: 0 2px 8px #b6cdf73a;
  font-family: inherit;
}
.categories-status-summary h3 {
  margin-top: 0;
  font-size: 1.15em;
  color: #0369a1;
  margin-bottom: .6em;
  text-align: right;
}
.categories-status-summary ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1em 0;
}
.category-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .5em;
  font-size: 1em;
  border-bottom: 1px dashed #e0eaff;
  padding-bottom: 2px;
  color: #475569;
  font-weight: 500;
}
.category-status.full .cat-status-text {
  color: #15803d;
  font-weight: bold;
}
.category-status.not-full .cat-status-text {
  color: #d97706;
}
.cat-name {
  font-weight: bold;
}
.all-cats-status {
  margin-top: 1em;
  padding: .6em .5em;
  border-radius: 8px;
  font-size: 1.07em;
  text-align: center;
  font-weight: bold;
}
.all-cats-status.all-full {
  background: #d1fae5;
  color: #065f46;
  border: 1.2px solid #059669;
}
.all-cats-status.not-all-full {
  background: #fef3c7;
  color: #92400e;
  border: 1.2px solid #fbbf24;
}

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
