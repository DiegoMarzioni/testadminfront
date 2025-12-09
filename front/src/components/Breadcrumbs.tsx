'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname()

  const breadcrumbItems = items || generateBreadcrumbs(pathname)

  if (breadcrumbItems.length <= 1) return null

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          
          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-gray-400 mx-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              
              {isLast ? (
                <span className="text-xs md:text-sm font-medium text-gray-500 flex items-center">
                  <span className="hidden sm:inline mr-2">{item.icon}</span>
                  <span className="truncate max-w-[120px] sm:max-w-none">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href || '/'}
                  className="inline-flex items-center text-xs md:text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  <span className="hidden sm:inline mr-2">{item.icon}</span>
                  <span className="truncate max-w-[100px] sm:max-w-none">{item.label}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: '🏠'
  })

  let currentPath = ''
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    currentPath += `/${segment}`

    if (segment === 'dashboard') continue
    
    const label = getSegmentLabel(segment, pathSegments, i)
    const isLast = i === pathSegments.length - 1
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      icon: getSegmentIcon(segment)
    })
  }

  return breadcrumbs
}

function getSegmentLabel(segment: string, pathSegments: string[], index: number): string {
  
  const labelMap: Record<string, string> = {
    'categories': 'Categorías',
    'products': 'Productos',
    'sales': 'Ventas',
    'orders': 'Órdenes',
    'brands': 'Marcas',
    'new': 'Nuevo',
    'edit': 'Editar'
  }

  if (/^\d+$/.test(segment)) {
    const previousSegment = pathSegments[index - 1]
    const nextSegment = pathSegments[index + 1]
    
    if (nextSegment === 'edit') {
      return `Editar ${labelMap[previousSegment]?.slice(0, -1) || 'Item'}`
    }
    
    return `${labelMap[previousSegment]?.slice(0, -1) || 'Item'} #${segment}`
  }

  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
}

function getSegmentIcon(segment: string): string {
  const iconMap: Record<string, string> = {
    'categories': '📁',
    'products': '📦',
    'sales': '🛒',
    'orders': '📋',
    'brands': '🏷️',
    'new': '➕',
    'edit': '✏️'
  }

  return iconMap[segment] || ''
}