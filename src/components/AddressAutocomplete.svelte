<script>
  // Props with defaults using runes
  let { city: initialCity = "ירושלים", street: initialStreet = ""} = $props();
import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();  
  // Reactive state
  let streets = $state([]);
  let citySuggestions = $state([]);
  let streetSuggestions = $state([]);
  let isLoading = $state(false);
  let showCitySuggestions = $state(false);
  let showStreetSuggestions = $state(false);
  let focusedSuggestionIndex = $state(-1);
  
  // Local state for inputs
  let selectedCity = $state(initialCity);
  let selectedStreet = $state(initialStreet);
  let streetsLoaded = $state(false);

  // Load streets data
  async function loadStreets() {
    if (streetsLoaded) return;
    streetsLoaded = true;
    isLoading = true;
    
    try {
      const response = await fetch('/public/data/streets_utf8.csv');
      const text = await response.text();
      
      streets = text.split('\n')
        .filter(row => row.trim())
        .map((row, index) => {
          const cols = row.split(',');
          return {
            id: `${index}-${cols[1]?.trim()}`,
            streetName: cols[3]?.trim(),
            cityName: cols[1]?.trim()
          };
        });
      
      citySuggestions = [...new Set(streets.map(s => s.cityName).filter(Boolean))];
    } catch (err) {
      console.error('Error loading streets:', err);
    } finally {
      isLoading = false;
    }
  }

  // Update street suggestions reactively
  function updateStreetSuggestions() {
  // Guard: if selectedStreet is missing or not a string, clear suggestions and exit early
  if (!selectedStreet || typeof selectedStreet !== 'string') {
    streetSuggestions = [];
    showStreetSuggestions = false;
    return;
  }
  
  const searchWords = String(selectedStreet).toLowerCase().split(/\s+/).filter(Boolean);

  if (!selectedCity) {
    streetSuggestions = [];
    showStreetSuggestions = false;
    return;
  }
  
  streetSuggestions = streets
    .filter(s => {
      if (!s?.cityName || !s?.streetName) return false;
      if (s.cityName !== selectedCity) return false;
      if (searchWords.length === 0) return true;

      const normalizedStreet = s.streetName.toLowerCase();
      return searchWords.every(word => normalizedStreet.includes(word));
    })
    .slice(0, 20);

  focusedSuggestionIndex = -1;
  showStreetSuggestions = streetSuggestions.length > 0;
}

  // Event handlers
  function handleCityInput(e) {
    selectedCity = e.target.value;
    showCitySuggestions = true;
    const term = selectedCity.toLowerCase();
    citySuggestions = [...new Set(streets
      .filter(s => s.cityName?.toLowerCase().includes(term))
      .map(s => s.cityName)
    )].slice(0, 10);
    
    selectedStreet = '';
  }

  function handleStreetInput(e) {
    selectedStreet = e.target.value;
    showStreetSuggestions = true;
    updateStreetSuggestions();
  }

 // Update handleKeyDown to handle both city and street navigation
  async function handleKeyDown(e, type) {
  if (type === 'city') {
    if (!showCitySuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedSuggestionIndex = Math.min(focusedSuggestionIndex + 1, citySuggestions.length - 1);
      await scrollToFocusedItem('city');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedSuggestionIndex = Math.max(focusedSuggestionIndex - 1, -1);
      await scrollToFocusedItem('city');
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      selectCity(citySuggestions[focusedSuggestionIndex]);
    }
  } else { // street
    if (!showStreetSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedSuggestionIndex = Math.min(focusedSuggestionIndex + 1, streetSuggestions.length - 1);
      await scrollToFocusedItem('street');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedSuggestionIndex = Math.max(focusedSuggestionIndex - 1, -1);
      await scrollToFocusedItem('street');
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      selectStreet(streetSuggestions[focusedSuggestionIndex]);
    }
  }
}


  // Update scrollToFocusedItem to handle both types
import { tick } from 'svelte';

