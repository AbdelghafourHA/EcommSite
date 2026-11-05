// src/components/Skeleton.jsx
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="aspect-square bg-stone-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-stone-200 rounded animate-pulse w-1/2" />
        <div className="h-5 bg-stone-200 rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-3 w-12 bg-stone-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
