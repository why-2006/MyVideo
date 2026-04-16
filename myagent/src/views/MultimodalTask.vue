<template>
  <a-card
    title="多模态协作任务"
    :class="['multimodal-card', { dark: isDarkMode }]"
  >
    <div class="chat-shell">
      <div ref="chatBodyRef" class="chat-body">
        <div v-if="chatHistory.length === 0" class="chat-empty">
          <a-empty description="暂无对话，输入内容后开始推理" />
        </div>

        <div
          v-for="item in chatHistory"
          :key="item.id"
          class="chat-row"
          :class="item.role"
        >
          <div class="chat-bubble">
            <div class="chat-role">{{ item.roleLabel }}</div>
            <div class="chat-text">{{ item.text }}</div>
            <ul v-if="item.attachments.length > 0" class="chat-attachments">
              <li v-for="asset in item.attachments" :key="asset">
                {{ asset }}
              </li>
            </ul>
            <div v-if="item.meta" class="chat-meta">
              耗时 {{ item.meta.durationMs }} ms，成功
              {{ item.meta.successCount }}，失败
              {{ item.meta.failureCount }}
            </div>
          </div>
        </div>
      </div>

      <div class="composer-wrap">
        <div class="composer-main">
          <div class="composer-actions-top-right">
            <a-tooltip title="清空会话">
              <a-button
                type="text"
                shape="circle"
                class="icon-btn"
                @click="clearAll"
              >
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>

            <a-upload
              v-model:file-list="assetFileList"
              :before-upload="beforeAssetUpload"
              :max-count="2"
              :multiple="true"
              :show-upload-list="false"
              accept="image/*,audio/*"
            >
              <a-tooltip title="资料提交（图片/音频）">
                <a-button type="text" shape="circle" class="icon-btn">
                  <template #icon><UploadOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-upload>
          </div>

          <a-textarea
            v-model:value="textInput"
            :auto-size="{ minRows: 5, maxRows: 5 }"
            class="composer-input"
            placeholder="请输入任务描述。Enter 发送，Shift+Enter 换行"
            @keydown="handleInputKeydown"
          />

          <a-tooltip title="推理">
            <a-button
              type="primary"
              shape="circle"
              class="icon-btn icon-send"
              :loading="hfStore.taskLoading"
              @click="runTask"
            >
              <template #icon><SendOutlined /></template>
            </a-button>
          </a-tooltip>
        </div>

        <div v-if="assetFileList.length > 0" class="asset-tags">
          <a-tag
            v-for="file in assetFileList"
            :key="file.uid"
            color="blue"
            closable
            @close="removeAsset(file.uid, $event)"
          >
            {{ file.name }}
          </a-tag>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  DeleteOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import type { UploadFile } from "ant-design-vue";
import { message } from "ant-design-vue";
import { useHfStore } from "@/stores/hf";

interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "error";
  roleLabel: string;
  text: string;
  attachments: string[];
  meta?: {
    durationMs: number;
    successCount: number;
    failureCount: number;
  };
}

const hfStore = useHfStore();
const textInput = ref("");
const assetFileList = ref<UploadFile[]>([]);
const chatBodyRef = ref<HTMLElement | null>(null);
const chatHistory = ref<ChatMessage[]>([]);
const isDarkMode = ref(false);

const MAX_IMAGE_SIZE_MB = 10;
const MAX_AUDIO_SIZE_MB = 20;
const THEME_KEY = "myagent-multimodal-theme";

const scrollChatToBottom = async () => {
  await nextTick();
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
};

const getUploadFile = (upload: UploadFile): File | undefined => {
  const fileObj = upload.originFileObj;
  return fileObj instanceof File ? fileObj : undefined;
};

const isImageUpload = (file: UploadFile): boolean =>
  !!file.type?.startsWith("image/");

const isAudioUpload = (file: UploadFile): boolean =>
  !!file.type?.startsWith("audio/");

const buildAttachmentLabels = (
  hasText: boolean,
  files: UploadFile[],
): string[] => {
  const labels: string[] = [];
  if (hasText) {
    labels.push("文本");
  }

  for (const file of files) {
    if (isImageUpload(file)) {
      labels.push(`图片: ${file.name}`);
    } else if (isAudioUpload(file)) {
      labels.push(`音频: ${file.name}`);
    }
  }

  return labels;
};

