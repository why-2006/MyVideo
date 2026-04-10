<template>
  <!-- <a-layout-content style="padding: 24px; background: #f0f2f5"> -->
  <a-card title="图片输入模型">
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
              <a-form-item label="输入图片">
                <a-upload
                  v-model:file-list="fileList"
                  :before-upload="beforeUpload"
                  :max-count="1"
                  accept="image/*"
                  list-type="picture-card"
                >
                  <div v-if="fileList.length === 0">
                    <PlusOutlined />
                    <div style="margin-top: 8px">选择图片</div>
                  </div>
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
                      <template v-if="parseImageResult(item).length > 0">
                        <p style="font-weight: 600; margin-bottom: 8px">
                          图片分类结果
                        </p>
                        <ul style="margin: 0; padding-left: 18px">
                          <li
                            v-for="result in parseImageResult(item)"
                            :key="result.label"
                            style="margin-bottom: 4px"
                          >
                            {{ result.label }}:
                            {{ (result.score * 100).toFixed(2) }}%
                          </li>
                        </ul>
                      </template>
                      <p v-else>图片推理结果: {{ stringifyResult(item) }}</p>
                      <!-- 图片显示 -->
                      <img
                        v-if="
                          typeof item === 'string' &&
                          item.startsWith('data:image')
                        "
                        :src="item"
                        alt="推理结果"
                        style="
                          max-width: 100%;
                          margin-top: 8px;
                          border-radius: 4px;
                        "
                      />
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
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons-vue";
import type { UploadFile } from "ant-design-vue";
import { message } from "ant-design-vue";
import { fileUtils } from "@/services/api";

interface ImageClassResult {
  label: string;
  score: number;
}

const hfStore = useHfStore();
const fileList = ref<UploadFile[]>([]);
const MAX_IMAGE_SIZE_MB = 10;
//处理模型返回的结果，确保兼容不同格式的输出，并提取图片类型和分数
const parseImageResult = (item: unknown): ImageClassResult[] => {
  const raw =
    typeof item === "string"
      ? item
      : typeof item === "object" && item !== null
        ? (item as any).generated_image
        : undefined;
  //结果应该是一个数组，包含多个分类标签和对应的置信度分数
  if (typeof raw !== "string") {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (entry) =>
          entry &&
          typeof entry.label === "string" &&
          typeof entry.score === "number",
      )
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
};

const stringifyResult = (item: unknown): string => {
  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "object" && item !== null) {
    return JSON.stringify(item);
  }

  return String(item);
};

const fetchModels = async () => {
  await hfStore.fetchImageModels();
};

const selectModel = (model: any) => {
  hfStore.selectModel(model);
};

const beforeUpload = (file: UploadFile) => {
  if (!file.type?.startsWith("image/")) {
    message.error("仅支持图片文件");
    return false;
  }

  const maxSizeBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const fileSize = file.size ?? 0;
  if (fileSize > maxSizeBytes) {
    message.error(`图片大小不能超过 ${MAX_IMAGE_SIZE_MB}MB`);
    return false;
  }

  fileList.value = [file];
  return false; // Prevent auto upload
};

const runInference = async () => {
  if (!hfStore.selectedModel || fileList.value.length === 0) {
    message.warning("请先选择图片文件");
    return;
  }

  try {
    const uploadFile = fileList.value[0];
    const file = uploadFile.originFileObj as File;
    if (!file) {
      message.error("无法获取文件，请重新选择");
      return;
    }

    const compressedFile = await fileUtils.compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.82,
      maxFileSizeMB: 1,
    });

    if (compressedFile.size < file.size) {
      message.success(
        `图片已压缩：${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    await hfStore.runInference(
      hfStore.selectedModel.id,
      compressedFile,
      "image",
    );
  } catch (error) {
    console.error("Failed to process image file:", error);
    message.error("图片处理失败，请重试");
  }
};

onMounted(() => {
  fetchModels();
});
</script>
