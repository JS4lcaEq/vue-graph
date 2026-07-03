import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { LocalStoreService } from '@/service/localStoreService';
import type { Link } from '@/types/links';

const localService = LocalStoreService.getInstance('links-data');

export const useLinksStore = defineStore('links', () => {

    const index = ref(new Map<string, Link>());
    const parentIndex = ref(new Map<number, Link[]>());
    const childIndex = ref(new Map<number, Link[]>());

    const list = computed(() => Array.from(index.value.values()));

    setIndex();

    function GetList(): Link[] {
        return Array.from(index.value.values());
    }

    function GetParentsList(id: number): Link[] {
        return parentIndex.value.get(id) || [];
    }

    function GetChildsList(id: number): Link[] {
        return childIndex.value.get(id) || [];
    }

    function Add(link: Link): Link {
        const key = `${link.idp}-${link.idc}`;
        index.value.set(key, link);

        if (!parentIndex.value.has(link.idp)) {
            parentIndex.value.set(link.idp, []);
        }
        parentIndex.value.get(link.idp)?.push(link);

        if (!childIndex.value.has(link.idc)) {
            childIndex.value.set(link.idc, []);
        }
        childIndex.value.get(link.idc)?.push(link);

        index.value = new Map(index.value);
        localService.save(GetList());
        return link;
    }

    function Delete(link: Link): void {
        const key = `${link.idp}-${link.idc}`;
        index.value.delete(key);

        const parentLinks = parentIndex.value.get(link.idp);

        if (parentLinks) {
            const parentIndexToRemove = parentLinks.findIndex(l => l.idc === link.idc);
            if (parentIndexToRemove !== -1) {
                parentLinks.splice(parentIndexToRemove, 1);
            }
        }

        const childLinks = childIndex.value.get(link.idc);
        if (childLinks) {
            const childIndexToRemove = childLinks.findIndex(l => l.idp === link.idp);
            if (childIndexToRemove !== -1) {
                childLinks.splice(childIndexToRemove, 1);
            }
        }
        index.value = new Map(index.value);
        localService.save(GetList());
    }

    function setIndex() {
        const links = localService.load() || [];
        const nextIndex = new Map<string, Link>();
        const nextParentIndex = new Map<number, Link[]>();
        const nextChildIndex = new Map<number, Link[]>();

        for (const link of links) {
            const key = `${link.idp}-${link.idc}`;
            nextIndex.set(key, link);

            if (!nextParentIndex.has(link.idp)) {
                nextParentIndex.set(link.idp, []);
            }
            nextParentIndex.get(link.idp)?.push(link);

            if (!nextChildIndex.has(link.idc)) {
                nextChildIndex.set(link.idc, []);
            }
            nextChildIndex.get(link.idc)?.push(link);
        }

        index.value = nextIndex;
        parentIndex.value = nextParentIndex;
        childIndex.value = nextChildIndex;
    }

    function HasParent(id: number): boolean {
        const parents = parentIndex.value.get(id);
        return parents !== undefined && parents.length > 0;
    }

    function HasChild(id: number): boolean {
        const childs = childIndex.value.get(id);
        return childs !== undefined && childs.length > 0;
    }   

    return {
        Add,
        Delete,
        GetList,
        GetParentsList,
        GetChildsList,
        list,
        HasParent,
        HasChild
    }
});