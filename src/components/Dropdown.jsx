import { useEffect, useRef, useState } from "react";

export default function Dropdown({ button, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        {button}
      </button>

      {open && (
        <div
          className={
            "absolute mt-2 min-w-[220px] rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 " +
            "bg-white/95 dark:bg-zinc-950/95 backdrop-blur shadow-lg p-2 z-50 " +
            (align === "left" ? "left-0" : "right-0")
          }
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}
