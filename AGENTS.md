# AGENTS.md — vue-graph

Инструкции для AI-агентов.


## Обзор проекта

**vue-graph** — одностраничное Vue-приложение для визуализации и управления направленным ациклическим графом (DAG).

- **Назначение:** узлы и рёбра хранятся локально, граф преобразуется в древовидное представление для UI.
- **Статус:** прототип / учебный проект — см. раздел «Планы».
- **Язык UI и комментариев:** русский (сохраняйте при добавлении кода).

### Доменная модель

| Сущность | Поля | Описание |
|----------|------|----------|
| `Node` | `id`, `nm` | Узел графа. `id` — число, `nm` — метка |
| `Edge` | `idp`, `idc` | Ребро: родитель (`idp`) → потомок (`idc`) |
| `TreeNode` | `uid`, `id`, `nm`, `child`, `path` | Узел дерева для `el-tree-v2`. Поле `child` (не `children`) — осознанный выбор |

Граф по контракту **ацикличен**. При нескольких родителях (DAG) потомки **дублируются** в дереве — стандартный подход для UI.


## Стек технологий

| Слой | Технология |
|------|------------|
| UI | Vue 3.5, Composition API, `<script setup>` |
| Состояние | Pinia (setup stores) |
| Маршрутизация | Vue Router 5 |
| UI-компоненты | Element Plus (`el-tree-v2`, `el-card`, `el-button`, …) |
| Сборка | Vite 8 |
| Язык | TypeScript 6 (strict, `noUncheckedIndexedAccess`) |
| Тесты | Vitest 4 + jsdom |
| Хранение | `localStorage` через `LocalStoreService` |

**Node.js:** `^20.19.0 || >=22.12.0`


## Команды разработки

```bash
npm install          # установка зависимостей
npm run dev          # dev-сервер (Vite)
npm run build        # type-check + production build
npm run preview      # предпросмотр production-сборки
npm test             # Vitest — один прогон
npm run test:watch   # Vitest в watch-режиме
```

Перед завершением задачи агент должен:

1. `npm run type-check` — без ошибок TypeScript
2. `npm test` — все тесты зелёные


## Структура каталогов

```
vue-graph/
├── src/
│   ├── main.ts              # точка входа: Pinia, Router, Element Plus
│   ├── App.vue              # layout: header / main / footer
│   ├── router/index.ts      # маршруты и meta.header
│   ├── views/               # страницы (Home, About, Test, Nodes, LocalStore)
│   ├── stores/
│   │   ├── nodes.ts         # Pinia store узлов
│   │   ├── edges.ts         # Pinia store рёбер
│   │   └── *.test.ts        # тесты stores
│   ├── service/
│   │   ├── treeService.ts   # DAG → деревовидное представление графа, автогенерация данных
│   │   ├── localStoreService.ts  # singleton localStorage
│   │   └── *.test.ts        # тесты сервисов
│   └── assets/              # глобальные стили
├── classDiagram.mermaid.txt # диаграмма целевой доменной модели
├── vite.config.ts           # alias @ → src, конфиг Vitest
└── package.json
```

**Алиас импортов:** `@/` → `src/` (настроен в `vite.config.ts` и `tsconfig.app.json`).


## Архитектура и потоки данных

```
NodesView.vue
    ↓ useNodesStore / useEdgesStore
    ↓ LocalStoreService (nodes, edges)
    ↓ TreeService.buildTree(nodes, edges)
    ↓ computed treeData
    ↓ el-tree-v2
```

### Pinia stores

Методы stores именуются в **PascalCase** (историческое соглашение проекта):

- `All()`, `Count()`, `Add()`, `Set()`, `Delete()`, `Clear()`
- `nodes`: автогенерация `id` и `nm` при `Add({ id: null, nm: null })`
- `edges`: `isExists(idp, idc)` — проверка существования ребра

Stores **не экспортируют** `stateData` напрямую — только методы. Не раскрывайте `ref` без необходимости.

### LocalStoreService

- Singleton: `LocalStoreService.getInstance(selectorId)`
- Ключи локального хранилища selectorId: `'nodes-data'`, `'edges-data'` — не менять без миграции данных
- Методы: `save()`, `load()`, `clear()`

### TreeService

- `buildTree(nodes, edges)` — основной метод, возвращает полный treeView 
- `generateSampleData(deepCount, branchCount, ...)` — генератор тестовых данных
- Дети сортируются по `id` (детерминизм)

## Соглашения по коду

### Vue-компоненты

- Используйте `<script setup lang="ts">`
- Импорты типов: `import type { ... }`
- Стили страниц: `<style scoped>`; глобальные стили — в `assets/`
- UI: предпочитайте Element Plus, не добавляйте новые UI-библиотеки без согласования 

### TypeScript

- Строгая типизация; избегайте `any` (кроме legacy в `LocalStoreService.processData`)
- `noUncheckedIndexedAccess: true` — учитывайте `undefined` при индексации
- Интерфейсы домена экспортируются из stores (`Node`, `Edge`) и `treeService` (`TreeNode`)

### Именование полей

Сокращённые имена — **намеренные**:

- `nm` — name — имя/наименование
- `idp` — id parent  —  идентификатор/ключ родительского узла
- `idc` — id child  —  идентификатор/ключ дочернего узла

Не переименовывайте в `name`, `parentId` и т.п. без явного рефакторинга всего проекта.

### Маршруты

Новый маршрут добавляйте в `src/router/index.ts` с `meta.header` и `meta.description`.
Навигация на `HomeView` строится автоматически из `router.options.routes`.

### Комментарии и документация

- JSDoc на публичных методах сервисов (как в `TreeService`)
- Тесты могут содержать учебные комментарии — это норма для проекта
- Не создавайте markdown-файлы, если пользователь явно не просил


## Тестирование

- Фреймворк: **Vitest**, среда: **jsdom**, `globals: true`
- Тесты рядом с кодом: `*.test.ts`
- Паттерн: Arrange → Act → Assert
- В тестах stores: `beforeEach` с `localStorage.clear()`, `createPinia()`, `setActivePinia()`
- **Oracle:** ожидаемый результат задавайте независимо от тестируемого кода (см. `nodes.test.ts`)

Примеры учебных тестов: `treeService.test.ts`, `nodes.test.ts`, `localStoreService.test.ts`.


## Маршруты приложения

| Путь | View | Назначение |
|------|------|------------|
| `/` | HomeView | Домашняя страница - Навигация |
| `/about` | AboutView | О проекте - реквизиты приложения|
| `/test` | TestView | Тестовая страница - тест системы маршрутизации |
| `/nodes` | NodesView | **Основной интерфейс** — управление графом через древовидное представление |


## Что делать / Что Не делать

### Делать

- Минимальные, сфокусированные изменения
- Сохранять существующие соглашения об именах (PascalCase в stores, `child` - для children блока в TreeNode)
- Использовать `@/` для импортов из `src`
- При работе с деревом: `props="{ children: 'child', label: 'nm', value: 'uid' }"`

### Не делать

- Не редактировать `node_modules/`
- Не менять ключи localStorage без миграции
- Не рефакторить несвязанный код «заодно»

<!-- 
## Известные ограничения и техдолг
- `nodes.ts`: `setIndex()` / `getIndex()` — индекс не обновляется при `Add`/`Delete` (не экспортируется) 
-->


