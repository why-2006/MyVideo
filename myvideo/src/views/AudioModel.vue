<template>
  <a-layout-content style="padding: 24px; background: #f0f2f5">
    <a-card title="音频输入模型">
      <template #extra>
        <a-button type="primary" @click="fetchModels">
          <template #icon><ReloadOutlined /></template>
          刷新模型
        </a-button>
      </template>

      <a-row :gutter="16">
        <a-col :span="6">
          <a-card title="模型列表" style="height: 100%">
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
            :title="hfStore.selectedModel?.id || '选择模型'"
            style="height: 100%"
          >
            <template v-if="hfStore.selectedModel">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="Pipeline">
                  {{ hfStore.selectedModel.pipeline_tag }}
                </a-descriptions-item>
                <a-descriptions-item label="下载次数">
                  {{ hfStore.selectedModel.downloads }}
                </a-descriptions-item>
                <a-descriptions-item label="点赞数">
                  {{ hfStore.selectedModel.likes }}
                </a-descriptions-item>
                <a-descriptions-item label="模型类型">
                  {{ hfStore.selectedModel.model_type }}
                </a-descriptions-item>
              </a-descriptions>

              <a-divider />

              <h3>推理</h3>
              <a-form layout="vertical">
                <a-form-item label="输入音频">
                  <a-upload
                    v-model:file-list="fileList"
                    :before-upload="beforeUpload"
                    :max-count="1"
                    accept="audio/*"
                  >
                    <a-button>
                      <template #icon><UploadOutlined /></template>
                      选择音频文件
                    </a-button>
                  </a-upload>
                </a-form-item>

                <a-form-item>
                  <a-button
                    type="primary"
                    block
                    :loading="hfStore.inferenceLoading"
                    @click="runInference"
                  >
                    运行推理
                  </a-button>
                </a-form-item>
              </a-form>

              <a-divider />

              <h3>结果</h3>
              <a-result
                v-if="hfStore.inferenceError"
                status="error"
                title="推理失败"
                :sub-title="hfStore.inferenceError"
              >
                <a-button type="primary" @click="runInference">重试</a-button>
              </a-result>

              <div v-else-if="hfStore.inferenceResults.length > 0">
                <a-list
                  :data-source="hfStore.inferenceResults"
                  bordered
                  size="small"
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <div>
                        <p>音频推理结果: {{ item }}</p>
                        <!-- 音频播放器 -->
                        <audio
                          v-if="
                            typeof item === 'string' &&
                            item.startsWith('data:audio')
                          "
                          :src="item"
                          controls
                          style="width: 100%; margin-top: 8px"
                        >
                          您的浏览器不支持音频播放。
                        </audio>
                      </div>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
            </template>
            <a-empty v-else description="从左侧选择模型" />
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </a-layout-content>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHfStore } from "@/stores/hf";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons-vue";
import type { UploadFile } from "ant-design-vue";
import { fileUtils } from "@/services/api";
const hfStore = useHfStore();
const fileList = ref<UploadFile[]>([]);

const fetchModels = async () => {
  await hfStore.fetchAudioModels();
};

const selectModel = (model: any) => {
  hfStore.selectModel(model);
};

const beforeUpload = (file: UploadFile) => {
  fileList.value = [file];
  return false; // Prevent auto upload
};

const runInference = async () => {
  if (!hfStore.selectedModel || fileList.value.length === 0) return;

  try {
    const uploadFile = fileList.value[0];
    const file = uploadFile.originFileObj as File;
    if (!file) {
      alert("无法获取文件，请重新选择");
      return;
    }
    const base64Data = await fileUtils.fileToBase64(file);
    const inputs = base64Data;
    await hfStore.runInference(hfStore.selectedModel.id, inputs, "audio");
  } catch (error) {
    console.error("Failed to process audio file:", error);
    alert("Failed to process audio file. Please try again.");
  }
};

onMounted(() => {
  fetchModels();
});
</script>
