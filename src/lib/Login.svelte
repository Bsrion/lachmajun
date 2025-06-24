<script>
  import { currentUser, userPermissions } from '../lib/authStore.js';
  let username = '';
  let password = '';
  let error = '';

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
    } else {
      error = data.error || 'שגיאת התחברות';
    }
  }
</script>

<form class="login-form" onsubmit={login} autocomplete="on">
  <label>
    שם משתמש
    <input name="username" bind:value={username} autocomplete="username" type="text" />
  </label>
  <label>
    סיסמה
    <input name="password" bind:value={password} type="password" autocomplete="current-password" />
  </label>
  <button type="submit">התחבר</button>
  {#if error}<span class="error">{error}</span>{/if}
</form>

<style>
  .login-form {
    display: flex;
    flex-direction: column;
    max-width: 340px;
    margin: 3rem auto;
    padding: 2rem 2.5rem;
    background: #fff;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
    border-radius: 12px;
    border: none;
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

  input {
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

  button {
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

  button:hover, button:focus {
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
</style>