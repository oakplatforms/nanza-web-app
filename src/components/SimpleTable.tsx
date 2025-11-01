import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button, } from './Tailwind'
import { TrashIcon, PencilIcon } from '@heroicons/react/16/solid'
import React from 'react'

type SimpleTableProps = {
  headers: string[]
  rows: object[]
  onEdit?: (productIdx: number) => void
  onDelete?: (productIdx: number) => void
}

function sanitizeHTMLForTable(html: string): string {
  //Remove <p> tags but keep their content
  let sanitized = html.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, ' ')
  //Remove <br> tags and replace with a space
  sanitized = sanitized.replace(/<br\s*\/?>/gi, ' ')
  //Add max-height styling to all images
  sanitized = sanitized.replace(/<img([^>]*)>/gi, (match, attrs) => {
    //Check if style attribute already exists
    if (attrs.includes('style=')) {
      //Add max-height and display to existing style
      return match.replace(/style=["']([^"']*)["']/gi, (styleMatch, styleValue) => {
        let updatedStyle = styleValue
        if (!styleValue.includes('max-height')) {
          updatedStyle = `${updatedStyle} max-height: 14px;`
        }
        if (!styleValue.includes('display')) {
          updatedStyle = `${updatedStyle} display: inline-block;`
        }
        return `style="${updatedStyle}"`
      })
    } else {
      //Add style attribute with max-height and display
      return `<img${attrs} style="max-height: 14px; display: inline-block;">`
    }
  })
  return sanitized
}

export function SimpleTable ({ headers, rows, onEdit, onDelete } : SimpleTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers?.map((header, index) => {
            const isFirst = index === 0
            const isLast = index === headers.length - 1 && !onEdit && !onDelete
            return (
              <TableHeader key={index} stickyLeft={isFirst} stickyRight={isLast}>
                {header}
              </TableHeader>
            )
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow key={idx}>
            {Object.values(row)?.map((rowItem, cellIdx) => {
              const isDescription = headers[cellIdx] === 'Description'
              const value = rowItem.value
              const isHTML = typeof value === 'string' && /<[^>]+>/g.test(value)
              const isFirst = cellIdx === 0
              const isLast = cellIdx === Object.values(row).length - 1 && !onEdit && !onDelete

              return (
                <TableCell
                  key={cellIdx}
                  stickyLeft={isFirst}
                  stickyRight={isLast}
                  style={{ width: rowItem.width, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                >
                  {React.isValidElement(value) ? (
                    value
                  ) : isHTML && isDescription ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: sanitizeHTMLForTable(value as string) }}
                      className="[&_img]:max-h-[14px] [&_img]:h-auto [&_img]:w-auto [&_img]:inline-block"
                    />
                  ) : (
                    value as string
                  )}
                </TableCell>
              )
            })}
            {(onEdit || onDelete) && (
              <TableCell stickyRight>
                <div className="flex">
                  {onEdit && <Button className="cursor-pointer" onClick={() => onEdit(idx)} plain><PencilIcon /></Button>}
                  {onDelete && <Button className="cursor-pointer" onClick={() => onDelete(idx)} plain><TrashIcon /></Button>}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
