import { useCallback, useSyncExternalStore } from "react";

type Props<T> = {
  key: string;
  defaultValue?: T | null;
};

export default function useLocalStorage<T>(props: { key: string; defaultValue: T }): {
  save: (value: T) => void;
  value: T;
};
export default function useLocalStorage<T>(props: { key: string }): {
  save: (value: T) => void;
  value: T | null;
};

export default function useLocalStorage<T>({ key, defaultValue = null }: Props<T>) {
  const eventKey = `local-storage-${key}`;

  const getSnapshot = useCallback(() => {
    return localStorage.getItem(key);
  }, [key]);

  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener(eventKey, onChange);
      return () => window.removeEventListener(eventKey, onChange);
    },
    [eventKey],
  );

  const valueRaw = useSyncExternalStore(subscribe, getSnapshot);

  const save = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(eventKey));
  };

  let currentValue = null;
  if (valueRaw !== null) {
    currentValue = JSON.parse(valueRaw) as T;
  }

  return {
    save,
    value: currentValue ?? defaultValue,
  };
}
