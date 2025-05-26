<script>
  let { Tafritim : TafritProp = 'TafritHofshi'} = $props();
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

let Tafritim = $state('TafritHofshi'); // Default value for Tafritim

  // Reactive block to update price whenever Tafritim changes
  
  function selectTafrit(sugTafrit) {
    switch (sugTafrit) {
      case 'TafritHofshi':
        return null;
      case 'TafritSeudatMitva':
        return 59;
      case 'TafritEmtsaShavua':
        return 75;
      case 'TafritShabat':
        return 85;
      default:
        return null;
    }
  }
let TafritimPrice = $derived.by(() => {
    return selectTafrit(Tafritim);
  });
</script>

<div class="tafritim-container">
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="TafritHofshi" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>תפריט חופשי</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="TafritSeudatMitva" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>סעודת מצווה</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="TafritEmtsaShavua" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>אמצע שבוע</span>
  </label>
  <label>
    <input type="radio" name="tafritim" bind:group={Tafritim} value="TafritShabat" onchange={()=>dispatch('MachirMana', selectTafrit(Tafritim))}/>
    <span>תפריט שבת</span>
  </label>
</div>

<p>מחיר מנה נבחרת: {TafritimPrice ?? '— ללא מחיר —'}</p>

<style>
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
    max-width: 800px;
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
</style>
