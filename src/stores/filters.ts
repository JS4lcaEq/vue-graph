import { defineStore } from 'pinia';
import { ref } from 'vue';

import { LocalStoreService } from '@/service/localStoreService';
import type { Filter } from '@/types/filter';

const localService = LocalStoreService.getInstance('filters-data');

function emptyFilterFields(): Omit<Filter, 'id'> {
  return {
    fRoleInCase: '',
    fCommitmentRole: '',
    fMemberStatus: '',
    fNoneResident: '',
    fSegmentType: '',
    fKIB: '',
  };
}

function normalizeFilter(filter: Filter): Filter {
  const defaults = emptyFilterFields();

  return {
    id: filter.id,
    fRoleInCase: filter.fRoleInCase ?? defaults.fRoleInCase,
    fCommitmentRole: filter.fCommitmentRole ?? defaults.fCommitmentRole,
    fMemberStatus: filter.fMemberStatus ?? defaults.fMemberStatus,
    fNoneResident: filter.fNoneResident ?? defaults.fNoneResident,
    fSegmentType: filter.fSegmentType ?? defaults.fSegmentType,
    fKIB: filter.fKIB ?? defaults.fKIB,
  };
}

export const useFiltersStore = defineStore('filters', () => {
  const stateData = ref<Filter[]>(localService.load() || []);

  let index: Record<number, Filter> = {};

  setIndex();

  function All(): Filter[] {
    return stateData.value;
  }

  function Count(): number {
    return stateData.value.length;
  }

  function Get(id: number): Filter | undefined {
    return index[id];
  }

  function Add(filter: Filter): Filter {
    const nextFilter = normalizeFilter({
      ...filter,
      id: filter.id === undefined || filter.id === null ? findMaxId() + 1 : filter.id,
    });

    stateData.value = [...stateData.value, nextFilter];
    setIndex();
    localService.save(stateData.value);
    return nextFilter;
  }

  function Alter(filter: Filter): Filter {
    if (filter.id === undefined || filter.id === null) {
      return Add(filter);
    }

    const nextFilter = normalizeFilter(filter);
    const itemIndex = stateData.value.findIndex(item => item.id === nextFilter.id);
    if (itemIndex === -1) {
      return Add(nextFilter);
    }

    stateData.value = stateData.value.map(item => (item.id === nextFilter.id ? nextFilter : item));
    setIndex();
    localService.save(stateData.value);
    return nextFilter;
  }

  function Delete(filterId: number): void {
    stateData.value = stateData.value.filter(item => item.id !== filterId);
    setIndex();
    localService.save(stateData.value);
  }

  function Clear(): void {
    stateData.value = [];
    setIndex();
    localService.save(stateData.value);
  }

  function setIndex(): void {
    index = {};
    for (const filter of stateData.value) {
      if (filter.id !== null && filter.id !== undefined) {
        index[filter.id] = filter;
      }
    }
  }

  function findMaxId(): number {
    const ids = stateData.value
      .map(filter => filter.id)
      .filter((id): id is number => id !== null && id !== undefined);

    if (ids.length === 0) {
      return 0;
    }

    return Math.max(...ids);
  }

  return {
    All,
    Count,
    Get,
    Add,
    Alter,
    Delete,
    Clear,
    findMaxId,
  };
});