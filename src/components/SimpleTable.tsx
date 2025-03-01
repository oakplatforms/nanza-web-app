import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button, } from './Tailwind'
import { TrashIcon, PencilIcon } from '@heroicons/react/16/solid'

type SimpleTableProps = {
  headers: string[]
  rows: object[]
  onEdit?: (productIdx: number) => void
  onDelete?: (productIdx: number) => void
}

export function SimpleTable ({ headers, rows, onEdit, onDelete } : SimpleTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers?.map((header, index) => (
            <TableHeader key={index}>{header}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow key={idx}>
            {Object.values(row)?.map((rowItem, idx) => <TableCell key={idx} style={{ width: rowItem.width, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{rowItem.value as string}</TableCell>)}
            {(onEdit || onDelete) && (
              <TableCell>
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
