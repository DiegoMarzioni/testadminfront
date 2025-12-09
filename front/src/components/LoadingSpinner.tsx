interface LoadingSpinnerProps {
  text?: string
}

export default function LoadingSpinner({ text = "Cargando..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}