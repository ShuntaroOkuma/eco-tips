export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-pulse-slow flex space-x-4">
        <div className="h-12 w-12 bg-green-200 rounded-full"></div>
        <div className="h-12 w-12 bg-green-300 rounded-full"></div>
        <div className="h-12 w-12 bg-green-400 rounded-full"></div>
      </div>
    </div>
  );
}