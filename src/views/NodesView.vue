<template>
  <div class="nodes-view">

    <el-row :gutter="30" class="layout-row">
      <!-- Левая половина: Панель управления -->
      <el-col :xs="24" :md="12" class="layout-col">
        <el-card shadow="always" class="tree-card">
          <!-- :body-style="{ padding: '0px' }" -->
          <!-- {{ store.data }} || {{ edgesStore.data }} -->
          <el-tree-v2
            ref="treeRef"
            :height="600"
            :data="treeData"
            :props="{ children: 'child', label: 'nm', value: 'uid' }"
            :default-expand-all="true"
            :default-expand-level="1"
            :expand-on-click-node="false"
            :default-expand-icon="false"
            :default-collapse-icon="false"
            @node-click="selectNode"
            @node-drop="handleNodeDrop"
            :highlight-current="true"
          >
            <template #default="{ node, data }">
              <span
                class="tree-node-draggable"
                draggable="true"
                @dragstart.stop="handleDragStart(data, $event)"
                @dragend="handleDragEnd"
              >{{ data.nm }}</span>
            </template>
          </el-tree-v2>
        </el-card>
      </el-col>

      <!-- Правая половина: Список узлов -->
      <el-col :xs="24" :md="12" class="layout-col">
        <el-card shadow="always">
          <!-- :body-style="{ padding: '0' }" -->
          <div>

          </div>
          <div class="actions-container">
            <el-button type="primary" class="custom-btn add-btn" @click="addDemoNode">
              + Добавить демо-узел
            </el-button>
            <el-input v-model="autoGenParams.length" placeholder="размер ветки" style="width: 200px; margin: 0 10px;"  />
            <el-input v-model="autoGenParams.levels" placeholder="количество уровней" style="width: 200px; margin: 0 10px;"  />
            <el-button type="primary" class="custom-btn add-btn" @click="autoGen">
              + автогенерация узлов
            </el-button>
            <el-button class="custom-btn" :disabled="!treeData.length" @click="collapseAllNodes">
              Свернуть все
            </el-button>
            <el-button class="custom-btn" :disabled="!treeData.length" @click="expandAllNodes">
              Раскрыть все
            </el-button>

            <el-button type="danger" class="custom-btn clear-btn"  @click="clearAllNodes">
              - Удалить все узлы
            </el-button>
            <el-button type="danger" class="custom-btn clear-btn"  @click="clearAllEdges">
              - Удалить все связи
            </el-button>
          </div>
          current node: uid:{{ currentNode?.uid }} id:{{ currentNode?.id }} nm:{{ currentNode?.nm }} path:{{ currentNode?.path }}<br>
          current card: {{ currentCard }}
        </el-card>
        <p> &nbsp; </p>
        <el-card @click="selectCard('parent')" shadow="hover" :class="{ 'selected': currentCard === 'parent' }"
          class="parent-card">
          <h3>Parent Node</h3>
          <p>{{ parentNode?.id }} {{ parentNode?.nm }}</p>
        </el-card>
        <el-button type="primary" style="margin: 2px auto; display: block;" @click="link" :icon="Sort" v-if="!isExists">Link</el-button>
        <el-button type="danger" style="margin: 2px auto; display: block;" @click="unLink" :icon="Close" v-if="isExists">UnLink</el-button>
        <el-card @click="selectCard('child')" shadow="hover" :class="{ 'selected': currentCard === 'child' }"
          class="child-card">
          <h3>Child Node</h3>
          <p>{{ childNode?.id }} {{ childNode?.nm }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useNodesStore } from '@/stores/nodes';
import { useEdgesStore } from '@/stores/edges';
import type { Node } from '@/stores/nodes';
import type { Edge } from '@/stores/edges';
import { TreeService, type TreeNode as TreeDataNode } from '@/service/treeService';
import { Sort, Close } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import type { TreeV2Instance } from 'element-plus';
import { el } from 'element-plus/es/locales.mjs';

const store = useNodesStore();
const edgesStore = useEdgesStore();

const autoGenParams = ref({
  levels: 3,
  length: 3
});

const treeRef = ref<TreeV2Instance>();

const treeData = computed(() =>
  TreeService.buildTree(store.All(), edgesStore.All())
);

const collapseAllNodes = () => {
  treeRef.value?.setExpandedKeys([]);
};

