const SkeletonCard = () => {
  return (
    <div className="flex animate-pulse gap-4 border-b border-dashed border-ink/10 py-4" aria-hidden="true">
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="h-4 w-2/3 rounded bg-ink/10" />
        <div className="h-3 w-full rounded bg-ink/[0.07]" />
        <div className="h-3 w-4/5 rounded bg-ink/[0.07]" />
        <div className="mt-1 h-4 w-16 rounded bg-ink/10" />
      </div>
      <div className="h-24 w-24 shrink-0 rounded-lg bg-ink/[0.07]" />
    </div>
  );
};

export default SkeletonCard;
