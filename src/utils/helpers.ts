import { EventEmitter } from "@stencil/core";
import { IComboboxOption, NormalizedOption } from "../interface";
import { isPlatform } from "@ionic/core";

// From: https://github.com/ionic-team/ionic/blob/master/core/src/utils/helpers.ts

export function deferEvent(event: EventEmitter): EventEmitter {
  return debounceEvent(event, 0);
}

export function debounceEvent(event: EventEmitter, wait: number): EventEmitter {
  const original = (event as any)._original || event;
  return {
    _original: event,
    emit: debounce(original.emit.bind(original), wait) as any
  } as EventEmitter;
}

export function debounce(func: (...args: any[]) => void, wait = 0) {
  let timer: any;
  return (...args: any[]): void => {
    clearTimeout(timer);
    timer = setTimeout(func, wait, ...args);
  };
}

export function debounceAsync(func: (...args: any[]) => Promise<void>, wait = 0) {
  let timer: any;
  let promise: Promise<void>;
  let resolve;
  let reject;

  return (...args: any[]): Promise<void> => {
    clearTimeout(timer);

    if (!promise)
      promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });

    timer = setTimeout(async () => {
      try {
        let result = await func(...args);
        promise = null;
        resolve(result);
      }
      catch (e) {
        promise = null;
        reject(e);
      }
    }, wait);

    return promise;
  };
}

export function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

let ignoredSearchTokens = [
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'para', 'em', 'com', 'como',
  'por', 'no', 'na', 'nos', 'nas', 'pelo', 'pela', 'pelos', 'pelas', 'ao', 'aos', 'd', 'sem'
];

export function generateSearchToken(text: string) {
  if (!text)
    return '';

  return removeAccents(text.toString().toLowerCase())
    .split(/[\,\;\:\+\(\)\'\´\`\" ]/)
    .filter(s => !!s && !ignoredSearchTokens.includes(s))
    .map(s => s
      .replace(/[\W]+/, '') // removes special caracters
      .replace(/(ns)$|(oes)$|(eis)$|(is)$|(ies)$|(es)$|(s)$/, '')) //removes plural for pt-BR and en-US
    .join(' ');
}

export function isCore(_win: Window) {
  return !isPlatform('ios') && !isPlatform('android') && !isPlatform('ipad');
}

export function isEmptyValue(value: any) {
  if (Array.isArray(value))
    return value.length <= 0;

  return value === null || value === undefined || value === '';
}

export function normalizeValue(value: any, multiple: boolean): string | string[] {
  if (multiple) {
    const isArray = Array.isArray(value);

    if (!value)
      return [];

    if (!isArray)
      value = [value];

    const needToNormalize = value.some(v => typeof v !== 'string');

    if (needToNormalize)
      return value.map(v => v.toString());

    return value;
  }

  if (isEmptyValue(value))
    return '';

  if (typeof value === 'string')
    return value;

  return value.toString();
}

export function asArray(values: any): any[] {
  if (values === null || values === undefined)
    return [];

  if (Array.isArray(values))
    return values;

  return [values];
}

export function normalizeOptions(options: IComboboxOption[], optionValue?: string, optionText?: string, optionDetail?: string): NormalizedOption[] {
  if (!options)
    return null;

  optionValue ||= 'value';
  optionText ||= 'text';
  optionDetail ||= 'detailText';

  return options.filter(o => !!o).map(o => {
    const value = o[optionValue];
    const text = o[optionText];
    const detail = o[optionDetail];

    return {
      value: normalizeValue(value, false) as string,
      text: text,
      textSearchToken: generateSearchToken(text),
      detailTextSearchToken: generateSearchToken(detail),
      detailText: detail
    }
  })
}

export function stopPropagation(e: Event) {
  e.stopPropagation();
  e.stopImmediatePropagation()
}