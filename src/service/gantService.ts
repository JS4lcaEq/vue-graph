import type { GanttBar, GanttNode } from '@/types/gantt';
import type { Link } from '@/types/links';
import type { Timestamp } from '@/types/tasks';

const MS_PER_DAY = 86_400_000;
const DEFAULT_DURATION_DAYS = 1;

/**
 * Сервис расчёта представления диаграммы Ганта из графа задач и связей.
 *
 * Правила:
 * - Связь { idp, idc }: задача idp — предшественник задачи idc.
 * - start = globalStart, если предшественников нет; иначе max(end предшественников).
 * - end = start + duration (в днях, переводится в мс).
 * - level — минимальный номер строки, где полоса [start, end) не пересекается с уже размещёнными.
 */
export class GantService {

  /**
   * Строит массив полос диаграммы Ганта.
   *
   * @param nodes - узлы [{ id, nm, duration }] (duration в днях)
   * @param links - связи [{ idp, idc }]
   * @param globalStart - глобальная точка отсчёта (мс)
   */
  public static buildGantt(
    nodes: Array<{ id: number | null; nm: string | null; duration: number | null }>,
    links: Link[],
    globalStart: Timestamp,
  ): GanttBar[] {
    const normalized = GantService.normalizeNodes(nodes);
    if (normalized.length === 0) {
      return [];
    }

    const nodeIds = new Set(normalized.map(node => node.id));
    const predecessors = GantService.buildPredecessors(links, nodeIds);
    const order = GantService.topologicalSort(normalized, predecessors);

    if (order === null) {
      console.warn('[GantService] Обнаружен цикл в графе зависимостей');
      return [];
    }

    const schedule = GantService.computeSchedule(order, predecessors, globalStart);
    const withLevels = GantService.assignLevels(schedule);

    return withLevels.sort((a, b) => a.id - b.id);
  }

  private static normalizeNodes(
    nodes: Array<{ id: number | null; nm: string | null; duration: number | null }>,
  ): GanttNode[] {
    const result: GanttNode[] = [];

    for (const node of nodes) {
      if (node.id === null || node.id === undefined) {
        continue;
      }

      result.push({
        id: node.id,
        nm: node.nm ?? `Task name ${node.id}`,
        duration: node.duration ?? DEFAULT_DURATION_DAYS,
      });
    }

    return result.sort((a, b) => a.id - b.id);
  }

  private static durationToMs(days: number): number {
    return days * MS_PER_DAY;
  }

  private static buildPredecessors(links: Link[], nodeIds: Set<number>): Map<number, number[]> {
    const predecessors = new Map<number, number[]>();

    for (const id of nodeIds) {
      predecessors.set(id, []);
    }

    for (const link of links) {
      const { idp, idc } = link;
      if (!nodeIds.has(idp) || !nodeIds.has(idc) || idp === idc) {
        continue;
      }

      const preds = predecessors.get(idc)!;
      if (!preds.includes(idp)) {
        preds.push(idp);
      }
    }

    for (const preds of predecessors.values()) {
      preds.sort((a, b) => a - b);
    }

    return predecessors;
  }

  private static topologicalSort(
    nodes: GanttNode[],
    predecessors: Map<number, number[]>,
  ): GanttNode[] | null {
    const inDegree = new Map<number, number>();
    const successors = new Map<number, number[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      successors.set(node.id, []);
    }

    for (const node of nodes) {
      const preds = predecessors.get(node.id) ?? [];
      inDegree.set(node.id, preds.length);

      for (const predId of preds) {
        successors.get(predId)!.push(node.id);
      }
    }

    for (const succs of successors.values()) {
      succs.sort((a, b) => a - b);
    }

    const nodeById = new Map(nodes.map(node => [node.id, node]));
    const queue = nodes
      .filter(node => (inDegree.get(node.id) ?? 0) === 0)
      .map(node => node.id)
      .sort((a, b) => a - b);

    const order: GanttNode[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = nodeById.get(currentId);
      if (currentNode) {
        order.push(currentNode);
      }

      for (const succId of successors.get(currentId) ?? []) {
        const nextDegree = (inDegree.get(succId) ?? 0) - 1;
        inDegree.set(succId, nextDegree);
        if (nextDegree === 0) {
          queue.push(succId);
          queue.sort((a, b) => a - b);
        }
      }
    }

    if (order.length !== nodes.length) {
      return null;
    }

    return order;
  }

  private static computeSchedule(
    order: GanttNode[],
    predecessors: Map<number, number[]>,
    globalStart: Timestamp,
  ): GanttBar[] {
    const endById = new Map<number, Timestamp>();
    const bars: GanttBar[] = [];

    for (const node of order) {
      const preds = predecessors.get(node.id) ?? [];
      let start = globalStart;

      for (const predId of preds) {
        const predEnd = endById.get(predId);
        if (predEnd !== undefined && predEnd > start) {
          start = predEnd;
        }
      }

      const end = start + GantService.durationToMs(node.duration);
      endById.set(node.id, end);

      bars.push({
        id: node.id,
        nm: node.nm,
        duration: node.duration,
        start,
        end,
        level: 0,
      });
    }

    return bars;
  }

  private static assignLevels(bars: GanttBar[]): GanttBar[] {
    const levels: GanttBar[][] = [];
    const sorted = [...bars].sort((a, b) => {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return a.id - b.id;
    });

    for (const bar of sorted) {
      let assignedLevel = 0;

      while (assignedLevel < levels.length) {
        const levelBars = levels[assignedLevel]!;
        const hasOverlap = levelBars.some(existing => GantService.intervalsOverlap(bar, existing));
        if (!hasOverlap) {
          break;
        }
        assignedLevel++;
      }

      if (!levels[assignedLevel]) {
        levels[assignedLevel] = [];
      }

      levels[assignedLevel]!.push(bar);
      bar.level = assignedLevel;
    }

    return bars;
  }

  private static intervalsOverlap(a: Pick<GanttBar, 'start' | 'end'>, b: Pick<GanttBar, 'start' | 'end'>): boolean {
    return a.start < b.end && b.start < a.end;
  }
}