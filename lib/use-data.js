"use client";
import { createContext, createElement, useContext, useEffect, useState } from "react";
import { getData } from "@/lib/api";
const DemoContext = createContext(null);
const IdentityContext = createContext(null);
export function DemoProvider({ children }) {
  const [profile, setProfile] = useState("agent");
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    getData().then(data => { if (alive) setState({ data, loading: false, error: null }); }).catch(error => { if (alive) setState({ data: null, loading: false, error }); });
    const update = () => setVersion(value => value + 1);
    window.addEventListener("ccapac:change", update);
    window.addEventListener("storage", update);
    return () => { alive = false; window.removeEventListener("ccapac:change", update); window.removeEventListener("storage", update); };
  }, [version]);
  function reload() { setState({ data: null, loading: true, error: null }); setVersion(value => value + 1); }
  return createElement(IdentityContext.Provider, { value: { profile, setProfile } }, createElement(DemoContext.Provider, { value: { ...state, reload } }, children));
}
export function useData() { return useContext(DemoContext); }
export function useDemoIdentity() { return useContext(IdentityContext); }