import { createPinia } from 'pinia';
import { useAuthStore } from './auth';
import { useUserStore } from './user';
import { useHfStore } from './hf';

const pinia = createPinia();

export { useAuthStore, useUserStore, useHfStore };

export default pinia;
