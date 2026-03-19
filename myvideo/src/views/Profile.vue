<template>
  <a-layout-content style="padding: 24px; background: #f0f2f5">
    <a-card title="Profile">
      <template v-if="authStore.user">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="Name">
            {{ authStore.user.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Email">
            {{ authStore.user.email }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <h3>Edit Profile</h3>
        <a-form layout="vertical">
          <a-form-item label="Name">
            <a-input v-model:value="profileForm.name" />
          </a-form-item>

          <a-form-item label="Email">
            <a-input v-model:value="profileForm.email" disabled />
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" :loading="loading" @click="handleUpdate">
                Update Profile
              </a-button>
              <a-button @click="authStore.logout">Logout</a-button>
            </a-space>
          </a-form-item>
        </a-form>

        <a-divider />

        <h3>Change Password</h3>
        <a-form layout="vertical">
          <a-form-item label="Current Password">
            <a-input-password v-model:value="passwordForm.currentPassword" />
          </a-form-item>
          <a-form-item label="New Password">
            <a-input-password v-model:value="passwordForm.newPassword" />
          </a-form-item>
          <a-form-item label="Confirm New Password">
            <a-input-password
              v-model:value="passwordForm.confirmPassword"
            />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" :loading="loading" @click="handleChangePassword">
              Change Password
            </a-button>
          </a-form-item>
        </a-form>
      </template>
    </a-card>
  </a-layout-content>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const loading = ref(false);
const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleUpdate = async () => {
  loading.value = true;
  try {
    // TODO: 调用 API 更新用户资料
    console.log('Update profile:', profileForm.value);
  } catch (error) {
    console.error('Failed to update profile:', error);
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  loading.value = true;
  try {
    // TODO: 调用 API 修改密码
    console.log('Change password:', passwordForm.value);
    alert('Password changed successfully');
  } catch (error) {
    console.error('Failed to change password:', error);
  } finally {
    loading.value = false;
  }
};
</script>
