import { createContext, useContext, useMemo, useState } from "react";
import { useUi } from "./UiContext";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const { t } = useUi();
  const [state, setState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    danger: false,
    resolve: null,
  });

  function confirm({ title, message, confirmText, cancelText, danger }) {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: title || "",
        message: message || "",
        confirmText: confirmText || t("delete"),
        cancelText: cancelText || "Cancel",
        danger: Boolean(danger),
        resolve,
      });
    });
  }

  function close(result) {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }

  const value = useMemo(() => ({ confirm }), []);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => close(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xl p-5">

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {state.title}
            </h3>

            {state.message && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {state.message}
              </p>
            )}

            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm"
              >
                {state.cancelText}
              </button>

              <button
                onClick={() => close(true)}
                className={
                  "px-4 py-2 rounded-2xl text-sm " +
                  (state.danger
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100")
                }
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
}
