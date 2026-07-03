import { defineStore } from 'pinia';
import { ref } from 'vue';

import { LocalStoreService } from '@/service/localStoreService';
const localService = LocalStoreService.getInstance('edges-data');

export interface Edge {
    idp: number;
    idc: number;
}

export const useEdgesStore = defineStore('edges', () => {

    const stateData = ref<Edge[]>(localService.load() || []);

    let parentIndex: Record<number, Edge> = {};
    let childIndex: Record<number, Edge> = {};
    let parentChildIndex: Record<string, Edge> = {};

    function All() {
        return stateData.value;
    }

    function Count() {
        return stateData.value.length;
    }

    function Add(newEdge: Edge): void {
        stateData.value = [...stateData.value, newEdge];
        setIndex();
        localService.save(stateData.value);
    }

    function Set(edges: Edge[]): void {
        stateData.value.push(...edges);
        setIndex();
        localService.save(stateData.value);
    }

    function Delete(parentId: number, childId: number): void {
        stateData.value = stateData.value.filter(edge => !(edge.idp === parentId && edge.idc === childId));
        setIndex();
        localService.save(stateData.value);
    }

    function setIndex() {
        parentIndex = {};
        childIndex = {};
        parentChildIndex = {};
        stateData.value.forEach(edge => {
            parentIndex[edge.idp] = edge;
            childIndex[edge.idc] = edge;
            parentChildIndex[`${edge.idp}-${edge.idc}`] = edge;
        });
    }

    setIndex();

    function isExists(parentId: number | null | undefined, childId: number | null | undefined): boolean {
        return !!parentChildIndex[`${parentId}-${childId}`];
    }

    function Clear(): void {
        stateData.value = [];
        setIndex();
        localService.save(stateData.value);
    }

    return {
        All,
        Count,
        Add,
        Set,
        Delete,
        Clear,
        isExists
    }
});