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

export function isTablet(win: Window) {
  const width = win.innerWidth;
  return (width >= 768);
}

