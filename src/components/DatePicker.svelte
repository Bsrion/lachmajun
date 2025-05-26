<script>
  import flatpickr from "flatpickr";
  import "flatpickr/dist/flatpickr.min.css";
  import { Hebrew } from "flatpickr/dist/l10n/he.js";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let {
    date: initialDate = "",
    time: initialTime = "",
    idDate = "",
    idTime = "",
    placeholderDate = "בחר תאריך אספקה",
    placeholderTime = "בחר שעת אספקה",
    warning = false,
  } = $props();

  let dateInputEl = $state();
  let timeInputEl = $state();

  let date = $state(initialDate);
  let time = $state(initialTime);

 const hebrewDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function parseLocalDate(isoDateStr) {
  const [year, month, day] = isoDateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // Create local date
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const d = parseLocalDate(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const day = hebrewDays[d.getDay()];
  return `${dd}/${mm}/${yyyy} — ${day}`;
}


  onMount(() => {
   flatpickr(dateInputEl, {
  locale: Hebrew,
  defaultDate: date || null,
  dateFormat: "Y-m-d",
  altInput: true,
  onReady: (selectedDates, dateStr, instance) => {
    if (date) {
      instance.altInput.value = formatDateDisplay(date);
    }
  },
  onChange: ([selectedDate], dateStr, instance) => {
  if (selectedDate) {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    date = `${year}-${month}-${day}`;
    instance.altInput.value = formatDateDisplay(date);
  } else {
    date = "";
  }
  dispatch("dateOrTimeChange", { date, time });
},
});

  });

  function onTimeChange(event) {
    time = event.target.value;
    dispatch("dateOrTimeChange", { date, time });
  }
</script>

<div class="datetime-wrapper">
  <input
    bind:this={dateInputEl}
    id={idDate}
    placeholder={placeholderDate}
    class="lachmajun-input"
    class:invalid={warning}
  />

  <input
    type="time"
    bind:this={timeInputEl}
    value={time}
    id={idTime}
    placeholder={placeholderTime}
    class="lachmajun-input"
    class:invalid={warning}
    oninput={onTimeChange}
  />
</div>

<style>
  .datetime-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    direction: rtl;
    font-family: Arial, sans-serif;
  }

  .lachmajun-input {
    direction: rtl;
    text-align: right;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 16px;
    width: 50%;
    cursor: pointer;
  }

  .invalid {
    border-color: red;
  }

  /* Style the flatpickr altInput */
  .flatpickr-input[readonly] {
    background-color: white;
    cursor: pointer;
  }
</style>
