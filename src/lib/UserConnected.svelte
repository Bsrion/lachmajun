<script>
  import { currentUser } from '../lib/authStore.js';
</script>

{#if $currentUser}
  <div class="user-connected-msg">
    {$currentUser.display_name} מחובר
  </div>
{/if}

<style>
.user-connected-msg {
  text-align: center;
  background: #dafaf5;
  color: #227e57;
  font-size: 1.3em;
  font-weight: 500;
  padding: 0.9em 1em;
  border-radius: 10px;
  margin: 22px auto 18px auto;
  max-width: 340px;
  box-shadow: 0 2px 10px #00000013;
  letter-spacing: 0.05em;
  transition: background 0.3s;
}
</style>
