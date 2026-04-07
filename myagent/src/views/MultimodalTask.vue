<template>
  <a-card title="多模态协作任务">
    <a-alert
      message="支持文本、图片、音频任意组合输入，系统会先分模态处理，再由文本模型统一总结。"
      type="info"
      show-icon
      style="margin-bottom: 16px"
    />

    <a-form layout="vertical">
      <a-form-item label="文本输入（可选）">
        <a-textarea
          v-model:value="textInput"
          :rows="5"
          placeholder="请输入需要分析或补充说明的文本"
        />
      </a-form-item>

      <a-form-item label="图片输入（可选）">
        <a-upload
          v-model:file-list="imageFileList"
          :before-upload="beforeImageUpload"
          :max-count="1"
          accept="image/*"
        >
          <a-button>
            <template #icon><UploadOutlined /></template>
            选择图片文件
          </a-button>
        </a-upload>
      </a-form-item>

      <a-form-item label="音频输入（可选）">
        <a-upload
          v-model:file-list="audioFileList"
          :before-upload="beforeAudioUpload"
          :max-count="1"
          accept="audio/*"
        >
          <a-button>
            <template #icon><UploadOutlined /></template>
            选择音频文件
          </a-button>
        </a-upload>
      </a-form-item>

      <a-space>
        <a-button
          type="primary"
          :loading="hfStore.taskLoading"
          @click="runTask"
        >
          运行多模态任务
        </a-button>
        <a-button @click="clearAll">清空输入与结果</a-button>
      </a-space>
    </a-form>

    <a-divider />

    <a-result
      v-if="hfStore.taskError"
      status="error"
      title="任务执行失败"
      :sub-title="hfStore.taskError"
    />

    <template v-else-if="hfStore.taskResult">
      <a-card title="最终总结" size="small" style="margin-bottom: 16px">
        <pre class="summary-text">{{ hfStore.taskResult.finalSummary }}</pre>
      </a-card>

      <a-descriptions bordered :column="3" style="margin-bottom: 16px">
        <a-descriptions-item label="耗时">
          {{ hfStore.taskResult.meta.durationMs }} ms
        </a-descriptions-item>
        <a-descriptions-item label="成功模态">
          {{ hfStore.taskResult.meta.successCount }}
        </a-descriptions-item>
        <a-descriptions-item label="失败模态">
          {{ hfStore.taskResult.meta.failureCount }}
        </a-descriptions-item>
      </a-descriptions>

      <a-list
        :data-source="hfStore.taskResult.modalityResults"
        bordered
        size="small"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="modality-result">
              <strong>{{ item.modality }} | {{ item.modelId }}</strong>
              <p v-if="item.success">{{ formatOutput(item.output) }}</p>
              <p v-else class="error-text">失败：{{ item.error }}</p>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </template>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import type { UploadFile } from "ant-design-vue";
import { message } from "ant-design-vue";
import { useHfStore } from "@/stores/hf";

const hfStore = useHfStore();
const textInput = ref("");
const imageFileList = ref<UploadFile[]>([]);
const audioFileList = ref<UploadFile[]>([]);

const MAX_IMAGE_SIZE_MB = 10;
const MAX_AUDIO_SIZE_MB = 20;

const beforeImageUpload = (file: UploadFile) => {
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

  imageFileList.value = [file];
  return false;
};

const beforeAudioUpload = (file: UploadFile) => {
  if (!file.type?.startsWith("audio/")) {
    message.error("仅支持音频文件");
    return false;
  }

  const maxSizeBytes = MAX_AUDIO_SIZE_MB * 1024 * 1024;
  const fileSize = file.size ?? 0;
  if (fileSize > maxSizeBytes) {
    message.error(`音频大小不能超过 ${MAX_AUDIO_SIZE_MB}MB`);
    return false;
  }

  audioFileList.value = [file];
  return false;
};

const runTask = async () => {
  const hasText = !!textInput.value.trim();
  const imageFile = imageFileList.value[0]?.originFileObj as File | undefined;
  const audioFile = audioFileList.value[0]?.originFileObj as File | undefined;

  if (!hasText && !imageFile && !audioFile) {
    message.warning("请至少输入一种模态内容");
    return;
  }

  await hfStore.runMultimodalTask({
    text: hasText ? textInput.value : undefined,
    imageFile,
    audioFile,
  });
};

const clearAll = () => {
  textInput.value = "";
  imageFileList.value = [];
  audioFileList.value = [];
  hfStore.clearTaskResult();
};

const formatOutput = (output: unknown): string => {
  if (typeof output === "string") {
    return output;
  }

  if (output && typeof output === "object") {
    return JSON.stringify(output);
  }

  return String(output);
};
</script>

<style scoped>
.summary-text {
  white-space: pre-wrap;
  margin: 0;
}

.modality-result {
  width: 100%;
}

.error-text {
  color: #ff4d4f;
}
</style>
