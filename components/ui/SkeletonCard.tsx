export default function SkeletonCard() {
  return (
    <article className="rounded-card shadow-card bg-white overflow-hidden">
      {/* Image placeholder */}
      <div className="skeleton h-44 w-full rounded-none" />

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Title line */}
        <div className="skeleton h-4 w-3/4 rounded" />

        {/* Subtitle / description line */}
        <div className="skeleton h-3 w-full rounded" />

        {/* Short third line */}
        <div className="skeleton h-3 w-1/2 rounded" />

        {/* Price row */}
        <div className="flex justify-end pt-1">
          <div className="skeleton h-5 w-16 rounded" />
        </div>
      </div>
    </article>
  );
}
