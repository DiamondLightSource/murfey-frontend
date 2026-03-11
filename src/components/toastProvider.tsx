import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import React, { useEffect } from 'react'

export const TOAST_EVENT = 'murfey-toast'

export interface ToastDetail {
  message: string
  severity: 'error' | 'warning' | 'info' | 'success'
}

export const ToastProvider = () => {
  const [open, setOpen] = React.useState(false)
  const [detail, setDetail] = React.useState<ToastDetail>({
    message: '',
    severity: 'error',
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, severity } = (e as CustomEvent<ToastDetail>).detail
      setDetail({ message, severity })
      setOpen(true)
    }
    window.addEventListener(TOAST_EVENT, handler)
    return () => window.removeEventListener(TOAST_EVENT, handler)
  }, [])

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity={detail.severity}
        variant="filled"
      >
        {detail.message}
      </Alert>
    </Snackbar>
  )
}
