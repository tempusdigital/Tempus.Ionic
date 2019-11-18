import { EventEmitter } from "@stencil/core";

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

export function isCore(win: Window) {
  const width = win.innerWidth;
  return (width >= 768);
}

export function isEmptyValue(value: any) {
  if (Array.isArray(value))
    return value.length <= 0;

  return value === null || value === undefined || value === '';
}

export function normalizeValue(value: any): string | string[] {
  if (isEmptyValue(value))
    return '';

  if (typeof value === 'string')
    return value;

  if (Array.isArray(value)) {
    let needToNormalize = value.some(v => typeof v !== 'string');

    if (!needToNormalize)
      return value;

    return value.map(v => v.toString());
  }

  return value.toString();
}

export function asArray(values: any): any[] {
  if (values === null || values === undefined)
    return [];

  if (Array.isArray(values))
    return values;

  return [values];
}
