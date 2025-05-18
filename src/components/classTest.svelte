<script>
    import { slide, fly } from "svelte/transition";

let isTrue = $state(true)

</script>

{#key isTrue}
<h1 class="A" in:fly={{x:300 ,y:300, duration:1000}}>TEXT TEXT TEXT</h1>
<h1 class:B={isTrue} in:fly={{x:200 ,y:200, duration:1000}}>TEXT TEXT TEXT</h1>
<h1 class={isTrue? 'C' : 'B'} in:slide={{x: 100 ,y:100, duration:1000}}>TEXT TEXT TEXT</h1>
{/key} 

<button onclick={() => isTrue = !isTrue}>TOGGLE</button>



<style>

.A{
    color: #000;
    text-decoration: none;
}
.B{
    color: #ff0303;
    text-decoration: none;
}
.C{
    color: #0eb969;
    text-decoration: none;
}

</style>