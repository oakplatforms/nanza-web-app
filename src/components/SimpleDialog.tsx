import { ReactNode } from 'react'
import { Dialog, DialogTitle, DialogBody, DialogActions, Button, ButtonProps } from './Tailwind'
import { sizes } from './Tailwind/Dialog'

type SimpleDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  submitBtnTxt?: string
  onSubmit?: () => void
  children: ReactNode
  submitBtnColor?: ButtonProps['color']
  size?: keyof typeof sizes
}

export function SimpleDialog({ isOpen, onClose, title, submitBtnTxt, onSubmit, submitBtnColor, size, children } : SimpleDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size={size}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogBody>
        {children}
      </DialogBody>
      {onSubmit && (
        <DialogActions>
          <Button
            plain
            onClick={onClose}>
              Cancel
          </Button>
          <Button onClick={onSubmit} color={submitBtnColor || 'green'}>{submitBtnTxt}</Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
