<script>
  import { createEventDispatcher, tick } from 'svelte';

  // Event dispatcher to send selected address data
  const dispatch = createEventDispatcher();

  // Props with default values (from parent component or page)
  let { city: initialCity = "ירושלים", street: initialStreet = "", houseNumber: initialHouseNumber = "", houseNotes: initialHouseNotes = "" } = $props();

  // Reactive state variables
  let selectedCity = $state(initialCity);
  let selectedStreet = $state(initialStreet);
  let houseNumber = $state(initialHouseNumber);
  let houseNotes = $state(initialHouseNotes);
  let streets = $state([]);
  let citySuggestions = $state([]);
  let streetSuggestions = $state([]);
  let isLoading = $state(false);
  let streetsLoaded = $state(false);
  let isJerusalem = $state(false);

  // UI interaction state
  let showCitySuggestions = $state(false);
  let showStreetSuggestions = $state(false);
  let focusedSuggestionIndex = $state(-1);

  let cityListEl = $state();
   let streetListEl = $state();

  // Load and parse CSV with streets
  async function loadStreets() {
    if (streetsLoaded) return;
    isLoading = true;
    streetsLoaded = true;

    try {
      const response = await fetch('/data/streets_utf8.csv');
      const text = await response.text();
      streets = text.split('\n')
        .filter(Boolean)
        .map((row, index) => {
          const cols = row.split(',');
          return {
            id: `${index}-${cols[1]?.trim()}`,
            streetName: cols[3]?.trim(),
            cityName: cols[1]?.trim()
          };
        });

      // Extract unique city names
      citySuggestions = [...new Set(streets.map(s => s.cityName).filter(Boolean))];
    } catch (err) {
      console.error('Error loading streets:', err);
    } finally {
      isLoading = false;
    }
  }

  // Filter streets based on user input
  function updateStreetSuggestions() {
    if (!selectedStreet || !selectedCity) {
      streetSuggestions = [];
      showStreetSuggestions = false;
      return;
    }

    const searchWords = selectedStreet.toLowerCase().split(/\s+/).filter(Boolean);

    streetSuggestions = streets
      .filter(s =>
        s.cityName === selectedCity &&
        s.streetName &&
        searchWords.every(word => s.streetName.toLowerCase().includes(word))
      )
      .slice(0, 20);

    focusedSuggestionIndex = -1;
    showStreetSuggestions = streetSuggestions.length > 0;
  }

  // City input change
  function handleCityInput(e) {
    selectedCity = e.target.value;
    showCitySuggestions = true;

    const term = selectedCity.toLowerCase();
    citySuggestions = [...new Set(
      streets.filter(s => s.cityName?.toLowerCase().includes(term)).map(s => s.cityName)
    )].slice(0, 10);

    selectedStreet = '';
  }

  // Street input change
  function handleStreetInput(e) {
    selectedStreet = e.target.value;
    showStreetSuggestions = true;
    updateStreetSuggestions();
  }

  // Scroll to selected suggestion
  async function scrollToFocusedItem(type) {
    await tick();
    const listEl = type === 'city' ? cityListEl : streetListEl;
    if (focusedSuggestionIndex >= 0 && listEl?.children[focusedSuggestionIndex]) {
      listEl.children[focusedSuggestionIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // Keyboard navigation for suggestion lists
  function handleKeyDown(e, type) {
    let suggestions = type === 'city' ? citySuggestions : streetSuggestions;
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedSuggestionIndex = Math.min(focusedSuggestionIndex + 1, suggestions.length - 1);
      scrollToFocusedItem(type);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedSuggestionIndex = Math.max(focusedSuggestionIndex - 1, -1);
      scrollToFocusedItem(type);
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      type === 'city'
        ? selectCity(suggestions[focusedSuggestionIndex])
        : selectStreet(suggestions[focusedSuggestionIndex]);
    }
  }

  // Select city from suggestions
  function selectCity(city) {
    selectedCity = city;
    selectedStreet = '';
    showCitySuggestions = false;
  }

  // Select street from suggestions
  function selectStreet(street) {
    selectedStreet = street.streetName;
    showStreetSuggestions = false;
  }

  loadStreets();
</script>

<!-- UI Layout -->
<div class="address-search">
  <!-- City Field -->
  <div class="search-group">
    <label for="city-input">עיר:</label>
    <input
      id="city-input"
      type="text"
      bind:value={selectedCity}
      oninput={handleCityInput}
      onkeydown={(e) => handleKeyDown(e, 'city')}
      onfocus={() => { showCitySuggestions = true; focusedSuggestionIndex = -1; }}
      onblur={() => setTimeout(() => showCitySuggestions = false, 100)}
      placeholder="בחר עיר"
      class="search-input"
      disabled={isLoading || !isJerusalem}
      readonly={!isJerusalem}
      autocomplete="off"
    />
    <input type="checkbox" onchange={isJerusalem = !isJerusalem} checked={isJerusalem} style="margin-top:7px;">
    {#if !isJerusalem}
      <span style="font-size:small; color:gray; margin-left:0.5rem;">לחץ לאפשר לבחור עיר אחרת</span>
    {:else}
      <span style="font-size:small; color:gray; margin-left:0.5rem;">בטל סימון לאפשרות לבחור עיר אחרת</span>
    {/if}
    
    {#if showCitySuggestions && citySuggestions.length > 0}
      <ul class="suggestions city-suggestions" bind:this={cityListEl}>
        {#each citySuggestions as city, index (city)}
          <li 
            tabindex="0"
            onclick={() => selectCity(city)}
            onmouseenter={() => focusedSuggestionIndex = index}
            class:active={index === focusedSuggestionIndex}
          >
            {city}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <!-- Street Field -->
  <div class="search-group">
    <label for="street-input">רחוב:</label>
    <input
      id="street-input"
      type="text"
      bind:value={selectedStreet}
      oninput={handleStreetInput}
      onkeydown={(e) => handleKeyDown(e, 'street')}
      onfocus={() => { showStreetSuggestions = true; updateStreetSuggestions(); focusedSuggestionIndex = -1; }}
      onblur={() => setTimeout(() => showStreetSuggestions = false, 200)}
      placeholder={selectedCity ? `חפש רחוב ב${selectedCity}` : 'בחר עיר תחילה'}
      class="search-input"
      disabled={isLoading || !selectedCity}
      autocomplete="off"
    />

    {#if showStreetSuggestions && streetSuggestions.length > 0}
      <ul class="suggestions street-suggestions" bind:this={streetListEl}>
        {#each streetSuggestions as street, index (street.id)}
          <li 
            tabindex="0"
            onclick={() => selectStreet(street)}
            onmouseenter={() => focusedSuggestionIndex = index}
            class:active={index === focusedSuggestionIndex}
          >
            {street.streetName}
          </li>
        {/each}
      </ul>
    {:else if selectedStreet && streetSuggestions.length === 0 && selectedCity}
      <div class="no-results">לא נמצאו רחובות תואמים</div>
    {/if}
  </div>

  <!-- House Number & Notes -->
  <div class="search-group">
    <label for="house-number-input">מספר בית:</label>
    <input
      id="house-number-input"
      type="text"
      class="search-input"
      placeholder="מספר בית"
      bind:value={houseNumber}
      autocomplete="off"
    />
    <textarea
      class="search-input"
      placeholder="הערות (אופציונלי)"
      bind:value={houseNotes}
      rows="2"
    ></textarea>
  </div>

  <!-- Submit Button -->
  <button class="save-button" onclick={() => {
    dispatch('streetSelect', {
      city: selectedCity,
      streetName: selectedStreet,
      streetNumber: houseNumber,
      streetNote: houseNotes
    });
  }}>
    שמור וסגור
  </button>
</div>

<!-- Styles -->
<style>
  .address-search {
    max-width: 420px;
    margin: 2rem auto 2rem 0;
    background: #fff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    font-family: system-ui, sans-serif;
  }

  .search-group {
    margin-bottom: 1.25rem;
    position: relative;
  }

  .search-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  .search-input {
    width: 95%;
    padding: 0.65rem 0.75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    transition: border 0.2s, box-shadow 0.2s;
  }

  .search-input:focus {
    border-color: #0077cc;
    box-shadow: 0 0 0 3px rgba(0, 119, 204, 0.2);
    outline: none;
  }

  .suggestions {
    position: absolute;
    width: 100%;
    max-height: 220px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 8px 8px;
    margin: 0;
    padding: 0;
    list-style: none;
    z-index: 1000;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  }

  .suggestions li {
    padding: 0.65rem 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .suggestions li.active,
  .suggestions li:hover {
    background-color: #f0f8ff;
  }

  .no-results {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    color: #999;
    font-style: italic;
  }

  textarea.search-input {
    resize: vertical;
    min-height: 80px;
    margin-top: 0.5rem;
  }

  /* Save Button Styling */
  .save-button {
    width:100%;
    padding: 10px 20px;
    font-size: 1rem;
    border: none;
    background: #000000;
    color: white;
    border: solid 1px #000000;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .save-button:hover {
background: #ffffff;
    border: solid 1px #000000;
    color: #000000  }
</style>
