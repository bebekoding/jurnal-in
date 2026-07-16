"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PARTICIPANTS } from "@/lib/participants";

const KEY = "jurnal.name";

type IdentityValue = {
  name: string | null;
  ready: boolean;
  setName: (n: string) => void;
  clear: () => void;
};

const IdentityContext = createContext<IdentityValue | null>(null);

export function useIdentity(): IdentityValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within IdentityProvider");
  return ctx;
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved && (PARTICIPANTS as readonly string[]).includes(saved)) {
      setNameState(saved);
    }
    setReady(true);
  }, []);

  function setName(n: string) {
    localStorage.setItem(KEY, n);
    setNameState(n);
  }
  function clear() {
    localStorage.removeItem(KEY);
    setNameState(null);
  }

  return (
    <IdentityContext.Provider value={{ name, ready, setName, clear }}>
      {children}
    </IdentityContext.Provider>
  );
}
