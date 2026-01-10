export function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="card-brutal overflow-hidden"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="px-5 py-4 bg-brutal-secondary/10 border-b-brutal">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-brutal-secondary/30 animate-pulse" />
                <div className="w-24 h-5 bg-brutal-secondary/30 animate-pulse" />
                <div className="w-32 h-4 bg-brutal-secondary/30 animate-pulse" />
              </div>
              <div className="w-20 h-4 bg-brutal-secondary/30 animate-pulse" />
            </div>
          </div>
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-start gap-3" style={{ animationDelay: `${j * 50}ms` }}>
                <div className="w-6 h-6 bg-brutal-secondary/20 animate-pulse" />
                <div className="flex-1 h-4 bg-brutal-secondary/20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
