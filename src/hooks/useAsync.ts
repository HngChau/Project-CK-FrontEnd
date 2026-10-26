import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import type { AsyncState } from '../types';

// Chạy một hàm async khi deps đổi; trả về { data, loading, error }.
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (alive) setState({ data: null, loading: false, error: e instanceof Error ? e : new Error(String(e)) });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
