<template>
  <a-card title="Welcome to MyVideo">
    <p>
      This is a Vue 3 + TypeScript application with Hugging Face API
      integration.
    </p>
    <a-space>
      <a-button @click="$router.push('/user-center')">User Center</a-button>
    </a-space>
  </a-card>
</template>

<script setup lang="ts"></script>
