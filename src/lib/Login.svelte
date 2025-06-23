<!-- <script>
  import { currentUser, setCurrentUser, userPermissions, setUserPermissions } from './authStore.svelte.js';
  let username = $state('');
  let password = $state('');
  let error = $state('');

  async function login() {
    error = '';
    const res = await fetch('/api/admin_login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      setCurrentUser(data.user);
      setUserPermissions(data.permissions);
    } else {
      error = data.error || 'שגיאת התחברות';
    }
  }
</script>


<div class="login-form">
  <label>שם משתמש <input bind:value={username} autocomplete="username"></label>
  <label>סיסמה <input type="password" bind:value={password} autocomplete="current-password"></label>
  <button onclick={login}>התחבר</button>
  {#if error}<span class="error">{error}</span>{/if}
</div> -->
