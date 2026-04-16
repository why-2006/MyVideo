<template>
  <a-layout
    class="basic-layout"
    :class="{ dark: isDarkMode }"
    style="height: 100vh; min-height: 100vh"
  >
    <a-layout-header class="header">
      <div class="logo" />
      <a-menu
        id="header-menu"
        :selectedKeys="selectedKeys1"
        :theme="isDarkMode ? 'dark' : 'light'"
        mode="horizontal"
        :style="{ lineHeight: '64px', flex: 1 }"
        @click="(e: any) => $emit('header-menu-click', e.key)"
      >
        <a-menu-item v-for="item in headerMenuItems" :key="item.key">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
      <div class="auth-buttons">
        <a-tooltip :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
          <a-button
            type="text"
            shape="circle"
            class="theme-toggle"
            @click="toggleTheme"
          >
            <template #icon>
              <BulbOutlined />
            </template>
          </a-button>
        </a-tooltip>
        <a-button
          v-if="authStore.isAuthenticated"
          type="default"
          @click="goToUserCenter"
        >
          {{ accountName }}
        </a-button>
        <router-link v-else to="/login">
          <a-button type="primary">登录</a-button>
        </router-link>
      </div>
    </a-layout-header>
    <a-layout class="main-layout">
      <a-layout-sider width="200" class="sider" v-if="showSider">
        <a-menu
          :selectedKeys="selectedKeys2"
          :theme="isDarkMode ? 'dark' : 'light'"
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
          @click="(e: any) => $emit('sider-menu-click', e.key)"
        >
          <a-menu-item v-for="item in siderMenuItems" :key="item.key">
            {{ item.label }}
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout class="content-layout">
        <a-layout-content class="content">
          <slot />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { BulbOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
interface MenuItem {
  key: string;
  label: string;
}

const router = useRouter();
const authStore = useAuthStore();
const isDarkMode = ref(false);
const THEME_KEY = "myagent-multimodal-theme";

const syncThemeFromStorage = () => {
  const latest = localStorage.getItem(THEME_KEY);
  if (latest === "dark") {
    isDarkMode.value = true;
  } else if (latest === "light") {
    isDarkMode.value = false;
  }
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem(THEME_KEY, isDarkMode.value ? "dark" : "light");
  window.dispatchEvent(new Event("myagent-theme-changed"));
};

const props = withDefaults(
  defineProps<{
    headerMenuItems?: MenuItem[];
    siderMenuItems?: MenuItem[];
    showSider?: boolean;
    selectedHeaderKey?: string;
    selectedSiderKey?: string;
  }>(),
  {
    headerMenuItems: () => [],
    siderMenuItems: () => [],
    showSider: true,
    selectedHeaderKey: "",
    selectedSiderKey: "",
  },
);

defineEmits<{
  "header-menu-click": [key: string];
  "sider-menu-click": [key: string];
}>();

const selectedKeys1 = computed(() =>
  props.selectedHeaderKey ? [props.selectedHeaderKey] : [],
);
const selectedKeys2 = computed(() =>
  props.selectedSiderKey ? [props.selectedSiderKey] : [],
);

const accountName = computed(() => authStore.user?.name || "账号");

const goToUserCenter = () => {
  router.push("/user-center");
};

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    isDarkMode.value = true;
  } else if (savedTheme === "light") {
    isDarkMode.value = false;
  } else {
    isDarkMode.value = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    localStorage.setItem(THEME_KEY, isDarkMode.value ? "dark" : "light");
  }

  window.addEventListener("myagent-theme-changed", syncThemeFromStorage);
  window.addEventListener("storage", syncThemeFromStorage);
});

onBeforeUnmount(() => {
  window.removeEventListener("myagent-theme-changed", syncThemeFromStorage);
  window.removeEventListener("storage", syncThemeFromStorage);
});
</script>
<style scoped>
.basic-layout {
  --layout-bg: #f3f7fb;
  --header-bg: #f8fafc;
  --header-text: #1f2937;
  --sider-bg: #ffffff;
  --content-bg: #f3f7fb;
}

.basic-layout.dark {
  --layout-bg: #111827;
  --header-bg: #0f172a;
  --header-text: #e5e7eb;
  --sider-bg: #111827;
  --content-bg: #141a27;
}

.header {
  background: var(--header-bg);
  color: var(--header-text);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#header-menu {
  background: transparent;
}

.main-layout {
  background: var(--layout-bg);
}

.sider {
  background: var(--sider-bg) !important;
}

.content-layout {
  padding: 0 12px 12px;
  height: 100%;
  background: var(--content-bg);
}

.content {
  background: var(--content-bg);
  padding: 12px;
  margin: 0;
  min-height: 280px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.auth-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.theme-toggle {
  color: var(--header-text);
}

.auth-buttons a {
  text-decoration: none;
  color: inherit;
}

.logo {
  float: left;
  width: 44px;
  height: 44px;
  margin: 16px 24px 16px 0;
  background-image: url("../src/assets/logo.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.ant-row-rtl .logo {
  float: right;
  margin: 16px 0 16px 24px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}

.basic-layout.dark :deep(.ant-menu-light),
.basic-layout.dark :deep(.ant-layout-sider-children),
.basic-layout.dark :deep(.ant-menu-dark) {
  background: var(--sider-bg) !important;
}

.basic-layout.dark :deep(.ant-menu-item),
.basic-layout.dark :deep(.ant-menu-submenu-title) {
  color: #cbd5e1 !important;
}

.basic-layout.dark :deep(.ant-menu-item-selected) {
  background: #1e293b !important;
  color: #e2e8f0 !important;
}

.basic-layout.dark :deep(.ant-btn-default) {
  color: #e2e8f0;
  border-color: #475569;
  background: #1e293b;
}
</style>
