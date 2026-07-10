// meyvetabagi - hash router + refresh indirection (views trigger re-render without importing app.js).
export function route() { return (location.hash.replace('#/', '') || 'bugun').split('/')[0]; }
export function param() { return (location.hash.split('/')[2]) || null; }

let _render = () => {};
export function setRender(fn) { _render = fn; }
export function refresh() { _render(); }
