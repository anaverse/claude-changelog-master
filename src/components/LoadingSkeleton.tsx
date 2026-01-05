export function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
        >
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="p-4 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
