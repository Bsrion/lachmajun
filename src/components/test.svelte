<script>
  let showGroupUpdate = $state(false);

  function openGroupUpdate() {
    showGroupUpdate = true;
    console.log("Open group popup"); // Confirm this logs on button click
  }
  function closeGroupUpdate() {
    showGroupUpdate = false;
    console.log("Close popup"); // Confirm this logs when closing
  }
</script>

<button onclick={openGroupUpdate}>עדכן קבוצה</button>

{#if showGroupUpdate}
  <div class="popup-bg">
    <div class="popup-content">
      <h3>עדכון קבוצה</h3>
      <button onclick={closeGroupUpdate}>סגור</button>
    </div>
  </div>
{/if}

<style>
.popup-bg {
  position: fixed;
  top: 0; right: 0; left: 0; bottom: 0;
  background: rgba(80,80,90,0.24);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-content {
  background: #fff;
  border-radius: 14px;
  padding: 25px 32px;
  min-width: 380px;
  box-shadow: 0 4px 16px #0003;
  direction: rtl;
  outline: none;
}
</style>
