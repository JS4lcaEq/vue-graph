import type { Link } from '@/types/links';
import type { Task } from '@/types/tasks';
import type { Gantt } from '@/types/gantt';


export class GanttService {
    public static buildGantt(tasks: Task[], links: Link[]): Gantt[] {       
        const gantt: Gantt[] = [];
    
        return gantt;
    }

}