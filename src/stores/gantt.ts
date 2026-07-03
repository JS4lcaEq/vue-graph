import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Link } from '@/types/links';
import type { Task } from '@/types/tasks';
import type { Gantt } from '@/types/gantt';

import { useTasksStore } from '@/stores/tasks';
import { useLinksStore } from '@/stores/links';
import { GanttService } from '@/service/ganttService';

const tasksStore = useTasksStore();
const linksStore = useLinksStore(); 

export const useGanttsStore = defineStore('gantt', () => {
    

    let start = 0;

    function setStart(value: number) {
        start = value;
    }   
    
    function recursion(parentId: number, level: number, ret: Gantt[]): void {
        const childLinks = linksStore.GetParentsList(parentId);
        //console.log('recursion: parentId =', parentId, ', level =', level, ', childLinks.length =', childLinks.length);
        for (const link of childLinks) {
            const task = tasksStore.Get(link.idc);
            if (task) {
                const end: number = start + task.duration!;
                const gantt : Gantt = {id: task.id!, nm: task.nm!, duration: task.duration!, start: start, end: end, level: level};
                ret.push(gantt);
                recursion(task.id!, level + 1, ret);
            }
        }    
    }

    const list = computed(() => { 
        const ret: Gantt[] = []  
        const rootTasks = tasksStore.list.filter(task => task.id != null && !linksStore.HasChild(task.id));
        rootTasks.forEach(item => {
            const end: number = start + item.duration!;
            const gantt : Gantt = {id: item.id!, nm: item.nm!, duration: item.duration!, start: start, end: end, level: 0};
            ret.push(gantt);
            recursion(item.id!, 1, ret);
        });

        return ret;
    })

    return {
        list,
        setStart
    }
})