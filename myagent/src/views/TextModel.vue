<template>
  <!-- <a-layout-content style="padding: 24px; background: #f0f2f5"> -->
  <a-card title="文本输入模型">
    //#extra
    插槽用于在卡片标题旁边添加额外的内容，这里我们放置了一个刷新按钮，点击后会调用
    fetchModels 方法来刷新模型列表。
    <template #extra>
      <a-button type="primary" @click="fetchModels">
        <template #icon><ReloadOutlined /></template>
        刷新模型
      </a-button>
    </template>

    <a-row :gutter="16">
      <a-col :span="6">
        <a-card title="模型列表" style="height: 100%">
          //将models数组作为数据源传递给a-list组件，并且根据hfStore.loading状态显示加载效果。
          <a-list
            :data-source="hfStore.models"
            :loading="hfStore.loading"
            style="height: 400px; overflow-y: auto"
          >
            //#renderItem
            插槽用于自定义列表项的渲染方式，这里我们为每个模型项创建了一个可点击的列表项，当点击时会调用
            selectModel 方法来选择该模型，并且根据是否被选中改变背景颜色。
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
              <a-form-item label="输入文本">
                <a-textarea
                  v-model:value="inferenceInput"
                  :rows="4"
                  placeholder="输入文本进行推理..."
                />
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
              //将推理结果数组作为数据源传递给a-list组件，并且为每个结果项创建一个列表项，显示生成的文本内容。
              <a-list
                :data-source="hfStore.inferenceResults"
                bordered
                size="small"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <p>{{ (item as any).generated_text }}</p>
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
import { ReloadOutlined } from "@ant-design/icons-vue";

const hfStore = useHfStore();
const inferenceInput = ref("");

const fetchModels = async () => {
  await hfStore.fetchTextModels();
};

const selectModel = (model: any) => {
  hfStore.selectModel(model);
};

const runInference = async () => {
  if (!hfStore.selectedModel) return;

  const inputs = inferenceInput.value;
  await hfStore.runInference(hfStore.selectedModel.id, inputs, "text");
};

onMounted(() => {
  fetchModels();
});
</script>
