/**
 * Узел графа задач для расчёта диаграммы Ганта.
 * duration — в днях.
 */
export interface GanttNode {
  id: number;
  nm: string;
  duration: number;
}

/**
 * Элемент представления диаграммы Ганта.
 * duration — в днях; start и end — в миллисекундах.
 */
export interface Gantt {
  id: number;
  nm: string;
  duration: number;
  start: number;
  end: number;
  level: number;
}

/** Полоса диаграммы Ганта (результат GantService.buildGantt). */
export type GanttBar = Gantt;