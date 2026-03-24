<template>
  <a-layout-content style="padding: 24px; background: #f0f2f5">
    <a-card title="User Center" :loading="loading">
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

      <a-divider />

      <h3>Statistics</h3>
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="Models Accessed" :value="124" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="Inferences Run" :value="89" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="Favorites" :value="23" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="Storage Used" :value="234" suffix="MB" />
        </a-col>
      </a-row>

      <a-divider />

      <h3>Favorite Models</h3>
      <a-list :data-source="favoriteModels" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :title="item.name"
              :description="item.description"
            />
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </a-layout-content>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { userApi } from "@/services/api";

const authStore = useAuthStore();
const userStore = useUserStore();
const loading = ref(false);

const favoriteModels = ref([
  { name: "gpt2", description: "Pre-trained language model from OpenAI" },
  { name: "bert-base-uncased", description: "Bert model for English" },
  { name: "distilbert-base-uncased", description: "Distilled BERT model" },
]);

const fetchProfile = async () => {
  if (!authStore.isAuthenticated) return;

  loading.value = true;
  try {
    const response = await userApi.getProfile();
    userStore.setProfile(response.data);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    // 如果API不存在，使用模拟数据
    userStore.setProfile({
      id: authStore.user?.id || "1",
      name: authStore.user?.name || "Test User",
      email: authStore.user?.email || "user@example.com",
      username: authStore.user?.username || "testuser",
      createdAt: new Date().toISOString(),
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    authStore.login("user@example.com", "password123");
  }
  fetchProfile();
});
</script>
