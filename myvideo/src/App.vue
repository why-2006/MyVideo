<template>
  <BasicLayout
    :headerMenuItems="headerMenuItems"
    :siderMenuItems="siderMenuItems"
    :breadcrumbItems="breadcrumbItems"
    @header-menu-click="handleHeaderMenuClick"
    @sider-menu-click="handleSiderMenuClick"
  >
    <router-view />
  </BasicLayout>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import BasicLayout from "../Layout/BasicLayout.vue";

interface MenuItem {
  key: string;
  label: string;
}

const router = useRouter();

const headerMenuItems = ref<MenuItem[]>([
  { key: "1", label: "Home" },
  { key: "3", label: "User Center" },
]);

const siderMenuItems = ref<MenuItem[]>([
  { key: "text", label: "文本输入" },
  { key: "audio", label: "音频输入" },
  { key: "image", label: "图片输入" },
]);

const breadcrumbItems = ref<string[]>([]);

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
<style scoped>
.site-layout-background {
  background: #fff;
}
</style>
