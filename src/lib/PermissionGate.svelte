<script>
  import { userPermissions } from './authStore.svelte.js';
  const { page = '', requireEdit = false } = $props();

  // Derived: is the user allowed to view or edit this page?
  const allowed = $derived(() => {
    const perms = userPermissions || [];
    const perm = perms.find(p => p.slug === page);
    if (!perm) return false;
    if (requireEdit) return perm.can_edit;
    return perm.can_view;
  });
</script>

{#if allowed}
  <slot />
{:else}
  <div style="color: #e74c3c; font-weight: bold;">אין לך הרשאה לעמוד זה.</div>
{/if}
