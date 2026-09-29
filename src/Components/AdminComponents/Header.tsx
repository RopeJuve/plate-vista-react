import type { ReactNode } from "react";

/** Page title for every admin screen, with room for the page's own actions. */
const Header = ({
  title,
  description,
  actions,
}: {
  category?: string;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
    <div className="min-w-0">
      <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.025em] text-ink md:text-[2.125rem]">
        {title}
      </h1>
      {description && <p className="mt-1 max-w-2xl text-[0.95rem] text-ink-soft">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default Header;
