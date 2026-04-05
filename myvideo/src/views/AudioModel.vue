<template>
  <!-- <a-layout-content style="padding: 24px; background: #f0f2f5"> -->
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
                      <p>音频推理结果: {{ formatAudioResult(item) }}</p>
                      <!-- 音频播放器 -->
                      <audio
                        v-if="extractAudioDataUrl(item)"
                        :src="extractAudioDataUrl(item)"
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
  <!-- </a-layout-content> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHfStore } from "@/stores/hf";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons-vue";
import type { UploadFile } from "ant-design-vue";
import { message } from "ant-design-vue";
const hfStore = useHfStore();
const fileList = ref<UploadFile[]>([]);
const MAX_AUDIO_SIZE_MB = 20;

const getRawAudioResult = (item: unknown): string | undefined => {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    const generatedAudio = (item as any).generated_audio;
    if (typeof generatedAudio === "string") {
      return generatedAudio;
    }
  }

  return undefined;
};

const formatAudioResult = (item: unknown): string => {
  const raw = getRawAudioResult(item);

  if (!raw) {
    return typeof item === "object" ? JSON.stringify(item) : String(item);
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed && typeof parsed === "object") {
      const text =
        (parsed as any).text ||
        (parsed as any).transcript ||
        (parsed as any).generated_text;

      if (typeof text === "string") {
        return text;
      }

      return JSON.stringify(parsed);
    }
  } catch {
    // raw is plain text, no JSON parsing needed
  }

  return raw;
};

const extractAudioDataUrl = (item: unknown): string | null => {
  const raw = getRawAudioResult(item);
  if (!raw) {
    return null;
  }

  return raw.startsWith("data:audio") ? raw : null;
};

const fetchModels = async () => {
  await hfStore.fetchAudioModels();
};

const selectModel = (model: any) => {
  hfStore.selectModel(model);
};

const beforeUpload = (file: UploadFile) => {
  if (!file.type?.startsWith("audio/")) {
    message.error("仅支持音频文件");
    return false;
  }

  const maxSizeBytes = MAX_AUDIO_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    message.error(`音频大小不能超过 ${MAX_AUDIO_SIZE_MB}MB`);
    return false;
  }

  fileList.value = [file];
  return false; // Prevent auto upload
};

const runInference = async () => {
  if (!hfStore.selectedModel || fileList.value.length === 0) {
    message.warning("请先选择音频文件");
    return;
  }

  try {
    const uploadFile = fileList.value[0];
    const file = uploadFile.originFileObj as File;
    if (!file) {
      message.error("无法获取文件，请重新选择");
      return;
    }
    await hfStore.runInference(hfStore.selectedModel.id, file, "audio");
  } catch (error) {
    console.error("Failed to process audio file:", error);
    message.error("音频处理失败，请重试");
  }
};

onMounted(() => {
  fetchModels();
});
</script>
