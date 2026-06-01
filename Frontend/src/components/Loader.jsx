export default function Loader({ size = 'md', fullScreen = false }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-9 w-9 border-3',
    lg: 'h-14 w-14 border-4',
  };

  const spinner = (
    <div
      className={`${sizes[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {spinner}
    </div>
  );
}
