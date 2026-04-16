<template>
  <a-card
    :class="['page-card', { dark: isDarkMode }]"
    title="Welcome to MyVideo"
  >
    <p>
      This is a Vue 3 + TypeScript application with Hugging Face API
      integration.
    </p>
    <a-space>
      <a-button
        :class="['page-button', { dark: isDarkMode }]"
        @click="$router.push('/user-center')"
      >
        User Center
      </a-button>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

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

onMounted(() => {
  syncThemeFromStorage();
  window.addEventListener("storage", syncThemeFromStorage);
  window.addEventListener("myagent-theme-changed", syncThemeFromStorage);
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", syncThemeFromStorage);
  window.removeEventListener("myagent-theme-changed", syncThemeFromStorage);
});
</script>

<style scoped>
.page-card {
  background: #ffffff;
  border-color: #e5e7eb;
}

.page-card.dark {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

.page-card.dark :deep(.ant-card-head) {
  background: #000000;
  border-bottom-color: #000000;
  color: #ffffff;
}

.page-card.dark :deep(.ant-card-head-title),
.page-card.dark :deep(p) {
  color: #ffffff;
}

.page-button.dark {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}
</style>
