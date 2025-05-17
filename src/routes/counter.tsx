import { createSignal, createMemo } from "solid-js";

export default function Counter() {
  // 创建一个响应式信号，初始值为 2
  const [num, setNum] = createSignal(2);

  // 使用 createMemo 记忆平方计算结果
  const squared = createMemo(
    (prev) => {
      const current = num();
      return current * current;
    },
    undefined, // 无初始值（第一次调用时 prev 为 undefined）
    { equals: (prev, next) => prev === next } // 仅当结果变化时更新
  );

  return (
    <div>
      <button onClick={() => setNum(num() + 1)}>加 1</button>
      <button onClick={() => setNum(-num())}>取反</button>
      <p>当前数值: {num()}</p>
      <p>平方结果: {squared()}</p>
    </div>
  );
}
