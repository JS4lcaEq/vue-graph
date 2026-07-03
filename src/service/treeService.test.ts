/**
 * Учебный файл: основные концепции Vitest на примере TreeService.
 *
 * Как запустить:
 *   npm test              — один прогон всех тестов
 *   npm run test:watch    — перезапуск при сохранении файла
 */

// ── Импорты из Vitest ──────────────────────────────────────────────────────
// describe  — группирует связанные тесты (как «папка» с названием)
// it        — один конкретный тест-кейс (синоним: test)
// expect    — функция для проверок (assertions / матчеры)
import { describe, expect, it } from 'vitest'

import { TreeService, type TreeNode } from './treeService'
import type { Node } from '@/stores/nodes'
import type { Edge } from '@/stores/edges'

// ── describe: блок тестов для одного модуля/класса ─────────────────────────
describe('TreeService (учебные примеры)', () => {

  // ── it: один сценарий «дано → когда → тогда» ─────────────────────────────
  // Название теста читается как предложение: «buildTree возвращает пустой массив…»
  it('buildTree возвращает пустой массив, если узлов нет', () => {
    // ARRANGE (подготовка) — входные данные
    const nodes: Node[] = []
    const edges: Edge[] = []

    // ACT (действие) — вызываем тестируемый код
    const result = TreeService.buildTree(nodes, edges)

    // ASSERT (проверка) — expect(факт).matcher(ожидание)
    //
    // toEqual — глубокое сравнение объектов/массивов (по содержимому).
    // Для пустого массива одной проверки достаточно — toHaveLength(0) здесь избыточен.
    expect(result).toEqual([])
  })

  it('buildTree строит простое дерево: один корень и два ребёнка', () => {
    // ARRANGE
    const nodes: Node[] = [
      { id: 1, nm: 'Корень' },
      { id: 2, nm: 'Ребёнок A' },
      { id: 3, nm: 'Ребёнок B' },
    ]
    const edges: Edge[] = [
      { idp: 1, idc: 2 }, // Корень → A
      { idp: 1, idc: 3 }, // Корень → B
    ]

    // Ожидаемый результат собираем «руками» — так проще читать и поддерживать
    const expected: TreeNode[] = [
      {
        uid: '1',
        id: 1,
        nm: 'Корень',
        path: '1',
        child: [
          { uid: '2', id: 2, nm: 'Ребёнок A', path: '1.2', child: [] },
          { uid: '3', id: 3, nm: 'Ребёнок B', path: '1.3', child: [] },
        ],
      },
    ]

    // ACT
    const tree = TreeService.buildTree(nodes, edges)

    // ASSERT — одна проверка всего результата целиком
    expect(tree).toEqual(expected)
  })
})