const appendChat = (item: Omit<ChatMessage, "id">) => {
  chatHistory.value.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    ...item,
  });
};

const beforeAssetUpload = (file: UploadFile) => {
  const isImage = isImageUpload(file);
  const isAudio = isAudioUpload(file);

  if (!isImage && !isAudio) {
    message.error("仅支持图片或音频文件");
    return false;
  }

  const maxSizeBytes =
    (isImage ? MAX_IMAGE_SIZE_MB : MAX_AUDIO_SIZE_MB) * 1024 * 1024;
  const fileSize = file.size ?? 0;
  if (fileSize > maxSizeBytes) {
    message.error(
      isImage
        ? `图片大小不能超过 ${MAX_IMAGE_SIZE_MB}MB`
        : `音频大小不能超过 ${MAX_AUDIO_SIZE_MB}MB`,
    );
    return false;
  }

  const normalized = assetFileList.value.filter((item) => {
    if (isImage && isImageUpload(item)) {
      return false;
    }

    if (isAudio && isAudioUpload(item)) {
      return false;
    }

    return item.uid !== file.uid;
  });

  assetFileList.value = [...normalized, file].slice(0, 2);
  return false;
};

const runTask = async () => {
  const hasText = !!textInput.value.trim();
  const imageUpload = assetFileList.value.find((file) => isImageUpload(file));
  const audioUpload = assetFileList.value.find((file) => isAudioUpload(file));
  const imageFile = imageUpload ? getUploadFile(imageUpload) : undefined;
  const audioFile = audioUpload ? getUploadFile(audioUpload) : undefined;

  if (!hasText && !imageFile && !audioFile) {
    message.warning("请至少输入文本或提交一份资料");
    return;
  }

  appendChat({
    role: "user",
    roleLabel: "我",
    text: hasText ? textInput.value.trim() : "（仅提交资料）",
    attachments: buildAttachmentLabels(hasText, assetFileList.value),
  });
  await scrollChatToBottom();

  await hfStore.runMultimodalTask({
    text: hasText ? textInput.value : undefined,
    imageFile,
    audioFile,
  });

  if (hfStore.taskResult) {
    appendChat({
      role: "assistant",
      roleLabel: "助手",
      text: hfStore.taskResult.finalSummary,
      attachments: hfStore.taskResult.modalityResults.map(
        (result) =>
          `${result.modality} | ${result.modelId} | ${result.success ? "成功" : `失败: ${result.error || "未知错误"}`}`,
      ),
      meta: hfStore.taskResult.meta,
    });
    hfStore.clearTaskResult();
  } else if (hfStore.taskError) {
    appendChat({
      role: "error",
      roleLabel: "系统",
      text: `任务执行失败：${hfStore.taskError}`,
      attachments: [],
    });
    hfStore.clearTaskResult();
  }

  textInput.value = "";
  await scrollChatToBottom();
};

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!hfStore.taskLoading) {
      void runTask();
    }
  }
};

const clearAll = () => {
  textInput.value = "";
  assetFileList.value = [];
  chatHistory.value = [];
  hfStore.clearTaskResult();
};

const removeAsset = (uid: string, event?: Event) => {
  event?.preventDefault();
  assetFileList.value = assetFileList.value.filter((file) => file.uid !== uid);
};

const syncThemeFromStorage = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    isDarkMode.value = true;
  } else if (savedTheme === "light") {
    isDarkMode.value = false;
  } else {
    isDarkMode.value = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
  }
};

watch(
  () => chatHistory.value.length,
  () => {
    void scrollChatToBottom();
  },
);

onMounted(() => {
  syncThemeFromStorage();
  window.addEventListener("storage", syncThemeFromStorage);
  window.addEventListener("myagent-theme-changed", syncThemeFromStorage);
  void scrollChatToBottom();
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", syncThemeFromStorage);
  window.removeEventListener("myagent-theme-changed", syncThemeFromStorage);
});
</script>

