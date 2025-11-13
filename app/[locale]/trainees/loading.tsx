export default function TraineesLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Table Header Actions Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 pb-3 border-b">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(8)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7 gap-4 py-3 border-b">
              {[...Array(7)].map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-6">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
