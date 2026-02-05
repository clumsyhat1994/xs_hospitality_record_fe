// export function getStr(sp, key, def = "") {
//   const v = sp.get(key);
//   return v == null ? def : v;
// }

// export function getNum(sp, key, def) {
//   const v = sp.get(key);
//   const n = Number(v);
//   return Number.isFinite(n) ? n : def;
// }

export function setOrDelete(sp, key, value) {
  const s = value == null ? "" : String(value).trim();
  if (!s) sp.delete(key);
  else sp.set(key, s);
}

export function setParams(sp, key, value) {
  const s = value == null ? "" : String(value).trim();
  if (s) sp.set(key, s);
}
