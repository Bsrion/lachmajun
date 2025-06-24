// src/lib/authStore.js
import { writable } from 'svelte/store';

export const currentUser = writable(null);
export const userPermissions = writable([]);
