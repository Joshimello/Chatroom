import { writable } from 'svelte/store'

export const state = writable<'menu' | 'login' | 'register'>('menu')
export const email = writable('')