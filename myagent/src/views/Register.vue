<template>
  <!-- <a-layout style="height: 100vh; min-height: 100vh; background: #f0f2f5"> -->
  <a-layout-content
    style="flex: 1; display: flex; align-items: center; justify-content: center"
  >
    <a-card style="width: 400px" title="Register">
      <a-form :model="form" layout="vertical" @finish="handleRegister">
        <a-form-item label="Email" name="email" required>
          <a-input
            v-model:value="form.email"
            placeholder="Enter your email"
            type="email"
          />
        </a-form-item>

        <a-form-item label="Name" name="name" required>
          <a-input
            v-model:value="form.name"
            placeholder="Enter your full name"
          />
        </a-form-item>

        <a-form-item label="Password" name="password" required>
          <a-input-password
            v-model:value="form.password"
            placeholder="Enter your password"
          />
        </a-form-item>

        <a-form-item label="Confirm Password" name="confirmPassword" required>
          <a-input-password
            v-model:value="form.confirmPassword"
            placeholder="Confirm your password"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="authStore.loading"
            block
          >
            Register
          </a-button>
        </a-form-item>

        <a-alert
          v-if="authStore.error"
          :message="authStore.error"
          type="error"
          show-icon
          closable
          @close="() => (authStore.error = null)"
        />

        <div style="text-align: center; margin-top: 16px">
          <span>Already have an account? </span>
          <router-link to="/login" style="color: #1890ff; cursor: pointer"
            >Login</router-link
          >
        </div>
      </a-form>
    </a-card>
  </a-layout-content>
  <!-- </a-layout> -->
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: "",
  name: "",
  password: "",
  confirmPassword: "",
});

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    authStore.error = "Passwords do not match";
    return;
  }

  const success = await authStore.register(
    form.value.email,
    form.value.password,
    form.value.name,
  );

  if (success) {
    router.push("/hugging-face");
  }
};
</script>
