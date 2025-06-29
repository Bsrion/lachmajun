<script>
  import { currentUser, userPermissions } from '../lib/authStore.js';
  let username = '';
  let password = '';
  let error = '';
  let showPassword = false;

  // Log out
  function logout() {
    currentUser.set(null);
    userPermissions.set([]);
    // Optionally clear password for security
    password = '';
  }

  async function login(event) {
    event.preventDefault();
    error = '';
    const res = await fetch('https://dilen-digital.co.il/api/admin_login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser.set(data.user);
      userPermissions.set(data.permissions);
      // Clear password but keep username
      password = '';
    } else {
      error = data.error || 'שגיאת התחברות';
    }
  }
</script>

<form class="login-form" on:submit={login} autocomplete="on">
  {#if $currentUser}
    <div class="connected-message">
      {$currentUser.display_name} מחובר
      <button type="button" class="logout-btn" on:click={logout}>התנתק</button>
    </div>
  {/if}
  <label>
    שם משתמש
    <input name="username" bind:value={username} autocomplete="username" type="text" readonly={$currentUser}/>
  </label>
  <label>
    סיסמה
    <input
      name="password"
      bind:value={password}
      type={showPassword ? "text" : "password"}
      autocomplete="current-password"
      readonly={$currentUser}
    />
    <div class="show-pass-row">
      <input id="showPass" type="checkbox" bind:checked={showPassword} disabled={$currentUser}/>
      <label for="showPass" class="show-pass-label">הצג סיסמה</label>
    </div>
  </label>
  {#if !$currentUser}
    <button type="submit">התחבר</button>
  {/if}
  {#if error}<span class="error">{error}</span>{/if}
</form>

<style>
  .login-form {
    display: flex;
    flex-direction: column;
    max-width: 340px;
    min-width: 340px;
    margin: 3rem auto;
    padding: 2rem 2.5rem;
    background: #fff;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
    border-radius: 12px;
    border: none;
  }
  .connected-message {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #dafaf5;
    color: #227e57;
    font-size: 1.1em;
    font-weight: 500;
    padding: 0.7em 1em;
    border-radius: 8px;
    margin-bottom: 1.4em;
    box-shadow: 0 2px 10px #00000013;
  }
  .logout-btn {
    background: #ed1c24;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 0.35em 1.2em;
    font-size: 1em;
    font-weight: 500;
    cursor: pointer;
    margin-right: 0.6em;
    transition: background 0.15s;
  }
  .logout-btn:hover {
    background: #a61618;
  }

  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    color: #222;
    margin-bottom: 1.2rem;
    font-size: 1.05rem;
    letter-spacing: 0.01em;
  }

  input[type="text"], input[type="password"] {
    margin-top: 0.4rem;
    margin-bottom: 0.2rem;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafbfc;
    transition: border 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #1976d2;
    background: #fff;
  }

  button[type="submit"] {
    padding: 0.7rem 0;
    font-size: 1.08rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(90deg, #1976d2 60%, #1565c0 100%);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
    transition: background 0.2s, box-shadow 0.2s;
  }
  button[type="submit"]:hover, button[type="submit"]:focus {
    background: linear-gradient(90deg, #1565c0 60%, #1976d2 100%);
    box-shadow: 0 4px 16px rgba(25, 118, 210, 0.13);
  }

  .error {
    color: #d32f2f;
    background: #fff0f0;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    padding: 0.5rem 0.8rem;
    margin-top: 1rem;
    font-size: 0.98rem;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .show-pass-row {
    display: flex;
    align-items: center;
    margin-top: 0.15em;
    gap: 0.5em;
  }
  .show-pass-label {
    font-weight: 400;
    font-size: 0.98em;
    color: #555;
    margin-bottom: 0;
    margin-top: 0;
  }
  input[readonly] {
    background: #f3f3f3 !important;
    color: #aaa !important;
    pointer-events: none;
    border-color: #e0e0e0 !important;
  }
</style>
