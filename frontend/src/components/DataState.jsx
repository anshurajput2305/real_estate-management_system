export const LoadingGrid = () => (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div className="panel p-4" key={index}>
        <div className="skeleton aspect-[4/3] w-full" />
        <div className="mt-4 h-4 w-2/3 skeleton" />
        <div className="mt-3 h-4 w-1/2 skeleton" />
      </div>
    ))}
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', text = 'When data is available, it will show up here.' }) => (
  <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
    <h3 className="text-lg font-bold text-navy">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-slate-500">{text}</p>
  </div>
);
