<template>
  <!-- <a-layout-content style="padding: 24px; background: #f0f2f5"> -->
  <a-card
    :class="['profile-card', { dark: isDarkMode }]"
    title="个人用户中心"
    :loading="loading"
  >
    <template #extra>
      <a-button
        :class="['logout-button', { dark: isDarkMode }]"
        danger
        @click="handleLogout"
        >退出登录</a-button
      >
    </template>

    <a-descriptions :column="2" bordered>
      <a-descriptions-item label="User ID">
        {{ userStore.profile?.id || "N/A" }}
      </a-descriptions-item>
      <a-descriptions-item label="Name">
        {{ userStore.profile?.name || "N/A" }}
      </a-descriptions-item>
      <a-descriptions-item label="Email">
        {{ userStore.profile?.email || "N/A" }}
      </a-descriptions-item>
      <a-descriptions-item label="Member Since">
        {{ userStore.profile?.createdAt || "N/A" }}
      </a-descriptions-item>
    </a-descriptions>
  </a-card>
  <!-- </a-layout-content> -->
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const loading = ref(false);
const isDarkMode = ref(false);
const THEME_KEY = "myagent-multimodal-theme";

const syncThemeFromStorage = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    isDarkMode.value = true;
  } else if (savedTheme === "light") {
    isDarkMode.value = false;
  }
};

const fetchProfile = async () => {
  if (!authStore.isAuthenticated) return;

  loading.value = true;
  try {
    userStore.setProfile({
      id: authStore.user?.id || "1",
      name: authStore.user?.name || "Test User",
      email: authStore.user?.email || "user@example.com",
      createdAt: new Date().toISOString(),
    });
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  userStore.clearProfile();
  router.push("/login");
};

onMounted(() => {
  syncThemeFromStorage();
  window.addEventListener("storage", syncThemeFromStorage);
  window.addEventListener("myagent-theme-changed", syncThemeFromStorage);
  if (!authStore.isAuthenticated) {
    router.replace("/login");
    return;
  }

  fetchProfile();
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", syncThemeFromStorage);
  window.removeEventListener("myagent-theme-changed", syncThemeFromStorage);
});
</script>

<style scoped>
.profile-card {
  background: #ffffff;
  border-color: #e5e7eb;
}

.profile-card.dark {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

.profile-card.dark :deep(.ant-card-head) {
  background: #000000;
  border-bottom-color: #000000;
  color: #ffffff;
}

.profile-card.dark :deep(.ant-card-head-title),
.profile-card.dark :deep(.ant-descriptions-item-label),
.profile-card.dark :deep(.ant-descriptions-item-content) {
  color: #ffffff;
}

.profile-card.dark
  :deep(.ant-descriptions-bordered .ant-descriptions-item-label),
.profile-card.dark
  :deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

.profile-card.dark :deep(.ant-divider) {
  border-color: #000000;
}

.logout-button.dark {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}
</style>
