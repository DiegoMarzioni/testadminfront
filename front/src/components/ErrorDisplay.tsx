interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="text-red-600 text-4xl">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900">Error</h3>
        <p className="text-gray-600">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}