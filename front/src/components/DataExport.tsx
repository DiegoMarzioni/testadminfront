'use client'

import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { Logger } from '@/lib/logger'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface ExportData {
  data: any[]
  filename: string
  title: string
}

interface DataExportProps {
  data: any[]
  filename: string
  title?: string
  className?: string
}

export default function DataExport({ data, filename, title, className = '' }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      if (!data || data.length === 0) {
        toast.error('No hay datos para exportar')
        return
      }

      const headers = Object.keys(data[0])

      const csvContent = [
        headers.join(','), 
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`
            }
            
            return `"${String(value || '').replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Archivo CSV descargado exitosamente')
    } catch (error) {
      Logger.error('Error exporting CSV:', error)
      toast.error('Error al exportar datos')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = async () => {
    setIsExporting(true)
    try {
      if (!data || data.length === 0) {
        toast.error('No hay datos para exportar')
        return
      }

      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Archivo JSON descargado exitosamente')
    } catch (error) {
      Logger.error('Error exporting JSON:', error)
      toast.error('Error al exportar datos')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-slate-600">Exportar:</span>
      
      <button
        onClick={exportToCSV}
        disabled={isExporting || !data?.length}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Exportar como CSV"
      >
        <FileSpreadsheet className="w-4 h-4 mr-1.5" />
        CSV
      </button>

      <button
        onClick={exportToJSON}
        disabled={isExporting || !data?.length}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Exportar como JSON"
      >
        <FileText className="w-4 h-4 mr-1.5" />
        JSON
      </button>

      {isExporting && (
        <div className="flex items-center text-sm text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          Exportando...
        </div>
      )}
    </div>
  )
}

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportData = async (data: any[], filename: string, format: 'csv' | 'json' = 'csv') => {
    setIsExporting(true)
    try {
      if (!data || data.length === 0) {
        toast.error('No hay datos para exportar')
        return
      }

      if (format === 'csv') {
        const headers = Object.keys(data[0])
        const csvContent = [
          headers.join(','),
          ...data.map(row => 
            headers.map(header => {
              const value = row[header]
              if (typeof value === 'object' && value !== null) {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`
              }
              return `"${String(value || '').replace(/"/g, '""')}"`
            }).join(',')
          )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        downloadBlob(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      } else {
        const jsonContent = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
        downloadBlob(blob, `${filename}_${new Date().toISOString().split('T')[0]}.json`)
      }

      toast.success(`Archivo ${format.toUpperCase()} descargado exitosamente`)
    } catch (error) {
      Logger.error('Error exporting data:', error)
      toast.error('Error al exportar datos')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportData, isExporting }
}