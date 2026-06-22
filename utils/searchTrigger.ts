"use client";

let openSearch: (() => void) | null = null;

export function registerSearchOpener(fn: () => void) {
  openSearch = fn;
}

export function openGlobalSearch() {
  openSearch?.();
}
