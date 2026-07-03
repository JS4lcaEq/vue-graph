<template>
  <div class="participants-filter-view">
    <h1>Фильтр участников</h1>

    <el-row :gutter="24">
      <el-col :xs="24" :md="18">
        <el-card shadow="always">
          <template #header>
            <span>Список фильтров</span>
          </template>

          <el-table
            :data="filters"
            highlight-current-row
            empty-text="Фильтры не добавлены"
            @row-click="selectFilter"
          >
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column
              v-for="field in filterFieldConfigs"
              :key="field.key"
              :label="field.label"
              min-width="110"
            >
              <template #default="{ row }">
                {{ formatDictionaryLabels(field.dictionary, row[field.key]) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="6">
        <el-card shadow="always">
          <template #header>
            <span>{{ isEditing ? 'Редактирование' : 'Новый фильтр' }}</span>
          </template>

          <el-form label-position="top" @submit.prevent="saveFilter">
            <el-form-item label="ID">
              <el-input
                :model-value="currentFilter.id ?? '—'"
                disabled
              />
            </el-form-item>

            <el-form-item
              v-for="field in filterFieldConfigs"
              :key="field.key"
              :label="`${field.label} (${field.key})`"
            >
              <el-select
                :model-value="getFieldKeys(field.key)"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                :placeholder="`Выберите ${field.label.toLowerCase()}`"
                style="width: 100%"
                @update:model-value="setFieldKeys(field.key, $event)"
              >
                <el-option
                  v-for="item in field.dictionary"
                  :key="item.key"
                  :label="item.value || `Ключ ${item.key}`"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>

            <div class="actions">
              <el-button type="primary" @click="saveFilter">
                {{ isEditing ? 'Сохранить' : 'Добавить' }}
              </el-button>
              <el-button @click="resetForm">Новый</el-button>
              <el-button
                type="danger"
                :disabled="!isEditing"
                @click="deleteFilter"
              >
                Удалить
              </el-button>
              <el-button
                type="danger"
                plain
                :disabled="!filters.length"
                @click="clearAll"
              >
                Очистить всё
              </el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  filterFieldConfigs,
  formatDictionaryKeys,
  formatDictionaryLabels,
  parseDictionaryKeys,
} from '@/types/filterDictionaries';
import type { FilterFieldKey } from '@/types/filterDictionaries';
import { useFiltersStore } from '@/stores/filters';
import type { Filter } from '@/types/filter';

const filtersStore = useFiltersStore();

const filters = computed(() => filtersStore.All());

const emptyFilter = (): Filter => ({
  id: null,
  fRoleInCase: '',
  fCommitmentRole: '',
  fMemberStatus: '',
  fNoneResident: '',
  fSegmentType: '',
  fKIB: '',
});

const currentFilter = ref<Filter>(emptyFilter());

const isEditing = computed(() => {
  const id = currentFilter.value.id;
  return id !== null && id !== undefined && filtersStore.Get(id) !== undefined;
});

function getFieldConfig(key: FilterFieldKey) {
  const field = filterFieldConfigs.find(item => item.key === key);
  if (!field) {
    throw new Error(`Неизвестное поле фильтра: ${key}`);
  }
  return field;
}

function getFieldKeys(key: FilterFieldKey): string[] {
  const field = getFieldConfig(key);
  return parseDictionaryKeys(field.dictionary, currentFilter.value[key]);
}

function setFieldKeys(key: FilterFieldKey, keys: string[]): void {
  const field = getFieldConfig(key);
  currentFilter.value[key] = formatDictionaryKeys(field.dictionary, keys);
}

function selectFilter(filter: Filter): void {
  currentFilter.value = { ...filter };
}

function resetForm(): void {
  currentFilter.value = emptyFilter();
}

function buildPayload(): Filter {
  const payload: Filter = {
    id: currentFilter.value.id,
    fRoleInCase: '',
    fCommitmentRole: '',
    fMemberStatus: '',
    fNoneResident: '',
    fSegmentType: '',
    fKIB: '',
  };

  for (const field of filterFieldConfigs) {
    payload[field.key] = formatDictionaryKeys(field.dictionary, getFieldKeys(field.key));
  }

  return payload;
}

function saveFilter(): void {
  const editing = isEditing.value;
  const saved = editing
    ? filtersStore.Alter(buildPayload())
    : filtersStore.Add(buildPayload());

  currentFilter.value = { ...saved };
  ElMessage.success(editing ? 'Фильтр обновлён' : 'Фильтр добавлен');
}

function filterLabel(filter: Filter): string {
  const parts = filterFieldConfigs
    .slice(0, 3)
    .map(field => formatDictionaryLabels(field.dictionary, filter[field.key]))
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return `фильтр #${filter.id}`;
}

async function deleteFilter(): Promise<void> {
  const id = currentFilter.value.id;
  if (id === null || id === undefined) {
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Удалить ${filterLabel(currentFilter.value)}?`,
      'Подтверждение',
      { type: 'warning' },
    );
    filtersStore.Delete(id);
    resetForm();
    ElMessage.success('Фильтр удалён');
  } catch {
    // отмена диалога
  }
}

async function clearAll(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      'Удалить все фильтры?',
      'Подтверждение',
      { type: 'warning' },
    );
    filtersStore.Clear();
    resetForm();
    ElMessage.success('Список очищен');
  } catch {
    // отмена диалога
  }
}
</script>

<style scoped>
.participants-filter-view {
  padding: 1rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>