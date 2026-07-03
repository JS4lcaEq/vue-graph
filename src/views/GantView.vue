<template>
  <div class="gant-view">
    <p>tasksStore.list = " {{ tasksStore.list }} "</p>
    <p>linksStore.list = " {{ linksStore.list }} "</p>
    <ul>
      <li v-for="gantt in ganttStore.list" :key="gantt.id">
        <span @click="onClick(gantt)">{{ gantt.nm }}</span>
      </li>
    </ul>
    <form v-if="currentGantt" >
      currentGantt = {{ currentGantt }}
      <input type="text" v-model="currentGantt.nm" placeholder="New Gantt Name" />
      <input type="number" v-model="currentGantt.duration" placeholder="0" />
      <button type="submit" @click="onSubmit">Записать</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Delete } from '@element-plus/icons-vue';

import { useTasksStore } from '@/stores/tasks';
import { useLinksStore } from '@/stores/links';
import { useGanttsStore } from '@/stores/gantt';
import type { Task } from '@/types/tasks';
import type { Link } from '@/types/links';
import type { Gantt } from '@/types/gantt';

const tasksStore = useTasksStore();
const linksStore = useLinksStore();
const ganttStore = useGanttsStore();

const currentGantt = ref<Gantt | null>(null);

const currentGanttName = computed({
  get: () => currentGantt.value?.nm ?? '',
  set: (val: string) => {
    if (currentGantt.value) {
      currentGantt.value.nm = val;
    } else {
      currentGantt.value = { id: Date.now(), nm: val, duration: 0 } as Gantt;
    }
  },
});

const currentGanttDuration = computed({
  get: () => currentGantt.value?.duration ?? 0,
  set: (val: number) => {
    if (currentGantt.value) {
      currentGantt.value.duration = val;
    } else {
      currentGantt.value = { id: Date.now(), nm: '', duration: val } as Gantt;
    }
  },
});

const onClick = (gantt: any) => {
  currentGantt.value = { ...gantt };
};

const onSubmit = (e: Event) => {
  e.preventDefault();
  if (currentGantt.value) {
    const task : Task = {
      id: currentGantt.value.id,
      nm: currentGantt.value.nm,
      duration: currentGantt.value.duration,
    };

    tasksStore.Alter(task)

    currentGantt.value = null;
  }
};

</script>

<style scoped>

</style>