<style scoped>
.multimodal-card {
  --shell-bg: linear-gradient(160deg, #f9fcff 0%, #f3f7fb 100%);
  --page-bg: #f3f7fb;
  --shell-border: #e6edf5;
  --bubble-bg: #ffffff;
  --bubble-border: #e8e8e8;
  --user-bubble-bg: #e7f2ff;
  --user-bubble-border: #bfdfff;
  --error-bubble-bg: #fff1f0;
  --error-bubble-border: #ffccc7;
  --text-main: #262626;
  --text-sub: #7a7a7a;
  --input-bg: rgba(255, 255, 255, 0.48);
  --input-border: rgba(255, 255, 255, 0.55);
  --input-shadow: 0 12px 30px rgba(20, 30, 70, 0.2);

  min-height: 0;
  flex: 1;
  box-sizing: border-box;
  padding: 0;
  border-radius: 12px;
  background: transparent;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: none;
  box-shadow: none;
}

.multimodal-card.dark {
  --shell-bg: radial-gradient(
    circle at 25% 20%,
    #2f3b52 0%,
    #1d2433 52%,
    #141a27 100%
  );
  --page-bg: #141a27;
  --shell-border: #3b465d;
  --bubble-bg: rgba(35, 44, 61, 0.92);
  --bubble-border: #45516a;
  --user-bubble-bg: rgba(28, 64, 100, 0.9);
  --user-bubble-border: #3b6b9f;
  --error-bubble-bg: rgba(91, 45, 50, 0.9);
  --error-bubble-border: #9f5c63;
  --text-main: #e9eef8;
  --text-sub: #b7c0d1;
  --input-bg: rgba(22, 28, 41, 0.55);
  --input-border: rgba(146, 165, 197, 0.26);
  --input-shadow: 0 14px 36px rgba(3, 8, 20, 0.5);
}

.multimodal-card :deep(.ant-card) {
  border: none;
  background: transparent;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0%;
  box-shadow: none;
}

.multimodal-card :deep(.ant-card-head) {
  border-bottom: none;
  background: transparent;
  padding: 0;
}

.multimodal-card :deep(.ant-card-head-title) {
  color: var(--text-main);
}

.multimodal-card :deep(.ant-card-extra) {
  padding: 0;
}

.multimodal-card :deep(.ant-card-body) {
  display: contents;
}

.chat-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  min-height: 0;
  padding: 14px;
  border: 0px solid var(--shell-border);
  border-radius: 14px;
  background: transparent;
  overflow: hidden;
}

.chat-body {
  flex: 1;
  min-height: 240px;
  padding: 4px;
  overflow-y: auto;
}

.chat-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.chat-row {
  display: flex;
  margin-bottom: 12px;
}

.chat-row.user {
  justify-content: flex-end;
}

.chat-row.assistant,
.chat-row.error {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-main);
  background: var(--bubble-bg);
  border: 1px solid var(--bubble-border);
}

.chat-row.user .chat-bubble {
  background: var(--user-bubble-bg);
  border-color: var(--user-bubble-border);
}

.chat-row.error .chat-bubble {
  background: var(--error-bubble-bg);
  border-color: var(--error-bubble-border);
}

.chat-role {
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--text-sub);
}

.chat-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.chat-attachments {
  margin: 8px 0 0;
  padding-left: 18px;
}

.chat-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-sub);
}

.composer-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 34px;
}

.composer-main {
  position: relative;
  padding-top: 0;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.02),
    0 2px 4px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
}

.composer-input {
  border-radius: 16px;
  display: block;
}

.composer-input :deep(.ant-input-textarea) {
  resize: none !important;
}

.composer-input :deep(.ant-input) {
  padding: 44px 56px 44px 18px;
  color: var(--text-main);
  border-radius: 16px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  box-shadow: var(--input-shadow);
  resize: none !important;
}

.composer-input :deep(textarea.ant-input) {
  resize: none !important;
}

.composer-input :deep(.ant-input-textarea textarea) {
  resize: none !important;
  min-height: 138px !important;
  max-height: 138px !important;
}

.composer-input :deep(textarea.ant-input::-webkit-resizer) {
  display: none;
}

.composer-input :deep(.ant-input::placeholder) {
  color: var(--text-sub);
}

.icon-btn {
  position: relative;
  z-index: 3;
}

.icon-send {
  position: absolute;
  right: 10px;
  bottom: 14px;
}

.composer-actions-top-right {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
}

.composer-actions-top-right :deep(.ant-upload) {
  display: flex;
}

.asset-tags {
  position: absolute;
  right: 8px;
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 78%;
}

.hint-row {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-sub);
}
</style>
