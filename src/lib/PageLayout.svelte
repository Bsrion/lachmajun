<script>
  import { currentUser, userPermissions } from '../lib/authStore.js';
  import Login from '../lib/Login.svelte';
  let showConfirm = false;
  function requestLogout() { showConfirm = true; }
  function cancelLogout() { showConfirm = false; }
  function confirmLogout() {
    currentUser.set(null);
    userPermissions.set([]);
    showConfirm = false;
  }
</script>

{#if !$currentUser}
  <div class="centered-login"><Login /></div>
{:else}
  <button class="logout-left" onclick={requestLogout}>התנתק</button>
  {#if showConfirm}
    <div class="logout-confirm-backdrop">
      <div class="logout-confirm-box">
        <div>האם אתה בטוח שברצונך להתנתק?</div>
        <div style="margin-top:1.2em;">
          <button class="danger" onclick={confirmLogout}>התנתק</button>
          <button onclick={cancelLogout}>ביטול</button>
        </div>
      </div>
    </div>
  {/if}
  <div class="page-content">
    <slot />
  </div>
{/if}


<style>
.centered-login {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: showAftrrOneSecond 0.3s ease-in-out forwards;
}
.logout-left {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1112;
  background: #ed1c24;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.2em 1em;
  font-size: 0.75em;
  font-weight: 400;
  cursor: pointer;
  box-shadow: 0 2px 10px #0001;
  transition: background 0.17s;
}
.logout-left:hover { background: #b51a1a; }

.logout-confirm-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.38);
  display: flex; justify-content: center; align-items: center;
  z-index: 1121;
}
.logout-confirm-box {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 22px #0002;
  padding: 2.5em 2em 2em 2em;
  font-size: 1.13em;
  color: #262626;
  max-width: 450px;
  text-align: center;
}
.logout-confirm-box button {
  margin: 0 0.5em;
  padding: 0.4em 1.4em;
  border-radius: 7px;
  font-size: 1em;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.logout-confirm-box button.danger {
  background: #ed1c24;
  color: #fff;
}
.logout-confirm-box button:not(.danger) {
  background: #f3f3f3;
  color: #333;
}
.page-content {
  padding: 2em 1.5em;
  margin-top: 50px;
}

@keyframes showAftrrOneSecond {
  0%, 90% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
