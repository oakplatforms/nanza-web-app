import { ReactNode } from 'react'
import { Button } from './Button'
import { XMarkIcon } from '@heroicons/react/16/solid'

interface PanelDrawerProps {
  title: string
  onSubmit: () => void;
  onCancel: () => void;
  children: ReactNode
  submitButtonTxt?: string,
  isSubmitDisabled?: boolean
}

export function PanelDrawer ({ title, onSubmit, onCancel, children, submitButtonTxt, isSubmitDisabled }: PanelDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black bg-opacity-20 z-40"
        onClick={onCancel}
      ></div>
      <div
        className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg p-5 transform transition-transform duration-500 ease-in-out z-50"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button onClick={onCancel} className='cursor-pointer' plain><XMarkIcon /></Button>
        </div>
        {children}
        <div className="flex space-x-4">
          <Button
            color='green'
            className='cursor-pointer'
            onClick={onSubmit}
            disabled={isSubmitDisabled}
          >
            {submitButtonTxt || 'Add Item'}
          </Button>
          <Button
            color='light'
            className='cursor-pointer'
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
};
