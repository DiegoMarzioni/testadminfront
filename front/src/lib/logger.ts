
export class Logger {
  private static isDev = process.env.NODE_ENV === 'development'

  static error(message: string, error?: any): void {
    if (this.isDev) {
      
      if (error?.status && error.status >= 400 && error.status < 500) {
        return 
      }

      console.error(message, error)
    }
    
  }

  static warn(message: string, data?: any): void {
    if (this.isDev) {
      
      console.warn(message, data)
    }
  }

  static info(message: string, data?: any): void {
    if (this.isDev) {
      
      console.info(message, data)
    }
  }

  static debug(message: string, data?: any): void {
    if (this.isDev) {
      
      console.debug(message, data)
    }
  }
}