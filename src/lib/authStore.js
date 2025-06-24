// src/lib/authStore.js
import { writable } from 'svelte/store';

// Helper: get from localStorage, or null/[]
function fromLocal(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

// User store (null if not logged in)
export const currentUser = writable(fromLocal('currentUser', null));
currentUser.subscribe(val => {
  if (typeof window !== 'undefined') {
    if (val) localStorage.setItem('currentUser', JSON.stringify(val));
    else localStorage.removeItem('currentUser');
  }
});

// Permissions store (array)
export const userPermissions = writable(fromLocal('userPermissions', []));
userPermissions.subscribe(val => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userPermissions', JSON.stringify(val));
  }
});
