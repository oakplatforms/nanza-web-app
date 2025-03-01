import { Dialog, DialogTitle, DialogDescription, DialogActions, Button } from './Tailwind'

type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  confirmBtnTxt: string
  onConfirm?: () => void
}

export function ConfirmDialog({ isOpen, onClose, title, description, confirmBtnTxt, onConfirm } : ConfirmDialogProps) {
  return isOpen ? (
    <Dialog
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogActions>
        <Button
          plain
          onClick={onClose}>
            Cancel
        </Button>
        <Button onClick={onConfirm} color='red'>{confirmBtnTxt}</Button>
      </DialogActions>
    </Dialog>
  ) : null
}