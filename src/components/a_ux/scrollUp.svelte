<script>
  import { onMount } from 'svelte';

  let y = $state(0);
  let windowHeight = $state(0);
  let windowInnerHeight = $state(0);
  let container; // for bind:this

  $effect(() => {
    windowInnerHeight = window.innerHeight;
    windowHeight = document.documentElement.scrollHeight;
  });

  onMount(() => {
    container = document.querySelector('.tafritim-container');
    // Now it's safe to access document!
    if (!container) {
      console.warn('Container element not found');
    } else {
      container.addEventListener('click', () => {
        setTimeout(() => {
          // Update windowHeight after a click
          windowHeight = document.documentElement.scrollHeight;
        }, 100); // Adjust timeout as needed
      });
    }
    // Optional: Clean up on unmount
    return () => {
      if (container) {
        container.removeEventListener('click', () => {
          windowHeight = document.documentElement.scrollHeight;
        });
      }
    };
  });

  let strokeDashoffset = $derived(113 - (y / (windowHeight - windowInnerHeight)) * 113)
</script>

<svelte:window bind:scrollY={y} bind:innerHeight={windowInnerHeight} />
{#if y > windowInnerHeight * 0.3}
  <style>
    .scroll-up {
      opacity: 1;
      pointer-events: auto;
    }
  </style>
{:else}
  <style>
    .scroll-up {
      opacity: 0;
      pointer-events: none;
    }
  </style>
{/if}
<div class="scroll-up">
  <svg class="scroll-up__border" width="40" height="40">
    <circle
      cx="20" cy="20" r="18"
      fill="none"
      stroke="#fff"
      stroke-width="2"
      stroke-dasharray="113"
      stroke-dashoffset={strokeDashoffset}
    />
  </svg>
  <button
    type="button"
    class="scroll-up__link"
    aria-label="Scroll to top"
    on:click={() => document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })}
  >
    <svg class="scroll-up__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
    <span class="scroll-up__text">גלול למעלה</span>
  </button>
</div>

<style>
.scroll-up {
  position: fixed;
  width: 40px;
  height: 40px;
  background: #0077cc;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
  bottom: 30px;
  right: 20px;
  z-index: 1000;
  text-align: center;
  box-shadow: 0 2px 8px #0003;
  outline: none;

}

.scroll-up__border {
  position: absolute;
  top: 0; left: 0;
  width: 40px;
  height: 40px;
  z-index: 0;
  pointer-events: none;
}

.scroll-up__border circle {
  transition: stroke-dashoffset 0.1s cubic-bezier(0.4,0,0.2,1);
  /* Start hidden */
}


.scroll-up__link {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  text-decoration: none;
}

.scroll-up__icon {
  width: 24px;
  height: 24px;
  stroke: #fff;
  transition: stroke 0.3s, opacity 0.3s;
  opacity: 1;
}

.scroll-up__text {
  font-size: 10px;
  padding: 5px;
  color: white;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 105%;
  transform: translateX(-50%);
  background: rgba(0, 119, 204, 0.8);
  border-radius: 6px;
  transition: opacity 0.3s;
  white-space: nowrap;
}

.scroll-up:hover .scroll-up__icon,
.scroll-up:focus .scroll-up__icon {
  opacity: 0;
    cursor: pointer;

}
.scroll-up:hover .scroll-up__text,
.scroll-up:focus .scroll-up__text {
  opacity: 1;
  pointer-events: auto;
}

.scroll-up:focus {
  box-shadow: 0 0 0 3px rgba(0,119,204,0.3);
}
 
</style>