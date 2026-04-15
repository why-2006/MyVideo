<template>
  <a-card title="多模态协作任务">
    <a-alert
      message="对话模式：保留会话历史，支持文本 + 图片/音频资料联合推理。"
      type="info"
      show-icon
      style="margin-bottom: 16px"
    />

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
            <li v-for="asset in item.attachments" :key="asset">{{ asset }}</li>
          </ul>
          <div v-if="item.meta" class="chat-meta">
            耗时 {{ item.meta.durationMs }} ms，成功
            {{ item.meta.successCount }}，失败
            {{ item.meta.failureCount }}
          </div>
        </div>
      </div>
    </div>

    <a-form layout="vertical" class="chat-form">
      <a-form-item label="输入内容">
        <a-textarea
          v-model:value="textInput"
          :rows="4"
          placeholder="请输入任务描述。Enter 发送，Shift+Enter 换行"
          @keydown="handleInputKeydown"
        />
      </a-form-item>

      <a-form-item label="资料提交（可选：图片/音频）">
        <a-upload
          v-model:file-list="assetFileList"
          :before-upload="beforeAssetUpload"
          :max-count="2"
          :multiple="true"
          accept="image/*,audio/*"
        >
          <a-button>
            <template #icon><UploadOutlined /></template>
            资料提交
          </a-button>
        </a-upload>
      </a-form-item>

      <a-space>
        <a-button
          type="primary"
          :loading="hfStore.taskLoading"
          @click="runTask"
        >
          推理
        </a-button>
        <a-button @click="clearAll">清空会话</a-button>
      </a-space>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { UploadOutlined } from "@ant-design/icons-vue";
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

const MAX_IMAGE_SIZE_MB = 10;
const MAX_AUDIO_SIZE_MB = 20;

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

watch(
  () => chatHistory.value.length,
  () => {
    void scrollChatToBottom();
  },
);

onMounted(() => {
  void scrollChatToBottom();
});
</script>

<style scoped>
.chat-body {
  height: 420px;
  padding: 16px;
  margin-bottom: 16px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: linear-gradient(180deg, #fcfcfc 0%, #f7fafc 100%);
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
  background: #fff;
  border: 1px solid #e8e8e8;
}

.chat-row.user .chat-bubble {
  background: #e6f4ff;
  border-color: #b7ddff;
}

.chat-row.error .chat-bubble {
  background: #fff1f0;
  border-color: #ffccc7;
}

.chat-role {
  margin-bottom: 4px;
  font-size: 12px;
  color: #8c8c8c;
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
  color: #595959;
}

.chat-form {
  margin-top: 8px;
}
</style>
