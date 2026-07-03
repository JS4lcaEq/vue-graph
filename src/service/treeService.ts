import type { Node } from '@/stores/nodes';
import type { Edge } from '@/stores/edges';

/**
 * Представление узла в древовидной структуре.
 * Используется для компонентов типа el-tree / el-tree-v2.
 * Поле `child` (а не `children`) позволяет явно задавать имя дочерних элементов через props дерева.
 */
export interface TreeNode {
  /** Уникальный идентификатор экземпляра узла в дереве (для key / node-key при возможных дублированиях в DAG) */
  uid: string;
  /** Оригинальный идентификатор узла */
  id: number | null;
  /** Название / метка узла */
  nm: string | null;
  /** Дочерние узлы (рекурсивно) */
  child: TreeNode[];
  /** Путь (необязательно) */
  path: string | null; 
}

/**
 * Сервис для преобразования ациклического направленного графа (список узлов + список рёбер)
 * в иерархическое древовидное представление (лес).
 *
 * Особенности:
 * - Корни дерева — узлы без входящих рёбер.
 * - Поддержка DAG с несколькими родителями: общие потомки дублируются в дереве (стандартный подход для UI).
 * - Защита от бесконечной рекурсии при наличии циклов (хотя входные данные по контракту ацикличны).
 * - Детерминированный порядок: дети сортируются по id.
 */
export class TreeService {
  /**
   * Строит массив корневых деревьев из плоских данных графа.
   *
   * @param nodes - массив узлов [{ id, nm }]
   * @param edges - массив рёбер [{ idp (parent), idc (child) }]
   * @returns массив TreeNode (корневые узлы). Каждый имеет .child[]
   *
   * @example
   * const tree = TreeService.buildTree(nodesStore.All(), edgesStore.All());
   * // затем в шаблоне: <el-tree-v2 :data="tree" :props="{ children: 'child', label: 'nm' }" node-key="uid" ... />
   */
  public static buildTree(nodes: Node[], edges: Edge[]): TreeNode[] {
    if (!nodes?.length) {
      return [];
    }

    let counter = 1;

    // Карта: parentId -> список childId
    const childrenMap = new Map<number, number[]>();
    // Все существующие id узлов (для валидации рёбер)
    const nodeIds = new Set<number>();
    // Lookup узлов
    const nodeById = new Map<number, Node>();

    // Инициализация
    for (const node of nodes) {
      if (node && typeof node.id === 'number') {
        nodeIds.add(node.id);
        nodeById.set(node.id, node);
        childrenMap.set(node.id, []);
      }
    }

    // Множество узлов, у которых есть хотя бы один родитель (не корни)
    const hasIncoming = new Set<number>();

    // Заполняем карту детей и hasIncoming
    for (const edge of edges || []) {
      const p = edge?.idp;
      const c = edge?.idc;
      if (
        typeof p === 'number' &&
        typeof c === 'number' &&
        nodeIds.has(p) &&
        nodeIds.has(c) &&
        p !== c // защита от петель
      ) {
        const kids = childrenMap.get(p)!;
        kids.push(c);
        hasIncoming.add(c);
      }
    }

    // Дедупликация + сортировка детей (детерминизм)
    for (const [pid, kids] of childrenMap) {
      const uniqueSorted = [...new Set(kids)].sort((a, b) => a - b);
      childrenMap.set(pid, uniqueSorted);
    }

    // Корни = узлы без входящих рёбер
    const roots = nodes
      .filter((n): n is Node & { id: number } => n !== null && typeof n.id === 'number' && !hasIncoming.has(n.id))
      .sort((a, b) => a.id - b.id);

    // Рекурсивная сборка дерева с защитой от циклов
    const build = (id: number, path: Set<number>): TreeNode | null => {
      const node = nodeById.get(id);
      if (!node) return null;

      if (path.has(id)) {
        // Цикл — обрываем ветку (в реальном ацикличном графе не должно случаться)
        console.warn(`[TreeService] Обнаружен цикл при обходе узла id=${id}`);
        return null;
      }

      const nextPath = new Set(path);
      nextPath.add(id);
      const _counter = counter++;

      const childIds = childrenMap.get(id) || [];
      const childNodes: TreeNode[] = [];

      for (const cid of childIds) {
        const childTree = build(cid, nextPath);
        if (childTree) {
          childNodes.push(childTree);
        }
      }

      return {
        uid: "" + _counter, //Array.from(nextPath).join('.'),
        id: node.id,
        nm: `${node.nm}`,
        child: childNodes,
        path: Array.from(nextPath).join('.') // для отладки / визуализации пути в дереве
      };
    };

    // Собираем итоговый лес
    const result: TreeNode[] = [];
    for (const root of roots) {
      if (root && typeof root.id === 'number') {
        const treeNode = build(root.id, new Set<number>());
        if (treeNode) {
          result.push(treeNode);
        }
      }
    }

    return result;
  }

  /**
   * Удобный метод: построить дерево и сразу вернуть плоский список всех узлов дерева
   * (с учётом возможных дубликатов при multi-parent DAG).
   * Полезно для подсчёта, поиска и т.д.
   
  public static buildTreeAndFlatten(nodes: Node[], edges: Edge[]): TreeNode[] {
    const tree = this.buildTree(nodes, edges);
    const flat: TreeNode[] = [];

    const walk = (n: TreeNode) => {
      flat.push(n);
      for (const c of n.child) walk(c);
    };

    for (const r of tree) walk(r);
    return flat;
  }
  */
 
  public static generateSampleData(deepCount: number, branchCount: number, level: number = 0, parentId: number | null = null, idCounter: number = 1) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (level >= deepCount) {
      return { nodes, edges, idCounter };
    }

    for (let i = 0; i < branchCount; i++) {
      const nodeId = idCounter++;
      //console.log(`Node ${nodeId} (parent: ${parentId})`);
      nodes.push({ id: nodeId, nm: `Node ${nodeId}` });
      if (parentId !== null) {
        edges.push({ idp: parentId, idc: nodeId });
      }
      const { nodes: childNodes, edges: childEdges, idCounter: newIdCounter } = this.generateSampleData(deepCount, branchCount, level + 1, nodeId, idCounter);
      nodes.push(...childNodes);
      edges.push(...childEdges);
      idCounter = newIdCounter;
    }
    return { nodes, edges, idCounter: idCounter };
  }

  public static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;   // hash = hash * 31 + char
      hash = hash & hash;                 // Приводим к 32-битному числу
    }
    return hash >>> 0; // делаем unsigned 32-bit
  }

}
