import { defineStore } from 'pinia';
import { ref } from 'vue';

import { LocalStoreService } from '@/service/localStoreService';
const localService = LocalStoreService.getInstance('nodes-data');

export interface Node {
  id: number | null;
  nm: string | null;
}

export const useNodesStore = defineStore('nodes', () => {

  const stateData = ref<Node[]>(localService.load() || []);

  let index: Record<number, Node> = {};

  setIndex();

  function All() {
    return stateData.value;
  }

  function Count() {
    return stateData.value.length;
  }

  function Add(newNode: Node): void {
    if (newNode.id === undefined || newNode.id === null) {
      newNode.id = findMaxId() + 1;
    }
    if (newNode.nm === undefined || newNode.nm === null) {
      newNode.nm = `Node ${newNode.id}`;
    }

    stateData.value = [...stateData.value, newNode];
    setIndex();
    localService.save(stateData.value);
  }

  function Set(nodes: Node[]): void {
    stateData.value.push(...nodes);
    setIndex();
    localService.save(stateData.value);
  }

  function Delete(nodeId: number): void {
    stateData.value = stateData.value.filter(node => node.id !== nodeId);
    setIndex();
    localService.save(stateData.value);
  }

  function Clear(): void {
    stateData.value = [];
    setIndex();
    localService.save(stateData.value);
  }

  function setIndex() {
    index = {};
    stateData.value.forEach(node => {
      if (node.id !== null && node.id !== undefined) {
        index[node.id] = node;
      }
    });
  }

  function getIndex() {
    return index;
  }

  function findMaxId(): number {
    const ids = stateData.value
      .map(node => node.id)
      .filter((id): id is number => id !== null && id !== undefined);

    if (ids.length === 0) {
      return 0;
    }

    return Math.max(...ids);
  }

  return {
    All,
    Count,
    Add,
    Set,
    Delete,
    Clear,
    findMaxId,
    getIndex
  }
});