<template>
  <a-layout style="height: 100vh; min-height: 100vh; background: #f0f2f5">
    <a-layout-content style="flex: 1; display: flex; align-items: center; justify-content: center">
      <a-card style="width: 400px" title="Login">
        <a-form :model="form" layout="vertical" @finish="handleLogin">
          <a-form-item label="Email" name="email" required>
            <a-input
              v-model:value="form.email"
              placeholder="Enter your email"
              type="email"
            />
          </a-form-item>

          <a-form-item label="Password" name="password" required>
            <a-input-password
              v-model:value="form.password"
              placeholder="Enter your password"
            />
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="authStore.loading"
              block
            >
              Login
            </a-button>
          </a-form-item>

          <a-alert
            v-if="authStore.error"
            :message="authStore.error"
            type="error"
            show-icon
            closable
            @close="() => authStore.error = null"
          />

          <div style="text-align: center; margin-top: 16px">
            <span>Don't have an account?</span>
            <a @click="$router.push('/register')">Register</a>
          </div>
        </a-form>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = ref({
  email: 'user@example.com',
  password: 'password123',
});

const handleLogin = async () => {
  const success = await authStore.login(form.value.email, form.value.password);
  if (success) {
    const redirect = route.query.redirect as string;
    router.push(redirect || '/hugging-face');
  }
};
</script>
