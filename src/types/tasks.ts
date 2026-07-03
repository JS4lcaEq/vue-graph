/** Момент времени в миллисекундах (для start/end диаграммы Ганта) */
export type Timestamp = number;

export interface Task {
  id: number | null;
  nm: string | null;
  duration: number | null;/** Длительность задачи в днях */
}