'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
}

export default function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200"
  
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg"
  }

  const style = {
    width: width,
    height: height || (variant === 'text' ? '1em' : undefined)
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses.text} h-4`}
            style={{
              width: i === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }, (_, i) => (
              <th key={i} className="px-6 py-3">
                <Skeleton height={16} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton height={12} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton width="60%" height={12} className="mb-2" />
              <Skeleton width="40%" height={20} />
            </div>
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>
      ))}
    </div>
  )
}