"use client";

import { useEffect } from "react";

export default function AuthTemplate({ children }) {
  useEffect(() => { document.documentElement.classList.remove("auth-leaving"); }, []);
  return <div className="auth-enter">{children}</div>;
}
