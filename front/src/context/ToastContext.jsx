import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idc = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = "ok") => {
    const id = ++idc;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-[floaty_0.3s_ease] rounded-xl border px-5 py-3 text-sm font-medium shadow-card backdrop-blur ${
              t.type === "erro"
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-volt/40 bg-volt/10 text-volt"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
