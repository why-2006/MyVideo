<template>
  <a-layout style="height: 100vh; min-height: 100vh">
    <a-layout-header class="header">
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="selectedKeys1"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px', flex: 1 }"
        @select="(e: any) => $emit('header-menu-click', e.key)"
      >
        <a-menu-item v-for="item in headerMenuItems" :key="item.key">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
      <div class="auth-buttons">
        <router-link to="/login">
          <a-button type="primary">登录</a-button>
        </router-link>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff" v-if="showSider">
        <a-menu
          v-model:selectedKeys="selectedKeys2"
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
          @select="(e: any) => $emit('sider-menu-click', e.key)"
        >
          <a-menu-item v-for="item in siderMenuItems" :key="item.key">
            {{ item.label }}
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px; height: 100%">
        <a-breadcrumb style="margin: 16px 0" v-if="showBreadcrumb">
          <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item">
            {{ item }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <a-layout-content
          :style="{
            background: '#fff',
            padding: '24px',
            margin: 0,
            minHeight: '280px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }"
        >
          <slot />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { ref } from "vue";

interface MenuItem {
  key: string;
  label: string;
}

withDefaults(
  defineProps<{
    headerMenuItems?: MenuItem[];
    siderMenuItems?: MenuItem[];
    breadcrumbItems?: string[];
    showSider?: boolean;
    showBreadcrumb?: boolean;
    selectedHeaderKey?: string;
    selectedSiderKey?: string;
  }>(),
  {
    headerMenuItems: () => [],
    siderMenuItems: () => [],
    breadcrumbItems: () => ["Home", "List", "App"],
    showSider: true,
    showBreadcrumb: true,
    selectedHeaderKey: "",
    selectedSiderKey: "",
  },
);

defineEmits<{
  "header-menu-click": [key: string];
  "sider-menu-click": [key: string];
}>();

const selectedKeys1 = ref<string[]>([]);
const selectedKeys2 = ref<string[]>([]);
</script>
<style scoped>
.header {
  background: #001529;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.auth-buttons a {
  text-decoration: none;
  color: inherit;
}

.logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
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
</style>
