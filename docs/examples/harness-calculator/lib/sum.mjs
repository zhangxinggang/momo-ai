export function sum(a,b) { if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('请输入有限数值'); const value=a+b; if (!Number.isFinite(value)) throw new Error('结果超过数值范围'); return {value}; }