const collectAllNodeKeys = (nodes: TreeDataNode[]): string[] =>
  nodes.flatMap((node) => [node.uid, ...collectAllNodeKeys(node.child ?? [])]);

const expandAllNodes = () => {
  let allKeys = collectAllNodeKeys(treeData.value);
  // console.log('All node keys to expand:', allKeys);
  treeRef.value?.setExpandedKeys(allKeys);
};

/**
 * Добавляет один тестовый узел в состояние хранилища.
 */
const addDemoNode = () => {
  store.Add({ id: null, nm: null });
};

/**
 * Удаляет все узлы из состояния хранилища.
 */
const clearAllNodes = () => {
  store.Clear();
};

const clearAllEdges = () => {
  edgesStore.Clear();
};

/**
 * Удаляет конкретный узел по его ID.
 */
const deleteNode = (id: number) => {
  store.Delete(id);
};

const currentNode = ref<TreeDataNode | null>(null);

const selectNode = (node: TreeDataNode) => {
  currentNode.value = node;
  if (currentCard.value == 'parent') {
    parentNode.value = node;

  } else if (currentCard.value == 'child') {
    childNode.value = node;

  } else {
    console.log(`Выбран узел ${node.nm} без выбора карточки`);
  }
  isExists.value = parentNode.value && childNode.value && parentNode.value.id !== null && childNode.value.id !== null
    ? edgesStore.isExists(parentNode.value.id, childNode.value.id)
    : false;
};

const currentCard = ref<string | null>(null);
const selectCard = (card: string) => {
  currentCard.value = card;
};

const parentNode = ref<TreeDataNode | null>(null);
const childNode = ref<TreeDataNode | null>(null);

const link = () => {
  if (parentNode.value && childNode.value && parentNode.value.id !== null && childNode.value.id !== null) {
    const pId = parentNode.value.id;
    const cId = childNode.value.id;
    if (!edgesStore.isExists(pId, cId)) {
      edgesStore.Add({ idp: pId, idc: cId });
      console.log(`Связываем узлы: ${parentNode.value.nm} -> ${childNode.value.nm}`);
      isExists.value = edgesStore.isExists(pId, cId);
    } else {
      console.log('Эта связь уже существует');
    }
  } else {
    console.log('Выберите оба узла для связывания');
  }
};

const unLink = () => {
  if (parentNode.value && childNode.value && parentNode.value.id !== null && childNode.value.id !== null) {
    const pId = parentNode.value.id;
    const cId = childNode.value.id;
    if (edgesStore.isExists(pId, cId)) {
      edgesStore.Delete(pId, cId);
      console.log(`Разрываем связь между узлами: ${parentNode.value.nm} -> ${childNode.value.nm}`);
      isExists.value = edgesStore.isExists(pId, cId);
    } else {
      console.log('Эта связь не существует');
    }
  } else {
    console.log('Выберите оба узла для разрыва связи');
  }
};

const autoGen = () => {
  let maxId = store.findMaxId();
  console.log(`Макс ID перед генерацией: ${maxId}`);
  const { nodes, edges } = TreeService.generateSampleData(autoGenParams.value.levels, autoGenParams.value.length, 0, null, maxId + 1);
  store.Set(nodes);
  edgesStore.Set(edges);
};

const isExists = ref<boolean>(false);

const draggingNode = ref<number | null>(null);

const handleDragStart = (data: TreeDataNode, event: DragEvent) => {
  draggingNode.value = data.id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    try {
      event.dataTransfer.setData('text/plain', data.uid);
    } catch {
      // setData может быть недоступен в некоторых браузерах
    }
  }
  // console.log('drag node:', data);
};

const handleDragEnd = () => {
  draggingNode.value = null;
};

const handleNodeDrop = (dropData: TreeDataNode) => {
  console.log('handleNodeDrop: drag node:', draggingNode.value);
  console.log('handleNodeDrop: drop node:', dropData.id);
  if (dropData.id !== null && draggingNode.value !== null) {
    edgesStore.Add({ idp: dropData.id, idc: draggingNode.value });
  }
  draggingNode.value = null;
};

</script>

<style scoped>
.selected {
  background-color: #eee;
}

.parent-card {
  margin-right: 100px;
}

.child-card {
  margin-left: 100px;
}

.tree-card {

}

.tree-node-draggable {
  cursor: grab;
  user-select: none;
}

.tree-node-draggable:active {
  cursor: grabbing;
}
</style>