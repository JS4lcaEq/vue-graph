import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { LocalStoreService } from '@/service/localStoreService';
import type { Task } from '@/types/tasks';

const localService = LocalStoreService.getInstance('tasks-data');

const DEFAULT_DURATION_DAYS = 1;

const index = ref(new Map<number, Task>());

export const useTasksStore = defineStore('tasks', () => {

  setIndex();

  function GetIndex() {
    return index.value;
  }

  const list = computed(() => Array.from(index.value.values()));

  function All(): Task[] {
    return Array.from(index.value.values());
  }

  function Get(id: number): Task | undefined {
    return index.value.get(id);
  }

  function Alter(task: Task): Task {
    if (task.id === undefined || task.id === null) {
      task.id = findMaxId() + 1;
    }
    if (task.nm === undefined || task.nm === null) {
      task.nm = `Task name ${task.id}`;
    }
    if (task.duration === undefined || task.duration === null) {
      task.duration = DEFAULT_DURATION_DAYS;
    }

    index.value.set(task.id, task);
    index.value = new Map(index.value);

    localService.save(All());
    return task;
  }

  function Delete(taskId: number): void {
    index.value.delete(taskId);
    index.value = new Map(index.value);
    localService.save(All());
  }

  function Clear(): void {
    index.value.clear();
    index.value = new Map(index.value);
    localService.save([]);
  }

  function setIndex() {
    const tasks = localService.load() || [];
    const nextIndex = new Map<number, Task>();
    for (const task of tasks) {
      nextIndex.set(task.id, task);
    }
    index.value = nextIndex;
  }

  function findMaxId(): number {
    const ids = Array.from(index.value.keys());
    if (ids.length === 0) {
      return 0;
    }
    return Math.max(...ids);
  }

  return {
    GetIndex,
    All,
    Get,
    Alter,
    Delete,
    Clear,
    list
  }
});