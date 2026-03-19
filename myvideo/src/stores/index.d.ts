import { useAuthStore } from './auth';
import { useUserStore } from './user';
import { useHfStore } from './hf';
declare const pinia: import("pinia").Pinia;
export { useAuthStore, useUserStore, useHfStore };
export default pinia;
