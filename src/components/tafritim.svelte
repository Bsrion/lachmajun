<script>
  import { onMount } from 'svelte';
  let { Tafritim : TafritProp = 'TafritHofshi'} = $props();
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let products = $state([]);
  let error = $state(null);
  let selectedProducts = $state({});
  let numberOfPuple = $state({});


  onMount(async () => {
    try {
      const res = await fetch('https://dilen-digital.co.il/api/production.php');
      if (!res.ok) throw new Error('Failed to fetch products');
      products = await res.json();
      console.log(Object.keys(products[0]))
    } catch (e) {
      error = e.message;
    }
  });

let Tafritim = $state('TafritHofshi'); // Default value for Tafritim

  // Reactive block to update price whenever Tafritim changes
  
 function selectTafrit(sugTafrit) {
  const defaultMax = {salad: 0, mana_rishona: 0, memulaim: 0, memulaim_spacial: 0, ikarit: 0, ikarit_2: 0, tosafot_chamot: 0, tosafot_chamot_betosefet: 0, shonot_lechamim: 0, shonot_lechamim_betosefet: 0};

  switch (sugTafrit) {
    case 'TafritHofshi':
      return null;

    case 'emtsa_shavua_1':
      return {
        price: 75,
        max: {salad: 6, mana_rishona: 0, memulaim: 4, memulaim_spacial: 0, ikarit: 3, ikarit_2: 1, tosafot_chamot: 3, tosafot_chamot_betosefet: 0, shonot_lechamim: 1, shonot_lechamim_betosefet: 3}
      };

    case 'emtsa_shavua_2':
      return {
        price: 85,
        max: {salad: 7, mana_rishona: 0, memulaim: 4, memulaim_spacial: 1, ikarit: 3, ikarit_2: 0, tosafot_chamot: 3, tosafot_chamot_betosefet: 0, shonot_lechamim: 1, shonot_lechamim_betosefet: 3}
      };

    case 'seudat_mitsva_1':
      return {
        price: 59,
        max: {salad: 5, mana_rishona: 3, memulaim: 0, memulaim_spacial: 0, ikarit: 2, ikarit_2: 0, tosafot_chamot: 0, tosafot_chamot_betosefet: 0, shonot_lechamim: 1, shonot_lechamim_betosefet: 3}
      };

    case 'seudat_mitsva_2':
      return {
        price: 75,
        max: {salad: 6, mana_rishona: 1, memulaim: 2, memulaim_spacial: 1, ikarit: 1, ikarit_2: 1, tosafot_chamot: 2, tosafot_chamot_betosefet: 1, shonot_lechamim: 1, shonot_lechamim_betosefet: 3}
      };

    case 'keytering_leshabat_chatan_erev':
      return {
        price: 90,
        max: {salad: 7, mana_rishona: 2, memulaim: 2, memulaim_spacial: 0, ikarit: 2, ikarit_2: 0, tosafot_chamot: 3, tosafot_chamot_betosefet: 0, shonot_lechamim: 0, shonot_lechamim_betosefet: 0}
      };

    case 'keytering_leshabat_chatan_yom':
      return {
        price: 80,
        max: {salad: 7, mana_rishona: 0, memulaim: 4, memulaim_spacial: 0, ikarit: 2, ikarit_2: 0, tosafot_chamot: 3, tosafot_chamot_betosefet: 0, shonot_lechamim: 0, shonot_lechamim_betosefet: 0}
      };

    case 'keytering_leseuda_shelishit':
      return {
        price: 65,
        max: {salad: 4, mana_rishona: 0, memulaim: 0, memulaim_spacial: 0, ikarit: 1, ikarit_2: 1, tosafot_chamot: 0, tosafot_chamot_betosefet: 0, shonot_lechamim: 0, shonot_lechamim_betosefet: 0}
      };

    case 'chatifim':
      return {
        price: 80,
        max: {salad: 1, mana_rishona: 0, memulaim: 1, memulaim_spacial: 0, ikarit: 1, ikarit_2: 0, tosafot_chamot: 0, tosafot_chamot_betosefet: 0, shonot_lechamim: 1, shonot_lechamim_betosefet: 0}
      };

    default:
      return null;
  }
}

let TafritimPrice = $derived.by(() => selectTafrit(Tafritim));

  const categoryOrder = [
  'salad',
  'mana_rishona',
  'memulaim',
  'memulaim_spacial',
  'ikarit',
  'ikarit-2',
  'tosafot_chamot',
  'tosafot_chamot_betosefet',
  'shonot_lechamim',
  'shonot_lechamim_betosefet'
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
<div> <label>
    <input type="radio" name="numberOfPuple" bind:group={numberOfPuple} value="1" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span> מעל 25 איש</span>
  </label>
  <label>
    <input type="radio" name="numberOfPuple" bind:group={numberOfPuple} value="0" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span> מתחת ל-25 איש</span>
  </label>
</div>

<p>מחיר מנה נבחרת: {TafritimPrice ? TafritimPrice.price : '— ללא מחיר —'}</p>



<div class="tatritimContainer">
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





<style>
   .disabled {
    color: #aaa;
    opacity: 0.6;
    pointer-events: none;
  }
  .tafritim-container {
    display: flex;
    gap: 5vw;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    font-family: Arial, sans-serif;
    font-size: 18px;
    direction: rtl;
    border: #000000 solid 1px;
    padding: 10px;
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
