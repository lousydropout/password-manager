export const postMessage = (key: string, value: string) =>
  window.postMessage({ type: 'TO_EXTENSION', key, value }, window.location.origin)
