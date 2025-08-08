import React, { forwardRef, useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { clsx } from 'clsx'

export interface RichTextEditorProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  invalid?: boolean
}

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor(
    {
      label,
      value = '',
      onChange,
      placeholder,
      className,
      disabled = false,
      invalid = false,
      ...props
    },
    ref
  ) {
    const editorRef = useRef<HTMLDivElement>(null)
    const quillRef = useRef<Quill | null>(null)
    const isUpdatingRef = useRef(false)

    useEffect(() => {
      if (editorRef.current && !quillRef.current) {
        // Initialize Quill
        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: placeholder || 'Enter description...',
          readOnly: disabled,
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link'],
              ['clean'],
            ],
          },
          formats: [
            'header',
            'bold',
            'italic',
            'underline',
            'list',
            'bullet',
            'link',
            'image', // Allow images to be preserved
          ],
        })

        // Set initial content if provided
        if (value) {
          isUpdatingRef.current = true
          quillRef.current.clipboard.dangerouslyPasteHTML(value)
          isUpdatingRef.current = false
        }

        // Listen for content changes
        quillRef.current.on('text-change', () => {
          if (!isUpdatingRef.current && onChange && quillRef.current) {
            const html = quillRef.current.root.innerHTML
            onChange(html)
          }
        })
      }

      return () => {
        if (quillRef.current) {
          quillRef.current = null
        }
      }
    }, [])

    // Update content when value prop changes
    useEffect(() => {
      if (quillRef.current && value !== undefined) {
        const currentContent = quillRef.current.root.innerHTML
        if (currentContent !== value && !isUpdatingRef.current) {
          isUpdatingRef.current = true
          quillRef.current.clipboard.dangerouslyPasteHTML(value)
          isUpdatingRef.current = false
        }
      }
    }, [value])

    // Update disabled state
    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!disabled)
      }
    }, [disabled])

    return (
      <div className={clsx('space-y-3', className)} ref={ref} {...props}>
        {label && (
          <label className="block text-sm font-medium leading-6 text-zinc-950 dark:text-white">
            {label}
          </label>
        )}
        <div
          className={clsx([
            // Base styles
            'relative rounded-lg overflow-hidden',
            // Border
            'border border-zinc-950/10 dark:border-white/10',
            // Invalid state
            invalid && 'border-red-500 dark:border-red-600',
            // Disabled state
            disabled && 'opacity-50',
            // Custom Quill styles
            '[&_.ql-container]:border-0',
            '[&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-zinc-950/10 dark:[&_.ql-toolbar]:border-white/10',
            '[&_.ql-editor]:min-h-[120px]',
            '[&_.ql-editor]:text-base [&_.ql-editor]:text-zinc-950 dark:[&_.ql-editor]:text-white',
            '[&_.ql-editor.ql-blank::before]:text-zinc-500 dark:[&_.ql-editor.ql-blank::before]:text-zinc-400',
            // Focus styles
            '[&_.ql-editor:focus]:outline-none',
            // Background
            '[&_.ql-container]:bg-transparent [&_.ql-toolbar]:bg-gray-50 dark:[&_.ql-toolbar]:bg-gray-800',
            // Dark mode toolbar icons
            'dark:[&_.ql-toolbar_.ql-stroke]:stroke-white/70',
            'dark:[&_.ql-toolbar_.ql-fill]:fill-white/70',
            'dark:[&_.ql-toolbar_.ql-even]:fill-white/70',
            'dark:[&_.ql-toolbar_.ql-color]:fill-white/70',
            // Hover states for toolbar
            '[&_.ql-toolbar_button:hover]:bg-zinc-100 dark:[&_.ql-toolbar_button:hover]:bg-white/10',
            '[&_.ql-toolbar_button.ql-active]:bg-zinc-200 dark:[&_.ql-toolbar_button.ql-active]:bg-white/20',
            // Hide toolbar if disabled
            disabled && '[&_.ql-toolbar]:hidden',
          ])}
        >
          <div ref={editorRef} />
        </div>
      </div>
    )
  }
)