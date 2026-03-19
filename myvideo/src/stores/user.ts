import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/types/api";

export const useUserStore = defineStore("user", () => {
  // State
  const profile = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const setProfile = (userData: User) => {
    profile.value = userData;
  };

  const clearProfile = () => {
    profile.value = null;
  };

  const updateProfile = (updates: Partial<User>) => {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates };
    }
  };

  return {
    profile,
    loading,
    error,
    setProfile,
    clearProfile,
    updateProfile,
  };
});
