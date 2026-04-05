<template>
  <BasicLayout
    :headerMenuItems="headerMenuItems"
    :siderMenuItems="siderMenuItems"
    :selectedHeaderKey="selectedHeaderKey"
    :selectedSiderKey="selectedSiderKey"
    @header-menu-click="handleHeaderMenuClick"
    @sider-menu-click="handleSiderMenuClick"
  >
    <router-view />
  </BasicLayout>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BasicLayout from "../Layout/BasicLayout.vue";

interface MenuItem {
  key: string;
  label: string;
}

const router = useRouter();
const route = useRoute();

const headerMenuItems = ref<MenuItem[]>([
  { key: "1", label: "Home" },
  { key: "3", label: "User Center" },
]);

const siderMenuItems = ref<MenuItem[]>([
  { key: "text", label: "文本输入" },
  { key: "audio", label: "音频输入" },
  { key: "image", label: "图片输入" },
]);

const selectedHeaderKey = computed(() => {
  if (route.path === "/") return "1";
  if (route.path === "/user-center") return "3";
  return "";
});

const selectedSiderKey = computed(() => {
  if (route.path === "/text-models") return "text";
  if (route.path === "/audio-models") return "audio";
  if (route.path === "/image-models") return "image";
  return "";
});

// const breadcrumbItems = ref<string[]>([]);

const handleHeaderMenuClick = (key: string) => {
  switch (key) {
    case "1":
      router.push("/");
      break;
    case "3":
      router.push("/user-center");
      break;
  }
};

const handleSiderMenuClick = (key: string) => {
  switch (key) {
    case "text":
      router.push("/text-models");
      break;
    case "audio":
      router.push("/audio-models");
      break;
    case "image":
      router.push("/image-models");
      break;
  }
};
</script>
<style>
.site-layout-background {
  background: #fff;
}

/* Hide native Edge password reveal icon to avoid double eye with Ant Design */
input::-ms-reveal,
input::-ms-clear {
  display: none;
}
</style>