async function scrollToFocusedItem(type) {
  await tick(); // wait for DOM updates

  const selector = type === 'city' ? '.city-suggestions li' : '.street-suggestions li';
  const items = document.querySelectorAll(selector);

  if (focusedSuggestionIndex >= 0 && items[focusedSuggestionIndex]) {
    items[focusedSuggestionIndex].scrollIntoView({ block: 'nearest' });
  }
}

let element;

   function selectCity(city) {
    selectedCity = city;
    selectedStreet = '';
    showCitySuggestions = false;

    dispatch('citySelect', city);
  }

  function selectStreet(street) {
    selectedStreet = street.streetName;
    showStreetSuggestions = false;

    dispatch('streetSelect', street.streetName);
  }
  // Ensure we have element reference before dispatching
  $effect(() => {
    if (element) {
      // Component is mounted and element is available
    }
  });
  loadStreets();
</script>

<div class="address-search" bind:this={element}>
 
  <!-- Street Search - No changes needed -->
  <div class="search-group">
    <label for="street-input">רחוב:</label>
    <input
      id="street-input"
      type="text"
      bind:value={selectedStreet}
      oninput={handleStreetInput}
      onkeydown={(e) => handleKeyDown(e, 'street')}
      onfocus={() => {
        showStreetSuggestions = true;
        updateStreetSuggestions();
        focusedSuggestionIndex = -1;
      }}
      onblur={() => setTimeout(() => showStreetSuggestions = false, 200)}
      placeholder={selectedCity ? `חפש רחוב ב${selectedCity}` : 'בחר עיר תחילה'}
      class="search-input"
      disabled={isLoading || !selectedCity}
      autocomplete="off"
    />
    
    {#if showStreetSuggestions && streetSuggestions.length > 0}
      <ul class="suggestions street-suggestions">
        {#each streetSuggestions as street, index (street.id)}
          <li 
            onclick={() => selectStreet(street)}
            onmouseenter={() => focusedSuggestionIndex = index}
            class:active={index === focusedSuggestionIndex}
            tabindex="0"
          >
            {street.streetName}
          </li>
        {/each}
      </ul>
    {:else if selectedStreet && streetSuggestions.length === 0 && selectedCity}
      <div class="no-results">לא נמצאו רחובות תואמים</div>
    {/if}
  </div>
   <!-- City Search - Updated with keyboard navigation -->
  <div class="search-group">
    <label for="city-input">עיר:</label>
    <input
      id="city-input"
      type="text"
      bind:value={selectedCity}
      oninput={handleCityInput}
      onkeydown={(e) => handleKeyDown(e, 'city')}
      onfocus={() => {
        showCitySuggestions = true;
        focusedSuggestionIndex = -1;
      }}
      onblur={() => setTimeout(() => showCitySuggestions = false, 200)}
      placeholder="בחר עיר"
      class="search-input"
      disabled={isLoading}
      autocomplete="off"
    />
    
    {#if showCitySuggestions && citySuggestions.length > 0}
      <ul class="suggestions city-suggestions">
        {#each citySuggestions as city, index (city)}
          <li 
            onclick={() => selectCity(city)}
            onkeydown={(e) => e.key === 'Enter' && selectCity(city)}
            onmouseenter={() => focusedSuggestionIndex = index}
            tabindex="0"
            class:active={index === focusedSuggestionIndex}
          >
            {city}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

</div>
<style>
  .address-search {
    max-width: 400px;
    margin: 1rem auto;
  }
  .search-group {
    position: relative;
    margin-bottom: 1rem;
  }
  .search-input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .suggestions {
    position: absolute;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 4px 4px;
    margin: 0;
    padding: 0;
    list-style: none;
    z-index: 20;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .suggestions li {
    padding: 0.5rem;
    cursor: pointer;
  }
  .suggestions li.active,
  .suggestions li:hover {
    background-color: #f5f5f5;
  }
  .no-results {
    padding: 0.5rem;
    color: #666;
    font-style: italic;
  }
</style>