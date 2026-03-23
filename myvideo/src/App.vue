<template>
  <BasicLayout
    :headerMenuItems="headerMenuItems"
    :siderMenuItems="siderMenuItems"
    :breadcrumbItems="breadcrumbItems"
    @header-menu-click="handleHeaderMenuClick"
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
  { key: "2", label: "Hugging Face Demo" },
  { key: "3", label: "User Center" },
]);

const siderMenuItems = ref<MenuItem[]>([
  { key: "1", label: "Option 1" },
  { key: "2", label: "Option 2" },
  { key: "3", label: "Option 3" },
]);

const breadcrumbItems = ref<string[]>([]);

const handleHeaderMenuClick = (key: string) => {
  switch (key) {
    case "1":
      router.push("/");
      break;
    case "2":
      router.push("/hugging-face");
      break;
    case "3":
      router.push("/user-center");
      break;
  }
};
</script>
<style scoped>
.site-layout-background {
  background: #fff;
}
</style>
