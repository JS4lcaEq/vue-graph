import type { Filter } from '@/types/filter';

export type DictionaryItem = { key: string; value: string };

export const fRoleInCaseDictionary: DictionaryItem[] = [
  { key: '1', value: 'Истец' },
  { key: '2', value: 'Ответчик' },
  { key: '3', value: 'Третье лицо' },
  { key: '4', value: 'Потерпевший' },
  { key: '5', value: 'Клиент' },
  { key: '6', value: 'Субъект ответственности' },
];

export const fCommitmentRoleDictionary: DictionaryItem[] = [
  { key: '1', value: 'Поручитель' },
  { key: '2', value: 'Заемщик' },
  { key: '3', value: 'Эммитент' },
  { key: '4', value: 'Цессионарий' },
  { key: '5', value: 'Цедент' },
  { key: '6', value: 'Субподрядчик' },
];

export const fMemberStatusDictionary: DictionaryItem[] = [
  { key: '1', value: 'ЮЛ' },
  { key: '2', value: 'ИП' },
  { key: '3', value: 'ФП' },
  { key: '4', value: 'ДП' },
  { key: '5', value: 'Банк' },
];

export const fNoneResidentDictionary: DictionaryItem[] = [
  { key: '1', value: 'Да' },
  { key: '2', value: 'Нет' },
];

export const fSegmentTypeDictionary: DictionaryItem[] = [
  { key: '1', value: '108. Стандартный' },
  { key: '2', value: '107. Верхний' },
  { key: '3', value: '106. Массовый' },
  { key: '4', value: '104. Средний бизнес' },
  { key: '5', value: '103. Крупный бизнес' },
];

export const fKIBDictionary: DictionaryItem[] = [
  { key: '1', value: 'Да' },
  { key: '2', value: 'Нет' },
];

export type FilterFieldKey = Exclude<keyof Filter, 'id'>;

export interface FilterFieldConfig {
  key: FilterFieldKey;
  label: string;
  dictionary: DictionaryItem[];
}

/** Конфигурация полей фильтра со справочниками для UI. */
export const filterFieldConfigs: FilterFieldConfig[] = [
  { key: 'fRoleInCase', label: 'Роль в деле', dictionary: fRoleInCaseDictionary },
  { key: 'fCommitmentRole', label: 'Роль обязательства', dictionary: fCommitmentRoleDictionary },
  { key: 'fMemberStatus', label: 'Статус участника', dictionary: fMemberStatusDictionary },
  { key: 'fNoneResident', label: 'Нерезидент', dictionary: fNoneResidentDictionary },
  { key: 'fSegmentType', label: 'Тип сегмента', dictionary: fSegmentTypeDictionary },
  { key: 'fKIB', label: 'КИБ', dictionary: fKIBDictionary },
];

function valueByKey(dictionary: DictionaryItem[]): Map<string, string> {
  return new Map(dictionary.map(item => [item.key, item.value]));
}

/** Разбирает строку ключей справочника. */
export function parseDictionaryKeys(
  dictionary: DictionaryItem[],
  value: string | null | undefined,
): string[] {
  if (!value) {
    return [];
  }

  const keys = valueByKey(dictionary);
  return value
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && keys.has(key));
}

/** Сериализует выбранные ключи в строку. */
export function formatDictionaryKeys(dictionary: DictionaryItem[], keys: string[]): string {
  const knownKeys = valueByKey(dictionary);
  return keys
    .filter(key => knownKeys.has(key))
    .join(',');
}

/** Возвращает подписи справочника для сохранённого значения. */
export function formatDictionaryLabels(
  dictionary: DictionaryItem[],
  value: string | null | undefined,
): string {
  const labels = valueByKey(dictionary);
  return parseDictionaryKeys(dictionary, value)
    .map(key => labels.get(key))
    .filter((label): label is string => label !== undefined)
    .join(', ');
}