import { ReactNode } from 'react'
import { Dialog, DialogTitle, DialogBody, DialogActions, Button, ButtonProps } from './Tailwind'

type SimpleDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  submitBtnTxt: string
  onSubmit?: () => void
  children: ReactNode
  submitBtnColor?: ButtonProps['color']
}

export function SimpleDialog({ isOpen, onClose, title, submitBtnTxt, onSubmit, submitBtnColor, children } : SimpleDialogProps) {
  return isOpen ? (
    <Dialog
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogBody>
        {children}
      </DialogBody>
      <DialogActions>
        <Button
          plain
          onClick={onClose}>
            Cancel
        </Button>
        <Button onClick={onSubmit} color={submitBtnColor || 'zinc'}>{submitBtnTxt}</Button>
      </DialogActions>
    </Dialog>
  ) : null
}
