import { Input, Textarea } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { ConditionDto } from '../../types'

type CreateOrEditConditionProps = {
  selectedCondition: ConditionDto | null
  setSelectedCondition: React.Dispatch<React.SetStateAction<ConditionDto | null>>
}

export function CreateOrEditCondition({
  selectedCondition,
  setSelectedCondition,
}: CreateOrEditConditionProps) {

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">Name</label>
        <Input
          type="text"
          value={selectedCondition?.displayName || ''}
          onChange={(e) =>
            setSelectedCondition({
              ...selectedCondition!,
              displayName: e.target.value,
              name: slugify(e.target.value),
            })
          }
          placeholder="Enter condition name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold mb-1">Description</label>
        <Textarea
          value={selectedCondition?.description || ''}
          onChange={(e) =>
            setSelectedCondition({
              ...selectedCondition!,
              description: e.target.value,
            })
          }
          placeholder="Enter condition description"
          rows={3}
        />
      </div>
    </div>
  )
}
