import { useState } from 'react'
import { ConditionDto } from '../../types'
import { conditionService } from '../../services/api/Condition'
import { SimpleTable } from '../../components/SimpleTable'
import { Header, Button } from '../../components/Tailwind'
import { SimpleDialog } from '../../components/SimpleDialog'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateOrEditCondition } from './CreateOrEditCondition'
import { useSession } from '../../context/SessionContext'
import { PaginationControls } from '../../components/PaginationControls'
import { fetchConditions } from './data/fetchConditions'

export function Conditions() {
  const { currentUser } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateOrEditModalOpen, setIsCreateOrEditModalOpen] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState<ConditionDto | null>(null)
  const [isDeleteConditionDialogOpen, setIsDeleteConditionDialogOpen] = useState(false)

  const { conditions, refetchConditions } = fetchConditions(currentPage)

  const handleNextPage = () => {
    if (conditions?.total !== null && (currentPage + 1) * 10 < conditions!.total) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
    }
  }

  const onSaveCondition = async () => {
    try {
      if (selectedCondition) {
        const existingCondition = !!selectedCondition.id

        if (existingCondition) {
          await conditionService.update(selectedCondition.id!, {
            name: selectedCondition.name,
            displayName: selectedCondition.displayName,
            description: selectedCondition.description,
            lastModifiedById: currentUser?.admin?.id
          })
        } else {
          await conditionService.create({
            name: selectedCondition.name,
            displayName: selectedCondition.displayName,
            description: selectedCondition.description,
            createdById: currentUser?.admin?.id,
          })
        }
        await refetchConditions()
        setCurrentPage(0)
        setIsCreateOrEditModalOpen(false)
        setSelectedCondition(null)
      }
    } catch (error) {
      console.log('Error saving condition.', error)
    }
  }

  const onDeleteCondition = async () => {
    try {
      if (selectedCondition?.id) {
        await conditionService.delete(selectedCondition.id)
        await refetchConditions()
        setCurrentPage(0)
        setIsDeleteConditionDialogOpen(false)
        setSelectedCondition(null)
      }
    } catch (error) {
      console.log('Error deleting condition.', error)
    }
  }

  const onSelectCondition = (conditionIdx: number) => {
    const selected = conditions?.data?.[conditionIdx]
    if (selected) {
      setSelectedCondition(selected)
      setIsCreateOrEditModalOpen(true)
    }
  }

  const onConfirmDeleteCondition = (conditionIdx: number) => {
    const selected = conditions?.data?.[conditionIdx]
    if (selected) {
      setSelectedCondition(selected)
      setIsDeleteConditionDialogOpen(true)
    }
  }

  return (
    <>
      <div className="flex">
        <Header>Conditions</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateOrEditModalOpen(true)}
          color="green"
        >
          Create New Condition
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={['Name', 'Description', '']}
        rows={conditions?.data.map((condition) => ({
          displayName: { value: condition.displayName || '', width: '250px' },
          description: { value: condition.description || '', width: '800px' },
        })) || []}
        onEdit={onSelectCondition}
        onDelete={onConfirmDeleteCondition}
      />
      {conditions && conditions.total !== null && conditions.total > 10 && (
        <PaginationControls
          currentPage={currentPage}
          total={conditions.total}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      )}
      <SimpleDialog
        isOpen={isCreateOrEditModalOpen}
        size="3xl"
        title={selectedCondition?.id ? 'Edit Condition' : 'Create Condition'}
        onClose={() => {
          setSelectedCondition(null)
          setIsCreateOrEditModalOpen(false)
        }}
        onSubmit={onSaveCondition}
        submitBtnTxt={selectedCondition?.id ? 'Update Condition' : 'Add Condition'}
      >
        <CreateOrEditCondition
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
        />
      </SimpleDialog>
      <ConfirmDialog
        isOpen={isDeleteConditionDialogOpen}
        onClose={() => {
          setSelectedCondition(null)
          setIsDeleteConditionDialogOpen(false)
        }}
        title="Delete Condition"
        description={`Are you sure you want to delete the condition "${selectedCondition?.displayName}"?`}
        onConfirm={onDeleteCondition}
        confirmBtnTxt="Delete"
      />
    </>
  )
}
