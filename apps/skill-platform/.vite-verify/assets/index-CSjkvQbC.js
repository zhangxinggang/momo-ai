import { X as E, I as iM, U as tM } from './icons-B5Lu0sqU.js';
import { br as AM, bp as IM, ba as s, bb as w } from './index-C2avURFS.js';
import { q as N } from './markdown-vendor-DldLOD9R.js';
import { r as c, j as DM, B as n, U as O, S as uM } from './ui-vendor-C-FKu2uc.js';
function eM(M) {
  return /^https?:\/\//i.test(M || '');
}
function l(M) {
  if (Array.isArray(M.original_tags)) return z(M.name, M.original_tags) ? [] : M.original_tags;
  if (M.registry_slug || eM(M.source_url)) {
    const g = M.tags || [];
    return z(M.name, g) ? [] : g;
  }
  return [];
}
function OM(M) {
  const g = Array.isArray(M.original_tags) ? M.original_tags : [],
    I = z(M.name, g) ? new Set(g.map(y)) : new Set(),
    j = new Set(l(M));
  return (M.tags || []).filter((A) => !(j.has(A) || I.has(y(A))));
}
function y(M) {
  return M.trim().toLowerCase();
}
function z(M, g) {
  const L = M.trim()
    .toLowerCase()
    .split(/[-_]/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (L.length < 2 || g.length !== L.length) return !1;
  const I = g.map(y).filter(Boolean);
  if (I.length !== L.length) return !1;
  const j = [...L].sort(),
    A = [...I].sort();
  return j.every((t, i) => t === A[i]);
}
function EM(M) {
  return l(M);
}
function yM(M, g) {
  const L = [],
    I = new Set();
  for (const j of [...M, ...g]) {
    const A = y(j);
    !A || I.has(A) || (I.add(A), L.push(A));
  }
  return L;
}
function b(M) {
  return [...M].sort((g, L) =>
    g.localeCompare(L, 'en', { sensitivity: 'accent', caseFirst: 'upper' }),
  );
}
function Y(M) {
  const g = [],
    L = new Set();
  for (const I of M) {
    const j = y(String(I));
    !j || L.has(j) || (L.add(j), g.push(j));
  }
  return g;
}
function lM(M) {
  const g = new Set();
  for (const L of M)
    for (const I of L.tags || []) {
      const j = y(I);
      j && g.add(j);
    }
  return b([...g]);
}
function C(M, g) {
  const L = M || [];
  return L.length !== g.length ? !1 : L.every((I, j) => I === g[j]);
}
function TM(M, g) {
  const L = y(g);
  if (!L) return null;
  const I = (M.tags || []).filter((A) => y(A) !== L),
    j = (M.original_tags || []).filter((A) => y(A) !== L);
  return C(M.tags, I) && C(M.original_tags, j) ? null : { tags: I, original_tags: j };
}
function cM(M, g, L) {
  const I = Y(g);
  if (I.length === 0) return null;
  if (L) {
    const i = yM(M.tags || [], I);
    return C(M.tags, i) ? null : { tags: i };
  }
  const j = new Set(I),
    A = (M.tags || []).filter((i) => !j.has(y(i))),
    t = (M.original_tags || []).filter((i) => !j.has(y(i)));
  return C(M.tags, A) && C(M.original_tags, t) ? null : { tags: A, original_tags: t };
}
async function aM(M, g, L) {
  return (
    await Promise.allSettled(
      g.map(async (j) => {
        const A = TM(j, M);
        return A ? (await L(j.id, A), !0) : !1;
      }),
    )
  ).filter((j) => j.status === 'fulfilled' && j.value).length;
}
async function bM(M, g, L, I) {
  const j = new Set(g);
  return (
    await Promise.allSettled(
      L.map(async (t) => {
        const i = cM(t, M, j.has(t.id));
        return i ? (await I(t.id, i), !0) : !1;
      }),
    )
  ).filter((t) => t.status === 'fulfilled' && t.value).length;
}
const m =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+QWRvYmUgQWNyb2JhdCBSZWFkZXI8L3RpdGxlPjxwYXRoIGQ9Ik0yMy42MyAxNS4zYy0uNzEtLjc0NS0yLjE2Ni0xLjE3LTQuMjI0LTEuMTctMS4xIDAtMi4zNzcuMTA2LTMuNzYxLjM1NGExOS40NDMgMTkuNDQzIDAgMCAxLTIuMzA3LTIuNjYxYy0uNTMyLS43MS0uOTk0LTEuNDktMS40Mi0yLjIzNi44MTctMi40ODQgMS4yMDctNC41MDcgMS4yMDctNS45NjIgMC0xLjYzMi0uNjAzLTMuMzM2LTIuMzQyLTMuMzM2LS41MzIgMC0xLjA2NS4zMi0xLjM0OS43ODEtLjc4IDEuMzg0LS40MjUgNC40LjkyMyA3LjM4MWE2MC4yNzcgNjAuMjc3IDAgMCAxLTEuNzAzIDQuNTA3Yy0uNTY4IDEuMzQ5LTEuMjA3IDIuNzMzLTEuOTE3IDQuMDFDMi44MzQgMTguNTMuMzE0IDIwLjM0LjAzIDIxLjc1OGMtLjEwNi41MzMuMDcxIDEuMDMuNDYyIDEuNDIuMTQyLjEwNy42MzkuNTMzIDEuNDkuNTMzIDIuNTkgMCA1LjMyMy00LjE4OCA2LjcwNy02LjcwNyAxLjA2NS0uMzU1IDIuMTMtLjcxIDMuMTk0LS45OTRhMzQuOTYzIDM0Ljk2MyAwIDAgMSAzLjQwNy0uNzQ1YzIuNzMyIDIuNDQ4IDUuMTQ1IDIuODM5IDYuMzUyIDIuODM5IDEuNDkgMCAyLjAyMy0uNjA0IDIuMi0xLjEuMzItLjY0LjEwNi0xLjM0OS0uMjEzLTEuNzA0em0tMS40MiAxLjAzYy0uMTA3LjUzMi0uNjQuODg3LTEuMzg0Ljg4Ny0uMjEzIDAtLjM5LS4wMzYtLjYwNC0uMDcxLTEuMzQ4LS4zMi0yLjYyNi0uOTk0LTMuOTAzLTIuMDU5YTE3LjcxNyAxNy43MTcgMCAwIDEgMi45OC0uMjQ4Yy43NDYgMCAxLjM4NS4wMzUgMS44MS4xNDIuNDk3LjEwNiAxLjI3OC40MjYgMS4xIDEuMzQ4em0tNy41MjQtMS42NjhhMzguMDEgMzguMDEgMCAwIDAtMi45NDUuNjc0IDM5LjY4IDM5LjY4IDAgMCAwLTIuNTIuNzQ1IDQwLjA1IDQwLjA1IDAgMCAwIDEuMjA3LTIuNTU1Yy40MjYtLjk5NC43OC0yLjAyMyAxLjEzNi0yLjk4MS4zNTQuNjAzLjc0NSAxLjIwNyAxLjEzNSAxLjczOWE1MC4xMjcgNTAuMTI3IDAgMCAwIDEuOTg3IDIuMzc4ek0xMC4wMzggMS40NmEuNzY4Ljc2OCAwIDAgMSAuNjc0LS40MjVjLjc0NSAwIC44ODcuODUxLjg4NyAxLjUyNiAwIDEuMTM1LS4zNTUgMi44NzQtLjk1OCA0Ljg2MS0xLjAzLTIuNzY4LTEuMS01LjA3NC0uNjAzLTUuOTYyek02LjEzNCAxNy45OTdjLTEuODEgMi45ODEtMy41NDkgNC44MjYtNC42MTMgNC44MjZhLjg3Mi44NzIgMCAwIDEtLjUzMi0uMTc3Yy0uMjEzLS4yMTMtLjMyLS40NjEtLjI0OS0uNzQ1LjIxMy0xLjA2NSAyLjI3MS0yLjU1NSA1LjM5NC0zLjkwNFoiLz48L3N2Zz4=',
  U =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R2l0SHViPC90aXRsZT48cGF0aCBkPSJNMTIgLjI5N2MtNi42MyAwLTEyIDUuMzczLTEyIDEyIDAgNS4zMDMgMy40MzggOS44IDguMjA1IDExLjM4NS42LjExMy44Mi0uMjU4LjgyLS41NzcgMC0uMjg1LS4wMS0xLjA0LS4wMTUtMi4wNC0zLjMzOC43MjQtNC4wNDItMS42MS00LjA0Mi0xLjYxQzQuNDIyIDE4LjA3IDMuNjMzIDE3LjcgMy42MzMgMTcuN2MtMS4wODctLjc0NC4wODQtLjcyOS4wODQtLjcyOSAxLjIwNS4wODQgMS44MzggMS4yMzYgMS44MzggMS4yMzYgMS4wNyAxLjgzNSAyLjgwOSAxLjMwNSAzLjQ5NS45OTguMTA4LS43NzYuNDE3LTEuMzA1Ljc2LTEuNjA1LTIuNjY1LS4zLTUuNDY2LTEuMzMyLTUuNDY2LTUuOTMgMC0xLjMxLjQ2NS0yLjM4IDEuMjM1LTMuMjItLjEzNS0uMzAzLS41NC0xLjUyMy4xMDUtMy4xNzYgMCAwIDEuMDA1LS4zMjIgMy4zIDEuMjMuOTYtLjI2NyAxLjk4LS4zOTkgMy0uNDA1IDEuMDIuMDA2IDIuMDQuMTM4IDMgLjQwNSAyLjI4LTEuNTUyIDMuMjg1LTEuMjMgMy4yODUtMS4yMy42NDUgMS42NTMuMjQgMi44NzMuMTIgMy4xNzYuNzY1Ljg0IDEuMjMgMS45MSAxLjIzIDMuMjIgMCA0LjYxLTIuODA1IDUuNjI1LTUuNDc1IDUuOTIuNDIuMzYuODEgMS4wOTYuODEgMi4yMiAwIDEuNjA2LS4wMTUgMi44OTYtLjAxNSAzLjI4NiAwIC4zMTUuMjEuNjkuODI1LjU3QzIwLjU2NSAyMi4wOTIgMjQgMTcuNTkyIDI0IDEyLjI5N2MwLTYuNjI3LTUuMzczLTEyLTEyLTEyIi8+PC9zdmc+',
  k =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+UGxheXdyaWdodDwvdGl0bGU+PHBhdGggZD0iTTIzLjk5NiA3LjQ2MmMtLjA1Ni44MzctLjI1NyAyLjEzNS0uNzE2IDMuODUtLjk5NSAzLjcxNS00LjI3IDEwLjg3NC0xMC40MiA5LjIyNy02LjE1LTEuNjUtNS40MDctOS40ODctNC40MTItMTMuMjAxLjQ2LTEuNzE2LjkzNC0yLjk0IDEuMzA1LTMuNjk0LjQyLS44NTMuODQ2LS4yODkgMS44MTUuNTIzLjY4NC41NzMgMi40MSAxLjc5MSA1LjAxMSAyLjQ4OCAyLjYwMS42OTcgNC43MDYuNTA2IDUuNTgzLjM1MiAxLjI0NS0uMjE5IDEuODk3LS40OTQgMS44MzQuNDU1Wm0tOS44MDcgMy44NjNzLS4xMjctMS44MTktMS43NzMtMi4yODZjLTEuNjQ0LS40NjctMi42MTMgMS4wNC0yLjYxMyAxLjA0Wm00LjA1OCA0LjUzOS03Ljc2OS0yLjE3MnMuNDQ2IDIuMzA2IDMuMzM4IDMuMTUzYzIuODYyLjgzNiA0LjQzLS45OCA0LjQzLS45ODFabTIuNzAxLTIuNTFzLS4xMy0xLjgxOC0xLjc3My0yLjI4NmMtMS42NDQtLjQ2OS0yLjYxMiAxLjAzOC0yLjYxMiAxLjAzOFpNOC41NyAxOC4yM2MtNC43NDkgMS4yNzktNy4yNjEtNC4yMjQtOC4wMjEtNy4wOEMuMTk3IDkuODMxLjA0NCA4LjgzMi4wMDMgOC4xODhjLS4wNDctLjczLjQ1NS0uNTIgMS40MTUtLjM1NC42NzcuMTE4IDIuMy4yNjEgNC4zMDgtLjI4YTExLjI4IDExLjI4IDAgMCAwIDIuNDEtLjk1NmMtLjA1OC4xOTctLjExNC40LS4xNy42MS0uNDMzIDEuNjE4LS44MjcgNC4wNTUtLjYzMiA2LjQyNi0xLjk3Ni43MzItMi4yNjcgMi40MjMtMi4yNjcgMi40MjNsMi41MjQtLjcxNWMuMjI3IDEuMDAyLjYgMS45ODcgMS4xNSAyLjgzOGE1LjkxNCA1LjkxNCAwIDAgMS0uMTcxLjA0OVptLTQuMTg4LTYuMjk4YzEuMjY1LS4zMzMgMS4zNjMtMS42MzEgMS4zNjMtMS42MzFsLTMuMzc0Ljg4OHMuNzQ1IDEuMDc2IDIuMDEuNzQzWiIvPjwvc3ZnPg==',
  Q =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+TW9kZWwgQ29udGV4dCBQcm90b2NvbDwvdGl0bGU+PHBhdGggZD0iTTEzLjg1IDBhNC4xNiA0LjE2IDAgMCAwLTIuOTUgMS4yMTdMMS40NTYgMTAuNjZhLjgzNS44MzUgMCAwIDAgMCAxLjE4LjgzNS44MzUgMCAwIDAgMS4xOCAwbDkuNDQyLTkuNDQyYTIuNDkgMi40OSAwIDAgMSAzLjU0MSAwIDIuNDkgMi40OSAwIDAgMSAwIDMuNTQxTDguNTkgMTIuOTdsLS4xLjFhLjgzNS44MzUgMCAwIDAgMCAxLjE4LjgzNS44MzUgMCAwIDAgMS4xOCAwbC4xLS4wOTggNy4wMy03LjAzNGEyLjQ5IDIuNDkgMCAwIDEgMy41NDIgMGwuMDQ5LjA1YTIuNDkgMi40OSAwIDAgMSAwIDMuNTRsLTguNTQgOC41NGExLjk2IDEuOTYgMCAwIDAgMCAyLjc1NWwxLjc1MyAxLjc1M2EuODM1LjgzNSAwIDAgMCAxLjE4IDAgLjgzNS44MzUgMCAwIDAgMC0xLjE4bC0xLjc1My0xLjc1M2EuMjY2LjI2NiAwIDAgMSAwLS4zOTRsOC41NC04LjU0YTQuMTg1IDQuMTg1IDAgMCAwIDAtNS45bC0uMDUtLjA1YTQuMTYgNC4xNiAwIDAgMC0yLjk1LTEuMjE4Yy0uMiAwLS40MDEuMDItLjYuMDQ4YTQuMTcgNC4xNyAwIDAgMC0xLjE3LTMuNTUyQTQuMTYgNC4xNiAwIDAgMCAxMy44NSAwbTAgMy4zMzNhLjg0Ljg0IDAgMCAwLS41OS4yNDVMNi4yNzUgMTAuNTZhNC4xODYgNC4xODYgMCAwIDAgMCA1LjkwMiA0LjE4NiA0LjE4NiAwIDAgMCA1LjkwMiAwTDE5LjE2IDkuNDhhLjgzNS44MzUgMCAwIDAgMC0xLjE4LjgzNS44MzUgMCAwIDAtMS4xOCAwbC02Ljk4NSA2Ljk4NGEyLjQ5IDIuNDkgMCAwIDEtMy41NCAwIDIuNDkgMi40OSAwIDAgMSAwLTMuNTRsNi45ODMtNi45ODVhLjgzNS44MzUgMCAwIDAgMC0xLjE4Ljg0Ljg0IDAgMCAwLS41OS0uMjQ1Ii8+PC9zdmc+',
  h =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SFRNTDU8L3RpdGxlPjxwYXRoIGQ9Ik0xLjUgMGgyMWwtMS45MSAyMS41NjNMMTEuOTc3IDI0bC04LjU2NC0yLjQzOEwxLjUgMHptNy4wMzEgOS43NWwtLjIzMi0yLjcxOCAxMC4wNTkuMDAzLjIzLTIuNjIyTDUuNDEyIDQuNDFsLjY5OCA4LjAxaDkuMTI2bC0uMzI2IDMuNDI2LTIuOTEuODA0LTIuOTU1LS44MS0uMTg4LTIuMTFINi4yNDhsLjMzIDQuMTcxTDEyIDE5LjM1MWw1LjM3OS0xLjQ0My43NDQtOC4xNTdIOC41MzF6Ii8+PC9zdmc+',
  p =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+T3BlbkFJPC90aXRsZT48cGF0aCBkPSJNMjIuMjgxOSA5LjgyMTFhNS45ODQ3IDUuOTg0NyAwIDAgMC0uNTE1Ny00LjkxMDggNi4wNDYyIDYuMDQ2MiAwIDAgMC02LjUwOTgtMi45QTYuMDY1MSA2LjA2NTEgMCAwIDAgNC45ODA3IDQuMTgxOGE1Ljk4NDcgNS45ODQ3IDAgMCAwLTMuOTk3NyAyLjkgNi4wNDYyIDYuMDQ2MiAwIDAgMCAuNzQyNyA3LjA5NjYgNS45OCA1Ljk4IDAgMCAwIC41MTEgNC45MTA3IDYuMDUxIDYuMDUxIDAgMCAwIDYuNTE0NiAyLjkwMDFBNS45ODQ3IDUuOTg0NyAwIDAgMCAxMy4yNTk5IDI0YTYuMDU1NyA2LjA1NTcgMCAwIDAgNS43NzE4LTQuMjA1OCA1Ljk4OTQgNS45ODk0IDAgMCAwIDMuOTk3Ny0yLjkwMDEgNi4wNTU3IDYuMDU1NyAwIDAgMC0uNzQ3NS03LjA3Mjl6bS05LjAyMiAxMi42MDgxYTQuNDc1NSA0LjQ3NTUgMCAwIDEtMi44NzY0LTEuMDQwOGwuMTQxOS0uMDgwNCA0Ljc3ODMtMi43NTgyYS43OTQ4Ljc5NDggMCAwIDAgLjM5MjctLjY4MTN2LTYuNzM2OWwyLjAyIDEuMTY4NmEuMDcxLjA3MSAwIDAgMSAuMDM4LjA1MnY1LjU4MjZhNC41MDQgNC41MDQgMCAwIDEtNC40OTQ1IDQuNDk0NHptLTkuNjYwNy00LjEyNTRhNC40NzA4IDQuNDcwOCAwIDAgMS0uNTM0Ni0zLjAxMzdsLjE0Mi4wODUyIDQuNzgzIDIuNzU4MmEuNzcxMi43NzEyIDAgMCAwIC43ODA2IDBsNS44NDI4LTMuMzY4NXYyLjMzMjRhLjA4MDQuMDgwNCAwIDAgMS0uMDMzMi4wNjE1TDkuNzQgMTkuOTUwMmE0LjQ5OTIgNC40OTkyIDAgMCAxLTYuMTQwOC0xLjY0NjR6TTIuMzQwOCA3Ljg5NTZhNC40ODUgNC40ODUgMCAwIDEgMi4zNjU1LTEuOTcyOFYxMS42YS43NjY0Ljc2NjQgMCAwIDAgLjM4NzkuNjc2NWw1LjgxNDQgMy4zNTQzLTIuMDIwMSAxLjE2ODVhLjA3NTcuMDc1NyAwIDAgMS0uMDcxIDBsLTQuODMwMy0yLjc4NjVBNC41MDQgNC41MDQgMCAwIDEgMi4zNDA4IDcuODcyem0xNi41OTYzIDMuODU1OEwxMy4xMDM4IDguMzY0IDE1LjExOTIgNy4yYS4wNzU3LjA3NTcgMCAwIDEgLjA3MSAwbDQuODMwMyAyLjc5MTNhNC40OTQ0IDQuNDk0NCAwIDAgMS0uNjc2NSA4LjEwNDJ2LTUuNjc3MmEuNzkuNzkgMCAwIDAtLjQwNy0uNjY3em0yLjAxMDctMy4wMjMxbC0uMTQyLS4wODUyLTQuNzczNS0yLjc4MThhLjc3NTkuNzc1OSAwIDAgMC0uNzg1NCAwTDkuNDA5IDkuMjI5N1Y2Ljg5NzRhLjA2NjIuMDY2MiAwIDAgMSAuMDI4NC0uMDYxNWw0LjgzMDMtMi43ODY2YTQuNDk5MiA0LjQ5OTIgMCAwIDEgNi42ODAyIDQuNjZ6TTguMzA2NSAxMi44NjNsLTIuMDItMS4xNjM4YS4wODA0LjA4MDQgMCAwIDEtLjAzOC0uMDU2N1Y2LjA3NDJhNC40OTkyIDQuNDk5MiAwIDAgMSA3LjM3NTctMy40NTM3bC0uMTQyLjA4MDVMOC43MDQgNS40NTlhLjc5NDguNzk0OCAwIDAgMC0uMzkyNy42ODEzem0xLjA5NzYtMi4zNjU0bDIuNjAyLTEuNDk5OCAyLjYwNjkgMS40OTk4djIuOTk5NGwtMi41OTc0IDEuNDk5Ny0yLjYwNjctMS40OTk3WiIvPjwvc3ZnPg==',
  G =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q1NTPC90aXRsZT48cGF0aCBkPSJNMCAwdjIwLjE2QTMuODQgMy44NCAwIDAgMCAzLjg0IDI0aDE2LjMyQTMuODQgMy44NCAwIDAgMCAyNCAyMC4xNlYzLjg0QTMuODQgMy44NCAwIDAgMCAyMC4xNiAwWm0xNC4yNTYgMTMuMDhjMS41NiAwIDIuMjggMS4wOCAyLjMwNCAyLjY0aC0xLjYwOGMuMDI0LS4yODgtLjA0OC0uNi0uMTQ0LS44NC0uMDk2LS4xOTItLjI4OC0uMjY0LS41NTItLjI2NC0uNDU2IDAtLjY5Ni4yNjQtLjY5Ni44NC0uMDI0LjU3Ni4yODguODg4Ljc2OCAxLjA4LjcyLjI4OCAxLjYwOC43NDQgMS45MiAxLjI5NnEuNDMyLjY0OC40MzIgMS42NTZjMCAxLjYwOC0uOTEyIDIuNTkyLTIuNDk2IDIuNTkyLTEuNjU2IDAtMi40LTEuMDMyLTIuNDI0LTIuNjg4aDEuNjhjMCAuNzkyLjI2NCAxLjE3Ni43OTIgMS4xNzYuMjY0IDAgLjQ1Ni0uMDcyLjU1Mi0uMjQuMTkyLS4zMTIuMjQtMS4xNzYtLjA0OC0xLjUxMi0uMzEyLS40MDgtLjkxMi0uNi0xLjMyLS44MTZxLS44MjgtLjM5Ni0xLjIyNC0uOTM2Yy0uMjQtLjM2LS4zNi0uODg4LS4zNi0xLjUzNiAwLTEuNDQuOTM2LTIuNDcyIDIuNDI0LTIuNDQ4bTUuNCAwYzEuNTg0IDAgMi4zMDQgMS4wOCAyLjMyOCAyLjY0aC0xLjYwOGMwLS4yODgtLjA0OC0uNi0uMTY4LS44NC0uMDk2LS4xOTItLjI2NC0uMjY0LS41MjgtLjI2NC0uNDggMC0uNzIuMjY0LS43Mi44NHMuMjg4Ljg4OC43OTIgMS4wOGMuNjk2LjI4OCAxLjYwOC43NDQgMS45MiAxLjI5Ni4yNjQuNDMyLjQwOC45ODQuNDA4IDEuNjU2LjAyNCAxLjYwOC0uODg4IDIuNTkyLTIuNDcyIDIuNTkyLTEuNjggMC0yLjQyNC0xLjA1Ni0yLjQ0OC0yLjY4OGgxLjY4YzAgLjc0NC4yNjQgMS4xNzYuNzkyIDEuMTc2LjI2NCAwIC40NTYtLjA3Mi41NTItLjI0LjIxNi0uMzEyLjI2NC0xLjE3Ni0uMDQ4LTEuNTEyLS4yODgtLjQwOC0uODg4LS42LTEuMzItLjgxNi0uNTUyLS4yNjQtLjk2LS41NzYtMS4yLS45MzZzLS4zNi0uODg4LS4zNi0xLjUzNmMtLjAyNC0xLjQ0LjkxMi0yLjQ3MiAyLjQtMi40NDhtLTExLjAzMS4wMThjLjcxMS0uMDA2IDEuNDE5LjE5OCAxLjgzOS42My40MzIuNDMyLjY3MiAxLjEyOC42NDggMS45OTJIOS4zMzZjLjAyNC0uNDU2LS4wOTYtLjc5Mi0uNDMyLS45Ni0uMzEyLS4xNDQtLjc2OC0uMDQ4LS44ODguMjQtLjEyLjI2NC0uMTkyLjU3Ni0uMTY4Ljg2NHYzLjUwNGMwIC43NDQuMjY0IDEuMTI4Ljc2OCAxLjEyOGEuNjUuNjUgMCAwIDAgLjU1Mi0uMjY0Yy4xNjgtLjI0LjE5Mi0uNTUyLjE2OC0uODRoMS43NzZjLjA5NiAxLjYzMi0uOTg0IDIuNzEyLTIuNTY4IDIuNjg4LTEuNTM2IDAtMi40OTYtLjg2NC0yLjQ3Mi0yLjQ3MnYtNC4wMzJjMC0uODE2LjI0LTEuNDQuNjk2LTEuODQ4LjQzMi0uNDA4IDEuMTQ2LS42MjQgMS44NTctLjYzIi8+PC9zdmc+',
  f =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+TGV0J3MgRW5jcnlwdDwvdGl0bGU+PHBhdGggZD0iTTExLjk5MTQgMGEuODgyOS44ODI5IDAgMDAtLjg3MTguODE3djMuMDIwOUEuODgyOS44ODI5IDAgMDAxMiA0LjcyMDdhLjg4MjkuODgyOSAwIDAwLjg4MDMtLjg4MDNWLjgxN2EuODgyOS44ODI5IDAgMDAtLjg4OS0uODE3em03LjcwNDggMy4xMDg5YS44ODA0Ljg4MDQgMCAwMC0uNTIxNC4xNzQybC0yLjM3NCAxLjk0ODJhLjg4MDQuODgwNCAwIDAwLjU1OTIgMS41NjIyLjg3OTQuODc5NCAwIDAwLjU1OTItLjIwMDFsMi4zNzE0LTEuOTUwNmEuODgwNC44ODA0IDAgMDAtLjU5NDQtMS41MzR6bS0xNS4zNzYzLjAxMzNhLjg4MjkuODgyOSAwIDAwLS42MTEgMS41MjA2bDIuMzcgMS45NTA2YS44NzYuODc2IDAgMDAuNTYwNi4yMDAxdi0uMDAyYS44ODA0Ljg4MDQgMCAwMC41NTk3LTEuNTYwMkw0LjgyNzcgMy4yODMxYS44ODI5Ljg4MjkgMCAwMC0uNTA3OC0uMTYxem03LjY1OTggMy4yMjc1YTUuMDQ1NiA1LjA0NTYgMCAwMC01LjAyNjIgNS4wNDU1djEuNDg3Nkg1Ljc4N2EuOTY3Mi45NjcyIDAgMDAtLjk2NDcuOTY0M3Y5LjE4ODdhLjk2NzIuOTY3MiAwIDAwLjk2NDcuOTY0M0gxOC4yMTNhLjk2NzIuOTY3MiAwIDAwLjk2NDMtLjk2NDN2LTkuMTkwN2EuOTY3Mi45NjcyIDAgMDAtLjk2NDMtLjk2MjNoLTEuMTY4NHYtMS40ODc2YTUuMDQ1NiA1LjA0NTYgMCAwMC01LjA2NDktNS4wNDU1em0uMDEyNyAyLjg5MzNhMi4xNTIyIDIuMTUyMiAwIDAxMi4xNTkzIDIuMTUyMnYxLjQ4NzZIOS44NDczdi0xLjQ4NzZhMi4xNTIyIDIuMTUyMiAwIDAxMi4xNDUtMi4xNTIyem03LjM4MTIuNTAzM2EuODgyOS44ODI5IDAgMTAuMDcwNSAxLjc2MzJoMy4wMjY3YS44ODI5Ljg4MjkgMCAwMDAtMS43NjA5SDE5LjQ0NGEuODgyOS44ODI5IDAgMDAtLjA3MDUtLjAwMjN6bS0xNy44NDQ0LjAwMjNhLjg4MjkuODgyOSAwIDAwMCAxLjc2MDloMi45OTgzYS44ODI5Ljg4MjkgMCAwMDAtMS43NjA5em0xMC40NTk2IDYuNzc0NmExLjI3OTIgMS4yNzkyIDAgMDEuNjQxIDIuMzkyNnYxLjI0NTNhLjYyOTguNjI5OCAwIDAxLTEuMjU5NSAwdi0xLjI0NTNhMS4yNzkyIDEuMjc5MiAwIDAxLjYxODUtMi4zOTI2eiIvPjwvc3ZnPg==',
  Z =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+UmVhY3Q8L3RpdGxlPjxwYXRoIGQ9Ik0xNC4yMyAxMi4wMDRhMi4yMzYgMi4yMzYgMCAwIDEtMi4yMzUgMi4yMzYgMi4yMzYgMi4yMzYgMCAwIDEtMi4yMzYtMi4yMzYgMi4yMzYgMi4yMzYgMCAwIDEgMi4yMzUtMi4yMzYgMi4yMzYgMi4yMzYgMCAwIDEgMi4yMzYgMi4yMzZ6bTIuNjQ4LTEwLjY5Yy0xLjM0NiAwLTMuMTA3Ljk2LTQuODg4IDIuNjIyLTEuNzgtMS42NTMtMy41NDItMi42MDItNC44ODctMi42MDItLjMxIDAtLjU5Mi4wNjgtLjgyOC4yMDZDNC45ODIgMi4yNDUgNC42NSAzLjY3MiA1LjE0IDUuODRjLTIuMDcuNjItMy40NDUgMS42NTctMy40NDUgMi45NDYgMCAxLjI5IDEuMzc3IDIuMzI2IDMuNDUgMi45NDUtLjQ5IDIuMTY5LS4xNTkgMy41OTQgMS4xMzUgNC4zLjIzNi4xMjcuNTE2LjE5NS44MjUuMTk1IDEuMzQ2IDAgMy4xMDgtLjk2IDQuODg4LTIuNjIgMS43OCAxLjY1NCAzLjU0MiAyLjYwNCA0Ljg4NyAyLjYwNC4zMSAwIC41OTItLjA2OC44MjgtLjIwNiAxLjI5My0uNzA3IDEuNjI2LTIuMTMzIDEuMTM1LTQuMyAyLjA3LS42MiAzLjQ0Ni0xLjY1OCAzLjQ0Ni0yLjk0NyAwLTEuMjgzLTEuMzc5LTIuMzE2LTMuNDUyLTIuOTM4LjQ5Mi0yLjE3My4xNi0zLjYtMS4xMzQtNC4zMDUtLjIzNi0uMTM4LS41MTctLjIwNi0uODI2LS4yMDZ6bS0uMjIyIDEuNzU0Yy4zODEuMjA4LjYyNy42NjIuNjI3IDEuMjkgMCAxLjI2My0uNzIyIDIuOTg2LTEuOTUgNC43NzZhMjQuNzQ2IDI0Ljc0NiAwIDAgMC0yLjM3LTIuNDYxYy4wMzItLjA0LjA2NS0uMDguMDk4LS4xMTggMS42LTEuNzcgMy4wMTQtMy4xOCAzLjU5NS0zLjQ4N3pNMTIgOC4xYTIyLjcyOCAyMi43MjggMCAwIDEgMi4xNzggMi4yMzJBMjIuNTk0IDIyLjU5NCAwIDAgMSAxMiAxMi41NjZhMjIuMjYyIDIyLjI2MiAwIDAgMS0yLjE3NS0yLjIzNkEyMi41OTQgMjIuNTk0IDAgMCAxIDEyIDguMXptLTQuNjQtNC43NTVjLjA3OS0uMDQ0LjE2NC0uMDY3LjI1NC0uMDY3LjkgMCAyLjM5OCAxLjA3OCAzLjkzIDIuODNhMjAuNDggMjAuNDggMCAwIDAtLjU2LjU0OGMtLjg2Ljg3Mi0xLjY5IDEuODIzLTIuNDYgMi44M0EyMi4wMjQgMjIuMDI0IDAgMCAxIDUuMiA4LjQyYy0uMS0uODEtLjAzOC0xLjQzNS4xOC0xLjc3OC4wODctLjEzOC4yMjQtLjIzNy4zOTMtLjI5NnpNMy4yIDguNzg1YzAtLjYxNi42MS0xLjM4MiAxLjgxLTEuOTYuMDYzLjUyNi4xNyAxLjA4LjMyIDEuNjU0YTI0LjAyNCAyNC4wMjQgMCAwIDAtLjg5NSAzLjMyOGMtMS4wMTYtLjQ1Ni0xLjIzNS0xLjQ5OC0xLjIzNS0yLjAyMiAwLS4zNSAwLS43IDAtMXptMi4xNiA2LjQyN2MtLjM4LS4yMDYtLjYyNi0uNjYtLjYyNi0xLjI4NiAwLTEuMjcuNzI1LTIuOTk2IDEuOTU4LTQuNzlhMjQuNDYgMjQuNDYgMCAwIDAgMi4zNiAyLjQ1M2MtLjAzNi4wNDQtLjA3LjA4Ny0uMTA2LjEzLTEuNiAxLjc2Ny0zLjAxNCAzLjE3NS0zLjU4NiAzLjQ5M3ptMS4wMjYuNjM0Yy42OC0uNjkgMS40NjMtMS41NjUgMi4yOTgtMi41NTdBMjIuMDI0IDIyLjAyNCAwIDAgMSAxMiAxNS45YTIyLjAyNCAyMi4wMjQgMCAwIDEgMy4zMTctMS42MTJjLjgzNS45OTIgMS42MTcgMS44NjYgMi4yOTggMi41NTdhMjAuNDggMjAuNDggMCAwIDAtMi4zNy44MzNBMjIuNTk1IDIyLjU5NSAwIDAgMSAxMiAxNS45YTIyLjU5NSAyMi41OTUgMCAwIDEtMy4yNDUgMS43NzhjLS44MTYtLjM3NS0xLjYxNC0uODA4LTIuMzctMS4yOTJ6bTguMDA3LjE2N2MuMzguMjA3LjYyNy42NjEuNjI3IDEuMjg4IDAgMS4yNjYtLjcyMyAyLjk5LTEuOTUzIDQuNzhhMjQuNDYgMjQuNDYgMCAwIDAtMi4zNi0yLjQ1MyA5LjEgOS4xIDAgMCAwIC4wOTctLjExOGMxLjYtMS43NyAzLjAxNC0zLjE4IDMuNTg5LTMuNDk3em0uNjM0LTEuMDI3YTIyLjAyNCAyMi4wMjQgMCAwIDEgMy4zMTcgMS4wNjZjLjEuODE1LjA0IDEuNDQtLjE3NiAxLjc4My0uMDg3LjEzOC0uMjI0LjIzNy0uMzkzLjI5Ni0uMDc5LjA0NC0uMTY0LjA2Ny0uMjU0LjA2Ny0uOSAwLTIuMzk4LTEuMDc4LTMuOTMtMi44My4xODgtLjE4OC4zNzItLjM4LjU1NC0uNTc3LjMtLjMxMi41OS0uNjMyLjg4Mi0uOTU1bC0uMDAxLjE1ek0yMC44IDE1LjIxNWMwIC42MTYtLjYxIDEuMzgyLTEuODEgMS45NmExMi42NyAxMi42NyAwIDAgMS0uMzItMS42NTQgMjQuMDI0IDI0LjAyNCAwIDAgMCAuODk1LTMuMzI4YzEuMDE2LjQ1NiAxLjIzNSAxLjQ5OCAxLjIzNSAyLjAyMnYxeiIvPjwvc3ZnPg==',
  P =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+UG9zdGdyZVNRTDwvdGl0bGU+PHBhdGggZD0iTTIzLjU2IDE0LjcyYy0uMDYtLjE0LS40OC0uMzQtMS4wMS0uMjMtMS42NS4zNC0yLjI5LjEzLTIuNTQtLjA3IDEuNDktMi41NCAyLjcxLTUuNDggMi44LTYuMDQuMjEtMS4yOS4xMS0yLjE3LS4zMS0yLjY5LS4xMi0uMTQtLjU4LS41MS0xLjE0LS40OS0xLjA4LjA1LTIuMzcuODctMy4wNyAxLjNhNy41NiA3LjU2IDAgMCAwLTEuMzItLjEyYy0uNDctLjAxLS45My4wMi0xLjM4LjEtLjI1LS4xNi0uNi0uMzgtMS4wMS0uNjUtLjg5LS41Ny0xLjU0LS44NC0yLjExLS44Ny0uNTgtLjAzLTEuMDEuMTYtMS4zLjU2LS40My41OS0uMzUgMS41MS0uMSAyLjcyLjA4LjQuMzMgMS40NC43NyAyLjgtLjEyLjE5LS4yMy4zOC0uMzMuNTgtMSAxLjg2LTEuNDMgMy4yOC0xLjM0IDQuMDguMDQuMzYuMTcuNy40Ljk1LjA1LjA1LjExLjEuMTcuMTQtLjYxIDEuMDMtLjk3IDEuODctLjk3IDIuNTEgMCAuNDUuMTYuNzkuNDcgMSAuMjQuMTYuODkuNDYgMS45OC4xNi42Ni0uMTggMS40MS0uNTYgMi4yNS0xLjEzbC4wMi4wMWMuNDYuMTkgMS40OC41NCAyLjU2LjU0LjM2IDAgLjcxLS4wNSAxLjAxLS4xNWwuMDEuMDFjLjA3LjI1LjE0LjQ4LjIyLjY3LjMzLjgzLjc2IDEuMyAxLjI5IDEuNDMuMTIuMDMuMjUuMDUuMzguMDUuNzEgMCAxLjU1LS40OCAyLjU5LTEuNDUuNDgtLjQ1Ljk3LTEuMDIgMS40LTEuNjJhMy4yOCAzLjI4IDAgMCAwIDEuMDEtLjQxYy4yLS4xMy4zOS0uMjguNTUtLjQ2LjI5LS4zNC4zOC0uNzIuMzItMS4xeiIvPjwvc3ZnPg==',
  v =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VGVybWluYWw8L3RpdGxlPjxwYXRoIGQ9Ik0wIDJ2MjBoMjRWMkgwem0yMiAxOEgyVjZoMjB2MTR6TTYgOGw0IDQtNCA0IDEuNCAxLjRMMTIuOCAxMiA3LjQgNi42IDYgOHptNiA4aDZ2MmgtNnYtMnoiLz48L3N2Zz4=',
  H =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+QXJjaGl0ZWN0dXJlPC90aXRsZT48cGF0aCBkPSJNMyAyMVY3bDktNCA5IDR2MTRIM3ptMi0yaDV2LTRoNHY0aDVWOGwtNy0zLjFMNSA4djExem00LTZoNnYtMkg5djJ6bTAtNGg2VjdIOXYyeiIvPjwvc3ZnPg==',
  J =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Qm90PC90aXRsZT48cGF0aCBkPSJNMTIgMmEyIDIgMCAwIDEgMiAyYzAgLjc0LS40IDEuMzktMSAxLjczVjdoMWE3IDcgMCAwIDEgNyA3aDFhMSAxIDAgMCAxIDEgMXYzYTEgMSAwIDAgMS0xIDFoLTF2MWEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtMUgyYTEgMSAwIDAgMS0xLTF2LTNhMSAxIDAgMCAxIDEtMWgxYTcgNyAwIDAgMSA3LTdoMVY1LjczYy0uNi0uMzQtMS0uOTktMS0xLjczYTIgMiAwIDAgMSAyLTJ6TTkgMTVhMSAxIDAgMSAwIDAgMiAxIDEgMCAwIDAgMC0yem02IDBhMSAxIDAgMSAwIDAgMiAxIDEgMCAwIDAgMC0yeiIvPjwvc3ZnPg==',
  R =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+UmVzZWFyY2g8L3RpdGxlPjxwYXRoIGQ9Ik0xNS41IDE0aC0uNzlsLS4yOC0uMjdBNi40NyA2LjQ3IDAgMCAwIDE2IDkuNSA2LjUgNi41IDAgMSAwIDkuNSAxNmMxLjYxIDAgMy4wOS0uNTkgNC4yMy0xLjU3bC4yNy4yOHYuNzlsNSA0Ljk5TDIwLjQ5IDE5bC00Ljk5LTV6bS02IDBDNy4wMSAxNCA1IDExLjk5IDUgOS41UzcuMDEgNSA5LjUgNSAxNCA3LjAxIDE0IDkuNSAxMS45OSAxNCA5LjUgMTR6Ii8+PC9zdmc+',
  W =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q2hhcnQ8L3RpdGxlPjxwYXRoIGQ9Ik0zIDN2MThoMTh2LTJINVYzSDN6bTQgMTJoMlY5SDd2NnptNCAwaDJWNWgtMnYxMHptNCAwaDJWN2gtMnY4eiIvPjwvc3ZnPg==',
  B =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Rm9sZGVyPC90aXRsZT48cGF0aCBkPSJNMTAgNEgydjE2aDIwVjZIMTJsLTItMnptMTAgMTRINFY2aDUuMTdsMiAySDIwdjEweiIvPjwvc3ZnPg==',
  _ =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RG9jdW1lbnQ8L3RpdGxlPjxwYXRoIGQ9Ik02IDJhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOGwtNi02SDZ6bTcgMS41TDE4LjUgOUgxM1YzLjV6TTggMTJoOHYySDh2LTJ6bTAgNGg1djJIOHYtMnoiLz48L3N2Zz4=',
  X =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RGVzaWduPC90aXRsZT48cGF0aCBkPSJNNyAxNGMtMS42NiAwLTMgMS4zNC0zIDMgMCAxLjMxLTEuMTYgMi0yIDIgLjkyIDEuMjIgMi40OSAyIDQgMiAyLjIxIDAgNC0xLjc5IDQtNCAwLTEuNjYtMS4zNC0zLTMtM3ptMTMuNzEtOS4zN2wtMS4zNC0xLjM0YS45OTYuOTk2IDAgMCAwLTEuNDEgMEw5IDEyLjI1IDExLjc1IDE1bDguOTYtOC45NmEuOTk2Ljk5NiAwIDAgMCAwLTEuNDF6Ii8+PC9zdmc+',
  F =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VGhlbWU8L3RpdGxlPjxwYXRoIGQ9Ik0xMiAyQzYuNDkgMiAyIDYuNDkgMiAxMnM0LjQ5IDEwIDEwIDEwYTIuNSAyLjUgMCAwIDAgMi41LTIuNWMwLS42MS0uMjMtMS4yMS0uNjQtMS42N2EuNTI4LjUyOCAwIDAgMS0uMTMtLjMzYzAtLjI4LjIyLS41LjUtLjVIMTZjMy4zMSAwIDYtMi42OSA2LTYgMC00Ljk2LTQuNDktOS0xMC05em0tNS41IDlhMS41IDEuNSAwIDEgMSAwLTMgMS41IDEuNSAwIDAgMSAwIDN6bTMtNGExLjUgMS41IDAgMSAxIDAtMyAxLjUgMS41IDAgMCAxIDAgM3ptNSAwYTEuNSAxLjUgMCAxIDEgMC0zIDEuNSAxLjUgMCAwIDEgMCAzem0zIDRhMS41IDEuNSAwIDEgMSAwLTMgMS41IDEuNSAwIDAgMSAwIDN6Ii8+PC9zdmc+',
  V =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+V3JpdGluZzwvdGl0bGU+PHBhdGggZD0iTTMgMTcuMjVWMjFoMy43NUwxNy44MSA5Ljk0bC0zLjc1LTMuNzVMMyAxNy4yNXpNMjAuNzEgNy4wNGExLjAwMyAxLjAwMyAwIDAgMCAwLTEuNDJsLTIuMzQtMi4zNGExLjAwMyAxLjAwMyAwIDAgMC0xLjQyIDBsLTEuODMgMS44MyAzLjc1IDMuNzUgMS44NC0xLjgyeiIvPjwvc3ZnPg==',
  K =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R2xvYmU8L3RpdGxlPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNy45M2MtMy45NS0uNDktNy0zLjg1LTctNy45MyAwLS42Mi4wOC0xLjIxLjIxLTEuNzlMOSAxNXYxYTIgMiAwIDAgMCAyIDJ2MS45M3ptNi45LTIuNTRBMS45OSAxLjk5IDAgMCAwIDE2IDE2aC0xdi0zYTEgMSAwIDAgMC0xLTFIOHYtMmgyYTEgMSAwIDAgMCAxLTFWN2gyYTIgMiAwIDAgMCAyLTJ2LS40MWE3Ljk4NCA3Ljk4NCAwIDAgMSAyLjkgMTIuOHoiLz48L3N2Zz4=',
  $ =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VGFyZ2V0PC90aXRsZT48cGF0aCBkPSJNMTIgMmExMCAxMCAwIDEgMCAwIDIwIDEwIDEwIDAgMCAwIDAtMjB6bTAgMThhOCA4IDAgMSAxIDAtMTYgOCA4IDAgMCAxIDAgMTZ6bTAtMTRhNiA2IDAgMSAwIDAgMTIgNiA2IDAgMCAwIDAtMTJ6bTAgMTBhNCA0IDAgMSAxIDAtOCA0IDQgMCAwIDEgMCA4em0wLTZhMiAyIDAgMSAwIDAgNCAyIDIgMCAwIDAgMC00eiIvPjwvc3ZnPg==',
  q =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SW1hZ2U8L3RpdGxlPjxwYXRoIGQ9Ik0yMSAzSDNhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE4YTIgMiAwIDAgMCAyLTJWNWEyIDIgMCAwIDAtMi0yek01IDE3bDMuNS00LjUgMi41IDMgMy41LTQuNUwxOSAxN0g1em0xLThhMiAyIDAgMSAxIDQgMCAyIDIgMCAwIDEtNCAweiIvPjwvc3ZnPg==',
  MM =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SWRlYTwvdGl0bGU+PHBhdGggZD0iTTkgMjFoNnYtMUg5djF6bTMtMTlhNyA3IDAgMCAwLTQgMTIuNzJWMTdhMSAxIDAgMCAwIDEgMWg2YTEgMSAwIDAgMCAxLTF2LTIuMjhBNyA3IDAgMCAwIDEyIDJ6bTIuNSAxMS4zOWwtLjUuMzJWMTZoLTR2LTIuMjlsLS41LS4zMkE1IDUgMCAwIDEgMTIgNGE1IDUgMCAwIDEgMi41IDkuMzl6Ii8+PC9zdmc+',
  gM =
    'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RG9ja2VyPC90aXRsZT48cGF0aCBkPSJNMTMuOTgzIDExLjA3OGgyLjExOWEuMTg2LjE4NiAwIDAgMCAuMTg2LS4xODVWOS4wMDZhLjE4Ni4xODYgMCAwIDAtLjE4Ni0uMTg2aC0yLjExOWEuMTg1LjE4NSAwIDAgMC0uMTg1LjE4NXYxLjg4OGMwIC4xMDIuMDgzLjE4NS4xODUuMTg1bS0yLjk1NC01LjQzaDIuMTE4YS4xODYuMTg2IDAgMCAwIC4xODYtLjE4NlYzLjU3NGEuMTg2LjE4NiAwIDAgMC0uMTg2LS4xODVoLTIuMTE4YS4xODUuMTg1IDAgMCAwLS4xODUuMTg1djEuODg0YzAgLjEwMi4wODIuMTg1LjE4NS4xODZtMCAyLjcxNmgyLjExOGEuMTg3LjE4NyAwIDAgMCAuMTg2LS4xODZWNi4yOWEuMTg2LjE4NiAwIDAgMC0uMTg2LS4xODVoLTIuMTE4YS4xODUuMTg1IDAgMCAwLS4xODUuMTg1djEuODg3YzAgLjEwMi4wODIuMTg1LjE4NS4xODZtLTIuOTMgMGgyLjEyYS4xODYuMTg2IDAgMCAwIC4xODQtLjE4NlY2LjI5YS4xODUuMTg1IDAgMCAwLS4xODUtLjE4NUg4LjFhLjE4NS4xODUgMCAwIDAtLjE4NS4xODV2MS44ODdjMCAuMTAyLjA4My4xODUuMTg1LjE4Nm0tMi45NjQgMGgyLjExOWEuMTg2LjE4NiAwIDAgMCAuMTg1LS4xODZWNi4yOWEuMTg1LjE4NSAwIDAgMC0uMTg1LS4xODVINS4xMzZhLjE4Ni4xODYgMCAwIDAtLjE4Ni4xODV2MS44ODdjMCAuMTAyLjA4NC4xODUuMTg2LjE4Nm01Ljg5MyAyLjcxNWgyLjExOGEuMTg2LjE4NiAwIDAgMCAuMTg2LS4xODVWOS4wMDZhLjE4Ni4xODYgMCAwIDAtLjE4Ni0uMTg2aC0yLjExOGEuMTg1LjE4NSAwIDAgMC0uMTg1LjE4NXYxLjg4OGMwIC4xMDIuMDgyLjE4NS4xODUuMTg1bS0yLjkzIDBoMi4xMmEuMTg1LjE4NSAwIDAgMCAuMTg0LS4xODVWOS4wMDZhLjE4NS4xODUgMCAwIDAtLjE4NC0uMTg2aC0yLjEyYS4xODUuMTg1IDAgMCAwLS4xODQuMTg1djEuODg4YzAgLjEwMi4wODMuMTg1LjE4NS4xODVtLTIuOTY0IDBoMi4xMTlhLjE4NS4xODUgMCAwIDAgLjE4NS0uMTg1VjkuMDA2YS4xODUuMTg1IDAgMCAwLS4xODUtLjE4NmgtMi4xMTlhLjE4NS4xODUgMCAwIDAtLjE4NS4xODV2MS44ODhjMCAuMTAyLjA4My4xODUuMTg1LjE4NW0tMi45MiAwaDIuMTJhLjE4NS4xODUgMCAwIDAgLjE4NC0uMTg1VjkuMDA2YS4xODUuMTg1IDAgMCAwLS4xODQtLjE4NmgtMi4xMmEuMTg1LjE4NSAwIDAgMC0uMTg0LjE4NXYxLjg4OGMwIC4xMDIuMDgyLjE4NS4xODUuMTg1TTIzLjc2MyA5Ljg5Yy0uMDY1LS4wNTEtLjY3Mi0uNTEtMS45NTQtLjUxLS4zMzguMDAxLS42NzYuMDMtMS4wMS4wODctLjI0OC0xLjctMS42NTMtMi41My0xLjcxNi0yLjU2NmwtLjM0NC0uMTk5LS4yMjYuMzI3Yy0uMjg0LjQzOC0uNDkuOTIyLS42MTIgMS40My0uMjMuOTctLjA5IDEuODgyLjQwMyAyLjY2MS0uNTk1LjMzMi0xLjU1LjQxMy0xLjc0NC40MkguNzUxYS43NTEuNzUxIDAgMCAwLS43NS43NDggMTEuMzc2IDExLjM3NiAwIDAgMCAuNjkyIDQuMDYyYy41NDUgMS40MjggMS4zNTUgMi40OCAyLjQxIDMuMTI0IDEuMTguNzIzIDMuMSAxLjEzNyA1LjI3NSAxLjEzNy45ODMuMDAzIDEuOTYzLS4wODYgMi45My0uMjY2YTEyLjI0OCAxMi4yNDggMCAwIDAgMy44MjMtMS4zODljLjk4LS41NjcgMS44Ni0xLjI4OCAyLjYxLTIuMTM2IDEuMjUyLTEuNDE4IDEuOTk4LTIuOTk3IDIuNTUzLTQuNGguMjIxYzEuMzcyIDAgMi4yMTUtLjU0OSAyLjY4LTEuMDA5LjMwOS0uMjkzLjU1LS42NS43MDctMS4wNDZsLjA5OC0uMjg4WiIvPjwvc3ZnPg==',
  SM = [
    '#f2d6de',
    '#e8d9f7',
    '#dce8ff',
    '#d9efe7',
    '#f6e3d3',
    '#f5e6bf',
    '#dceff5',
    '#e7e4fb',
    '#f2dfcf',
    '#dfe7ce',
    '#eadff0',
    '#dce7e6',
  ],
  nM = [
    '#4f2d3b',
    '#4a3559',
    '#30435f',
    '#27473f',
    '#5b4032',
    '#5c4b22',
    '#28414f',
    '#38385f',
    '#5a4338',
    '#465032',
    '#514159',
    '#364748',
  ],
  CM = [
    { id: 'document', name: 'Document', iconUrl: _, background: '#efe6dc' },
    { id: 'folder', name: 'IFolder', iconUrl: B, background: '#dce8ff' },
    { id: 'pdf', name: 'PDF', iconUrl: m, background: '#e8d7f3' },
    { id: 'github', name: 'GitHub', iconUrl: U, background: '#e1e4fb' },
    { id: 'terminal', name: 'Terminal', iconUrl: v, background: '#dce7e6' },
    { id: 'mcp', name: 'MCP', iconUrl: Q, background: '#d6ece7' },
    { id: 'html', name: 'HTML', iconUrl: h, background: '#f5ddd2' },
    { id: 'css', name: 'CSS', iconUrl: G, background: '#f2d6de' },
    { id: 'react', name: 'React', iconUrl: Z, background: '#d9edf7' },
    { id: 'docker', name: 'Docker', iconUrl: gM, background: '#d9e5ff' },
    { id: 'database', name: 'PostgreSQL', iconUrl: P, background: '#dfe7ce' },
    { id: 'chart', name: 'Chart', iconUrl: W, background: '#ece0f4' },
    { id: 'research', name: 'Research', iconUrl: R, background: '#d8ebed' },
    { id: 'target', name: 'Target', iconUrl: $, background: '#f5e6bf' },
    { id: 'image', name: 'Image', iconUrl: q, background: '#dce8ff' },
    { id: 'design', name: 'Design', iconUrl: X, background: '#f2d6de' },
    { id: 'palette', name: 'Palette', iconUrl: F, background: '#eadff0' },
    { id: 'playwright', name: 'Playwright', iconUrl: k, background: '#e6d9f5' },
    { id: 'architecture', name: 'Architecture', iconUrl: H, background: '#dbe8e7' },
    { id: 'globe', name: 'Globe', iconUrl: K, background: '#d8eef0' },
    { id: 'lightbulb', name: 'Idea', iconUrl: MM, background: '#f3e4b8' },
    { id: 'pen', name: 'Writing', iconUrl: V, background: '#f2dfcf' },
    { id: 'security', name: 'Security', iconUrl: f, background: '#e4dcf7' },
    { id: 'bot', name: 'Bot', iconUrl: J, background: '#dce7ff' },
    { id: 'openai', name: 'OpenAI', iconUrl: p, background: '#e9dfd0' },
  ],
  xM = [
    { id: 'document', name: 'Document', iconUrl: _, background: '#5b463b' },
    { id: 'folder', name: 'IFolder', iconUrl: B, background: '#334766' },
    { id: 'pdf', name: 'PDF', iconUrl: m, background: '#4c3b63' },
    { id: 'github', name: 'GitHub', iconUrl: U, background: '#39425f' },
    { id: 'terminal', name: 'Terminal', iconUrl: v, background: '#314646' },
    { id: 'mcp', name: 'MCP', iconUrl: Q, background: '#284842' },
    { id: 'html', name: 'HTML', iconUrl: h, background: '#5d4036' },
    { id: 'css', name: 'CSS', iconUrl: G, background: '#5b3441' },
    { id: 'react', name: 'React', iconUrl: Z, background: '#224a5b' },
    { id: 'docker', name: 'Docker', iconUrl: gM, background: '#304c6d' },
    { id: 'database', name: 'PostgreSQL', iconUrl: P, background: '#475536' },
    { id: 'chart', name: 'Chart', iconUrl: W, background: '#4a405d' },
    { id: 'research', name: 'Research', iconUrl: R, background: '#29494e' },
    { id: 'target', name: 'Target', iconUrl: $, background: '#5f5129' },
    { id: 'image', name: 'Image', iconUrl: q, background: '#304863' },
    { id: 'design', name: 'Design', iconUrl: X, background: '#5d3642' },
    { id: 'palette', name: 'Palette', iconUrl: F, background: '#503f5d' },
    { id: 'playwright', name: 'Playwright', iconUrl: k, background: '#4b3c5f' },
    { id: 'architecture', name: 'Architecture', iconUrl: H, background: '#344a4a' },
    { id: 'globe', name: 'Globe', iconUrl: K, background: '#284953' },
    { id: 'lightbulb', name: 'Idea', iconUrl: MM, background: '#5a4a25' },
    { id: 'pen', name: 'Writing', iconUrl: V, background: '#5c4337' },
    { id: 'security', name: 'Security', iconUrl: f, background: '#433f5f' },
    { id: 'bot', name: 'Bot', iconUrl: J, background: '#344864' },
    { id: 'openai', name: 'OpenAI', iconUrl: p, background: '#54493f' },
  ];
function YM({ name: M, iconUrl: g, iconEmoji: L, iconBackground: I, onChange: j }) {
  const A = IM((u) => u.isDarkMode),
    t = c.useMemo(() => (A ? xM : CM), [A]),
    i = c.useMemo(() => (A ? nM : SM), [A]),
    a = (u) => {
      const T = new FileReader();
      return (
        (T.onload = () => {
          const S = typeof T.result == 'string' ? T.result : '';
          S && j({ iconUrl: S, iconEmoji: void 0, iconBackground: I });
        }),
        T.readAsDataURL(u),
        O.LIST_IGNORE
      );
    };
  return N.jsxs('div', {
    className: 'border-border bg-muted/10 dark:bg-muted/5 space-y-4 rounded-xl border p-4',
    children: [
      N.jsxs('div', {
        className: 'flex items-start gap-4',
        children: [
          N.jsx('div', {
            className: 'shrink-0',
            children: N.jsx(w, {
              iconUrl: g,
              iconEmoji: L,
              backgroundColor: I,
              name: M || 'ISkill',
              size: 'xl',
            }),
          }),
          N.jsxs('div', {
            className: 'min-w-0 flex-1 space-y-2',
            children: [
              N.jsxs('div', {
                children: [
                  N.jsx('div', {
                    className: 'text-foreground text-sm font-medium',
                    children: '图标',
                  }),
                  N.jsx('p', {
                    className: 'text-muted-foreground mt-1 text-xs',
                    children: '可以上传自己的图标，或从预置图标里直接选择。',
                  }),
                ],
              }),
              N.jsxs('div', {
                className: 'flex flex-wrap gap-2',
                children: [
                  N.jsx(O, {
                    showUploadList: !1,
                    accept: 'image/png,image/jpeg,image/webp,image/svg+xml',
                    beforeUpload: a,
                    children: N.jsx(n, {
                      size: 'small',
                      icon: N.jsx(tM, { className: 'h-3.5 w-3.5' }),
                      className:
                        'border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent inline-flex h-auto items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium',
                      children: '上传图标',
                    }),
                  }),
                  N.jsx(n, {
                    size: 'small',
                    onClick: () =>
                      j({ iconUrl: void 0, iconEmoji: void 0, iconBackground: void 0 }),
                    icon: N.jsx(E, { className: 'h-3.5 w-3.5' }),
                    className:
                      'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-auto items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium',
                    children: '清空',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      N.jsxs('div', {
        children: [
          N.jsx('div', {
            className: 'text-muted-foreground mb-2 text-xs font-medium uppercase tracking-[0.2em]',
            children: '预置图标',
          }),
          N.jsxs('div', {
            className: 'grid grid-cols-5 gap-2 md:grid-cols-8',
            children: [
              t.map((u) => {
                const T = g === u.iconUrl && !L;
                return N.jsx(
                  n,
                  {
                    type: 'text',
                    onClick: () =>
                      j({
                        iconUrl: u.iconUrl,
                        iconEmoji: void 0,
                        iconBackground: I || u.background,
                      }),
                    className: `h-auto rounded-xl border p-2 ${T ? 'border-primary bg-primary/10 dark:bg-primary/15 shadow-[0_0_0_1px_rgba(96,165,250,0.2)]' : 'border-border bg-background/80 dark:bg-background/40 hover:border-primary/40 hover:bg-accent/60'}`,
                    title: u.name,
                    children: N.jsx('div', {
                      className: 'flex items-center justify-center',
                      children: N.jsx(w, {
                        iconUrl: u.iconUrl,
                        backgroundColor: u.background,
                        name: u.name,
                        size: 'md',
                      }),
                    }),
                  },
                  u.id,
                );
              }),
              N.jsx(n, {
                type: 'text',
                onClick: () => j({ iconUrl: void 0, iconEmoji: void 0, iconBackground: void 0 }),
                className: `h-auto rounded-xl border p-2 ${!g && !L ? 'border-primary bg-primary/10 dark:bg-primary/15 shadow-[0_0_0_1px_rgba(96,165,250,0.2)]' : 'border-border bg-background/80 dark:bg-background/40 hover:border-primary/40 hover:bg-accent/60'}`,
                title: '使用默认图标',
                children: N.jsx('div', {
                  className:
                    'bg-muted/80 dark:bg-muted/40 text-muted-foreground mx-auto flex h-10 w-10 items-center justify-center rounded-lg',
                  children: N.jsx(iM, { className: 'h-4 w-4' }),
                }),
              }),
            ],
          }),
        ],
      }),
      N.jsxs('div', {
        children: [
          N.jsx('div', {
            className: 'text-muted-foreground mb-2 text-xs font-medium uppercase tracking-[0.2em]',
            children: '图标背景',
          }),
          N.jsx('p', {
            className: 'text-muted-foreground mb-3 text-xs',
            children: '为图标选择一个更稳定的背景色，详情页里不会再出现悬浮阴影效果。',
          }),
          N.jsxs('div', {
            className: 'flex flex-wrap gap-2',
            children: [
              i.map((u) => {
                const T = I === u;
                return N.jsx(
                  n,
                  {
                    type: 'text',
                    onClick: () => j({ iconUrl: g, iconEmoji: L, iconBackground: u }),
                    className: `h-9 min-w-9 rounded-xl border p-0 ${T ? 'border-primary ring-primary/30 ring-2' : 'border-border hover:border-primary/40'}`,
                    style: { backgroundColor: u },
                    title: u,
                  },
                  u,
                );
              }),
              N.jsx(n, {
                size: 'small',
                onClick: () => j({ iconUrl: g, iconEmoji: L, iconBackground: void 0 }),
                className: `inline-flex h-9 items-center rounded-xl border px-3 text-xs font-medium ${I ? 'border-border bg-background/80 dark:bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground' : 'border-primary bg-primary/10 text-primary dark:bg-primary/15'}`,
                children: '默认',
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
const r = {
  'tag-select': '_tag-select_1iim7_1',
  'tag-select-option': '_tag-select-option_1iim7_4',
  'tag-select-option-label': '_tag-select-option-label_1iim7_11',
  'tag-select-option-delete': '_tag-select-option-delete_1iim7_19',
};
function dM(M) {
  (M.preventDefault(), M.stopPropagation());
}
function rM({
  value: M,
  options: g,
  placeholder: L = '选择已有标签，或输入后按回车新建',
  disabled: I = !1,
  size: j,
  className: A,
  onChange: t,
  onClick: i,
}) {
  const { showToast: a } = AM(),
    u = s((D) => D.skills),
    T = s((D) => D.updateSkill),
    S = c.useMemo(() => {
      const D = new Set([...g, ...M].map((e) => y(e)).filter(Boolean));
      return b([...D]).map((e) => ({ label: e, value: e }));
    }, [g, M]),
    x = c.useCallback(
      (D) => {
        t(Y(D));
      },
      [t],
    ),
    d = c.useCallback(
      async (D) => {
        const e = y(D);
        if (!e) return;
        t(M.filter((LM) => y(LM) !== e));
        const o = await aM(e, u, T);
        o > 0 && a(`已删除标签「${e}」，并解除 ${o} 个技能的关联`);
      },
      [t, a, u, T, M],
    ),
    jM = c.useCallback(
      (D) => {
        (D.preventDefault(), D.stopPropagation());
        const e = D.currentTarget.dataset.tag;
        e && d(e);
      },
      [d],
    ),
    NM = c.useCallback(
      (D) => {
        if (D.key !== 'Enter' && D.key !== ' ') return;
        (D.preventDefault(), D.stopPropagation());
        const e = D.currentTarget.dataset.tag;
        e && d(e);
      },
      [d],
    );
  return N.jsx('div', {
    className: A,
    onClick: i,
    children: N.jsx(uM, {
      className: r['tag-select'],
      disabled: I,
      mode: 'tags',
      optionFilterProp: 'label',
      popupMatchSelectWidth: !0,
      optionRender: (D) =>
        N.jsxs('div', {
          className: r['tag-select-option'],
          children: [
            N.jsx('span', { className: r['tag-select-option-label'], children: D.label }),
            N.jsx(DM, {
              title: '删除',
              children: N.jsx('span', {
                'aria-label': `删除标签 ${String(D.value ?? '')}`,
                className: r['tag-select-option-delete'],
                'data-tag': String(D.value ?? ''),
                onClick: jM,
                onKeyDown: NM,
                onMouseDown: dM,
                role: 'button',
                tabIndex: 0,
                children: N.jsx(E, { className: 'h-3.5 w-3.5' }),
              }),
            }),
          ],
        }),
      options: S,
      placeholder: L,
      size: j,
      tokenSeparators: [','],
      value: M,
      onChange: x,
    }),
  });
}
function mM({
  value: M,
  options: g,
  label: L = '标签（可选）',
  placeholder: I,
  disabled: j,
  compact: A = !1,
  bordered: t = !1,
  size: i,
  className: a,
  onChange: u,
  onClick: T,
}) {
  const S = i ?? (A ? 'small' : void 0),
    x = N.jsxs('div', {
      className: a,
      children: [
        L
          ? N.jsx('label', {
              className: A
                ? 'text-foreground mb-1.5 block text-[11px] font-medium'
                : 'text-foreground mb-2 block text-sm font-medium',
              children: L,
            })
          : null,
        N.jsx(rM, {
          disabled: j,
          options: g,
          placeholder: I,
          size: S,
          value: M,
          onChange: u,
          onClick: T,
        }),
      ],
    });
  return t
    ? N.jsx('div', {
        className: 'border-border bg-accent/20 space-y-2 rounded-xl border p-3',
        children: x,
      })
    : x;
}
export { rM as a, y as b, lM as c, YM as d, OM as g, yM as m, Y as n, bM as p, EM as r, mM as S };
