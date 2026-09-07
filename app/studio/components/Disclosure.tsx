import { useState, type ReactNode } from 'react';

export function Disclosure({
  title,
  description,
  children,
  defaultOpen = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details open={open} className="group rounded-xl border border-gray-800 bg-gray-950/40">
      <summary
        onClick={(event) => {
          event.preventDefault();
          setOpen((current) => !current);
        }}
        className="min-h-12 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-gray-200 focus-visible:outline-2 focus-visible:outline-[#4fd1c5]"
      >
        {title}
        {description ? <span className="ml-2 text-xs font-normal text-gray-400">{description}</span> : null}
      </summary>
      <div className="space-y-4 border-t border-gray-800 p-4">{children}</div>
    </details>
  );
}
