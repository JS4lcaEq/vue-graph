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
            <el-table-column label="Роль в деле" min-width="160">
              <template #default="{ row }">
                {{ formatFRoleInCaseLabels(row.fRoleInCase) }}
              </template>
            </el-table-column>
            <el-table-column label="Роль обязательства" min-width="160">
              <template #default="{ row }">
                {{ formatFCommitmentRoleLabels(row.fCommitmentRole) }}
              </template>
            </el-table-column>
            <el-table-column label="Статус участника" min-width="130">
              <template #default="{ row }">
                {{ formatFMemberStatusLabels(row.fMemberStatus) }}
              </template>
            </el-table-column>
            <el-table-column label="Нерезидент" min-width="110">
              <template #default="{ row }">
                {{ formatFNoneResidentLabels(row.fNoneResident) }}
              </template>
            </el-table-column>
            <el-table-column label="Тип сегмента" min-width="160">
              <template #default="{ row }">
                {{ formatFSegmentTypeLabels(row.fSegmentType) }}
              </template>
            </el-table-column>
            <el-table-column label="КИБ" min-width="80">
              <template #default="{ row }">
                {{ formatFKIBLabels(row.fKIB) }}
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

            <el-form-item label="Роль в деле (fRoleInCase)">
              <el-select
                v-model="selectedRoleInCaseKeys"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Выберите роли"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fRoleInCaseDictionary"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Роль обязательства (fCommitmentRole)">
              <el-select
                v-model="selectedCommitmentRoleKeys"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Выберите роли обязательства"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fCommitmentRoleDictionary"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Статус участника (fMemberStatus)">
              <el-select
                v-model="selectedMemberStatusKeys"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Выберите статусы участника"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fMemberStatusDictionary"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Нерезидент (fNoneResident)">
              <el-select
                v-model="selectedNoneResidentKeys"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Выберите значение нерезидента"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fNoneResidentDictionary"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Тип сегмента (fSegmentType)">
              <el-select
                v-model="selectedSegmentTypeKeys"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Выберите типы сегмента"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fSegmentTypeDictionary"
                  :key="item.key"
                  :label="item.value || `Ключ ${item.key}`"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="КИБ (fKIB)">
              <el-select
                v-model="selectedKIBKeys"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Выберите значение КИБ"
                style="width: 100%"
              >
                <el-option
                  v-for="item in fKIBDictionary"
                  :key="item.key"
                  :label="item.value"
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
  fCommitmentRoleDictionary,
  formatFCommitmentRoleKeys,
  formatFCommitmentRoleLabels,
  parseFCommitmentRoleKeys,
} from '@/dictionaries/fCommitmentRole';
import {
  fKIBDictionary,
  formatFKIBKeys,
  formatFKIBLabels,
  parseFKIBKeys,
} from '@/dictionaries/fKIB';
import {
  fMemberStatusDictionary,
  formatFMemberStatusKeys,
  formatFMemberStatusLabels,
  parseFMemberStatusKeys,
} from '@/dictionaries/fMemberStatus';
import {
  fNoneResidentDictionary,
  formatFNoneResidentKeys,
  formatFNoneResidentLabels,
  parseFNoneResidentKeys,
} from '@/dictionaries/fNoneResident';
import {
  fSegmentTypeDictionary,
  formatFSegmentTypeKeys,
  formatFSegmentTypeLabels,
  parseFSegmentTypeKeys,
} from '@/dictionaries/fSegmentType';
import {
  fRoleInCaseDictionary,
  formatFRoleInCaseKeys,
  formatFRoleInCaseLabels,
  parseFRoleInCaseKeys,
} from '@/dictionaries/fRoleInCase';
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

const selectedRoleInCaseKeys = computed({
  get: () => parseFRoleInCaseKeys(currentFilter.value.fRoleInCase),
  set: (keys: string[]) => {
    currentFilter.value.fRoleInCase = formatFRoleInCaseKeys(keys);
  },
});

const selectedCommitmentRoleKeys = computed({
  get: () => parseFCommitmentRoleKeys(currentFilter.value.fCommitmentRole),
  set: (keys: string[]) => {
    currentFilter.value.fCommitmentRole = formatFCommitmentRoleKeys(keys);
  },
});

const selectedMemberStatusKeys = computed({
  get: () => parseFMemberStatusKeys(currentFilter.value.fMemberStatus),
  set: (keys: string[]) => {
    currentFilter.value.fMemberStatus = formatFMemberStatusKeys(keys);
  },
});

const selectedNoneResidentKeys = computed({
  get: () => parseFNoneResidentKeys(currentFilter.value.fNoneResident),
  set: (keys: string[]) => {
    currentFilter.value.fNoneResident = formatFNoneResidentKeys(keys);
  },
});

const selectedSegmentTypeKeys = computed({
  get: () => parseFSegmentTypeKeys(currentFilter.value.fSegmentType),
  set: (keys: string[]) => {
    currentFilter.value.fSegmentType = formatFSegmentTypeKeys(keys);
  },
});

const selectedKIBKeys = computed({
  get: () => parseFKIBKeys(currentFilter.value.fKIB),
  set: (keys: string[]) => {
    currentFilter.value.fKIB = formatFKIBKeys(keys);
  },
});

const isEditing = computed(() => {
  const id = currentFilter.value.id;
  return id !== null && id !== undefined && filtersStore.Get(id) !== undefined;
});

function selectFilter(filter: Filter): void {
  currentFilter.value = { ...filter };
}

function resetForm(): void {
  currentFilter.value = emptyFilter();
}

function buildPayload(): Filter {
  return {
    id: currentFilter.value.id,
    fRoleInCase: formatFRoleInCaseKeys(selectedRoleInCaseKeys.value),
    fCommitmentRole: formatFCommitmentRoleKeys(selectedCommitmentRoleKeys.value),
    fMemberStatus: formatFMemberStatusKeys(selectedMemberStatusKeys.value),
    fNoneResident: formatFNoneResidentKeys(selectedNoneResidentKeys.value),
    fSegmentType: formatFSegmentTypeKeys(selectedSegmentTypeKeys.value),
    fKIB: formatFKIBKeys(selectedKIBKeys.value),
  };
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
  const parts = [
    formatFRoleInCaseLabels(filter.fRoleInCase),
    formatFCommitmentRoleLabels(filter.fCommitmentRole),
    formatFMemberStatusLabels(filter.fMemberStatus),
  ].filter(Boolean);

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