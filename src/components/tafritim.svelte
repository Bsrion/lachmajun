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
  let numberOfPuple = $state();

  onMount(async () => {
    try {
      const res = await fetch('https://dilen-digital.co.il/api/production.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      products = await res.json();
    } catch (e) {
      error = e.message;
    }
  });

let Tafritim = $state('TafritHofshi'); // Default value for Tafritim

  // Reactive block to update price whenever Tafritim changes
  
 function selectTafrit(sugTafrit) {
  switch (sugTafrit) {
    case 'TafritHofshi':
      return null;

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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
      };

    case 'keytering_leseuda_shelishit':
      return {
        price: 65,
        max: {
          סלטים: 4,
          מנה_ראשונה: 0,
          מנה_ראשונה_אופציה_שניה: 0,
          ממולאים: 0,
          ממולאים_1_לבחירה: 0,
          עיקרית: 1,
          עיקרית_2: 1,
          תוספות_חמות: 0,
          תוספות_חמות_בתוספת_תשלום: 0,
          לחמים: 0,
          לחמים_בתוספת_תשלום: 0
        }
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
        }
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
})
</script>

<div class="tafritim-container">
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="TafritHofshi" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>תפריט חופשי</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="emtsa_shavua_1" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>  אמצע שבוע - 1</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="emtsa_shavua_2" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>אמצע שבוע - 2</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="seudat_mitsva_1" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>סעודת מצווה - 1 </span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="seudat_mitsva_2" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span> סעודת מצווה - 2</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="keytering_leshabat_chatan_erev" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span> קייטרינג לשבת חתן - ערב</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="keytering_leshabat_chatan_yom" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span> קייטרינג לשבת חתן - יום</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="keytering_leseuda_shelishit" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span> קייטרינג לסעודה שלישית</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="chatifim" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span> חטיפים</span>
  </label>
</div>
<div>
   <label>
    <input type="input" name="numberOfPupleInput" bind:value={numberOfPuple}/>
    <span> כמות האנשים</span>
     <label>
      {#if !checkIfMoreOrLessThen25}
        <span> <strong>מתחת</strong> ל-25 איש</span>
    {:else}
        <span> <strong>מעל</strong> ל-25 איש</span>
{/if}
</div>

<p>מחיר מנה נבחרת: {TafritimPrice ? TafritimPrice.price : '— ללא מחיר —'}</p>


{#key Tafritim}
<div class="tatritimContainer" in:fly={{Duration:1000, y:-200}}>
  {#each categoryOrder as category}
    {#if groupedByCategory[category]}
      <h3>
        {category}
        - נבחרו:
        {
          groupedByCategory[category].filter(
            p => selectedProducts[`${category}_${p.name}`]
          ).length
        }
        מתוך:
        {TafritimPrice?.max?.[category] ?? '∞'}
      </h3>

      <ul>
        {#if groupedByCategory[category].filter(
          p => selectedProducts[`${category}_${p.name}`]
        ).length >= (TafritimPrice?.max?.[category] ?? Infinity)}
          <small style="color: red;">הגעת למספר המקסימלי עבור קטגוריה זו</small>
        {/if}

        {#each groupedByCategory[category] as product, i}
          <li
            class={
              Tafritim !== 'chatifim' &&
              !selectedProducts[`${category}_${product.name}`] &&
              groupedByCategory[category].filter(
                p => selectedProducts[`${category}_${p.name}`]
              ).length >= (TafritimPrice?.max?.[category] ?? Infinity)
                ? 'disabled'
                : ''
            }
          >
            {#if Tafritim === 'chatifim'}
              {#if i === 0}
                <input
                  type="checkbox"
                  bind:checked={selectedProducts[`${category}_${product.name}`]}
                />
              {/if}
              {product.name}
            {:else}
              <input
                type="checkbox"
                bind:checked={selectedProducts[`${category}_${product.name}`]}
                disabled={
                  !selectedProducts[`${category}_${product.name}`] &&
                  groupedByCategory[category].filter(
                    p => selectedProducts[`${category}_${p.name}`]
                  ).length >= (TafritimPrice?.max?.[category] ?? Infinity)
                }
              />
              {product.name}
            {/if}
          </li>
        {/each}

      </ul>
    {/if}
    
  {/each}
</div>
{/key}




<style>
   .disabled {
    color: #aaa;
    opacity: 0.6;
    pointer-events: none;
  }
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
  .tatritimContainer {
  direction: rtl;
  padding: 20px;
}

.tatritimContainer h3 {
  font-size: 20px;
  margin-top: 20px;
  color: #333;
}

.tatritimContainer ul {
  padding-right: 20px;
  list-style: none;
}

.tatritimContainer li {
  padding: 5px 0;
  border-bottom: 1px dashed #ccc;
}

</style>
