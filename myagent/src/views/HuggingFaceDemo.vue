<template>
  <a-layout-content style="padding: 24px; background: #f0f2f5">
    <a-card title="Hugging Face API Demo">
      <template #extra>
        <a-button type="primary" @click="fetchModels">
          <template #icon><ReloadOutlined /></template>
          Refresh Models
        </a-button>
      </template>

      <a-row :gutter="16">
        <a-col :span="6">
          <a-card title="Models" style="height: 100%">
            <a-list
              :data-source="hfStore.models"
              :loading="hfStore.loading"
              style="height: 400px; overflow-y: auto"
            >
              <template #renderItem="{ item }">
                <a-list-item
                  :style="{
                    cursor: 'pointer',
                    background:
                      hfStore.selectedModel?.id === item.id
                        ? '#e6f7ff'
                        : 'transparent',
                  }"
                  @click="selectModel(item)"
                >
                  <a-list-item-meta
                    :title="item.id"
                    :description="item.pipeline_tag"
                  />
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>

        <a-col :span="18">
          <a-card
            :title="selectedModel?.id || 'Select a Model'"
            style="height: 100%"
          >
            <template v-if="selectedModel">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="Pipeline">
                  {{ selectedModel.pipeline_tag }}
                </a-descriptions-item>
                <a-descriptions-item label="Downloads">
                  {{ selectedModel.downloads }}
                </a-descriptions-item>
                <a-descriptions-item label="Likes">
                  {{ selectedModel.likes }}
                </a-descriptions-item>
                <a-descriptions-item label="Model Type">
                  {{ selectedModel.model_type }}
                </a-descriptions-item>
              </a-descriptions>

              <a-divider />

              <h3>Inference</h3>
              <a-radio-group
                v-model:value="inferenceType"
                button-style="solid"
                style="margin-bottom: 16px"
              >
                <a-radio-button value="text">Text</a-radio-button>
                <a-radio-button value="image">Image</a-radio-button>
                <a-radio-button value="audio">Audio</a-radio-button>
              </a-radio-group>

              <a-form layout="vertical">
                <a-form-item v-if="inferenceType === 'text'" label="Input">
                  <a-textarea
                    v-model:value="inferenceInput"
                    :rows="4"
                    placeholder="Enter text for inference..."
                  />
                </a-form-item>

                <a-form-item>
                  <a-button
                    type="primary"
                    block
                    :loading="hfStore.inferenceLoading"
                    @click="runInference"
                  >
                    Run Inference
                  </a-button>
                </a-form-item>
              </a-form>

              <a-divider />

              <h3>Results</h3>
              <a-result
                v-if="hfStore.inferenceError"
                status="error"
                title="Inference Failed"
                :sub-title="hfStore.inferenceError"
              >
                <a-button type="primary" @click="runInference">Retry</a-button>
              </a-result>

              <div v-else-if="hfStore.inferenceResults.length > 0">
                <a-list
                  :data-source="hfStore.inferenceResults"
                  bordered
                  size="small"
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <p v-if="inferenceType === 'text'">
                        {{ (item as any).generated_text }}
                      </p>
                      <p v-else>Result type: {{ inferenceType }}</p>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
            </template>
            <a-empty v-else description="Select a model from the left" />
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </a-layout-content>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHfStore } from "@/stores/hf";
import { ReloadOutlined } from "@ant-design/icons-vue";

const hfStore = useHfStore();
const selectedModel = ref(hfStore.selectedModel);
const inferenceType = ref<"text" | "image" | "audio">("text");
const inferenceInput = ref("");

const fetchModels = async () => {
  await hfStore.fetchModels();
};

const selectModel = (model: any) => {
  hfStore.selectModel(model);
};

const runInference = async () => {
  if (!hfStore.selectedModel) return;

  const inputs = inferenceInput.value;
  await hfStore.runInference(
    hfStore.selectedModel.id,
    inputs,
    inferenceType.value,
  );
};

onMounted(() => {
  fetchModels();
});
</script>
