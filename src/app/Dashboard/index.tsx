import { useEffect, useState } from 'react'
import { SupportedTagValuesDto, TagDto } from '../../types'
import { tagService } from '../../services/api/Tag'
import { SimpleTable } from '../../components/Table'
import { Header } from '../../components/Header'
import { Badge } from '../../components/Badge'
import { PanelDrawer } from '../../components/PanelDrawer'
import { Button } from '../../components/Button'
import { ConfirmDialog, SimpleDialog } from '../../components/Dialog'
import { Input } from '../../components/Input'
import { slugify } from '../../helpers'
import { supportedTagValueService } from '../../services/api/SupportedTagValue'
import { PlusIcon, XCircleIcon } from '@heroicons/react/16/solid'

export function Tags() {
  const [tags, setTags] = useState<TagDto[]>([])
  const [isCreateTagDrawerOpen, setIsCreateTagDrawerOpen] = useState(false)
  const [isEditTagDrawerOpen, setIsEditTagDrawerOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagDto | null>(null)
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false)
  const [selectedSupportedTagValue, setSelectedSupportedTagValue] = useState<SupportedTagValuesDto | null>(null)
  const [isSupportedTagValueDialogOpen, setSupportedTagValueDialogOpen] = useState(false)

  useEffect(() => {
    initTags()
  }, [])

  const initTags = async () => {
    try {
      const tagsData = await tagService.list('?include=supportedTagValues')
      setTags(tagsData)
    } catch (error) {
      console.log('Error fetching tags.', error)
    }
  }

  const onCreateTag = async () => {
    try {
      if (selectedTag) {
        await tagService.create(selectedTag)
        await initTags()
        setIsCreateTagDrawerOpen(false)
        setSelectedTag(null)
      }
    } catch (error) {
      console.log('Error creating tag.', error)
    }
  }

  const onUpdateTag = async () => {
    try {
      if (selectedTag && selectedTag.id) {
        const { name, displayName } = selectedTag
        await tagService.update(selectedTag.id, {
          name,
          displayName,
        })
        await initTags()
        setIsEditTagDrawerOpen(false)
        setSelectedTag(null)
      }
    } catch (error) {
      console.log('Error updating tag.', error)
    }
  }

  const onDeleteTag = async () => {
    try {
      if (selectedTag && selectedTag.id) {
        await tagService.delete(selectedTag.id)
        await initTags()
        setIsDeleteTagDialogOpen(false)
        setSelectedTag(null)
      }
    } catch (error) {
      console.log('Error deleting tag.', error)
    }
  }

  const onSelectTag = (tagIdx: number) => {
    setSelectedTag(tags[tagIdx])
    setIsEditTagDrawerOpen(true)
  }

  const onConfirmDeleteTag = (tagIdx: number) => {
    setSelectedTag(tags[tagIdx])
    setIsDeleteTagDialogOpen(true)
  }

  const onAddSupportedTagValue = async () => {
    try {
      if (selectedTag && selectedSupportedTagValue) {
        await supportedTagValueService.create({ ...selectedSupportedTagValue, tagId: selectedTag.id })
        await initTags()
        setSelectedTag(null)
        setSelectedSupportedTagValue(null)
        setSupportedTagValueDialogOpen(false)
      }
    } catch (error) {
      console.log('Error creating supported tag value.', error)
    }
  }

  const onDeleteSupportedTagValue = async (id?: string) => {
    try {
      if (id) {
        await supportedTagValueService.delete(id)
        await initTags()
      }
    } catch (error) {
      console.log('Error deleting supported tag value.', error)
    }
  }

  const generateSupportedTagValues = (tag: TagDto) => {
    return tag?.supportedTagValues?.length === 0 ? (
      <Button
        onClick={() => {
          setSelectedTag(tag)
          setSupportedTagValueDialogOpen(true)
        }}
        plain
        className="gap-x-0 ml-1 align-middle"
      >
        <PlusIcon />
        <span className="text-[12px]"> Add</span>
      </Button>
    ) : (
      <>
        {tag?.supportedTagValues?.map((supportedTagValue, index) => (
          <Badge
            color="zinc"
            className="ml-3 mt-1 relative whitespace-nowrap align-middle"
            key={index}
          >
            {supportedTagValue?.displayName}
            <div className="absolute right-[-7px] top-[-7px] w-3 h-3 bg-white rounded-full z-[1]" />
            <XCircleIcon onClick={() => onDeleteSupportedTagValue(supportedTagValue?.id)} className="absolute right-[-7px] top-[-7px] w-[.9rem] z-[2] cursor-pointer" />
          </Badge>
        ))}
        <Button
          onClick={() => {
            setSelectedTag(tag)
            setSupportedTagValueDialogOpen(true)
          }}
          plain
          className="gap-x-0 ml-2 text-[12px] cursor-pointer align-middle"
        >
          <PlusIcon />
          <span className="text-[12px]"> Add</span>
        </Button>
      </>
    )
  }

  const headers = ['Name', 'Supported Tag Values', '']
  const tableRows = tags?.map((tag) => ({
    displayName: { value: tag.displayName || '', width: '150px' },
    supportedTagValues: {
      value: generateSupportedTagValues(tag),
      width: '900px'
    },
  }))

  return (
    <>
      <div className="flex">
        <Header>Tags</Header>
        <Button
          className="text-white px-4 py-2 ml-auto cursor-pointer"
          onClick={() => setIsCreateTagDrawerOpen(true)}
          color="green"
        >
          Create New
        </Button>
      </div>
      <br />
      <SimpleTable
        headers={headers}
        rows={tableRows}
        onEdit={onSelectTag}
        onDelete={onConfirmDeleteTag}
      />
      {isCreateTagDrawerOpen && (
        <PanelDrawer
          title="Create Tag"
          onCancel={() => {
            setSelectedTag(null)
            setIsCreateTagDrawerOpen(false)
          }}
          onSubmit={onCreateTag}
          submitButtonTxt="Add Tag"
        >
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Name</label>
            <Input
              type="text"
              value={selectedTag?.displayName || ''}
              onChange={(e) =>
                setSelectedTag({ ...selectedTag, displayName: e.target.value, name: slugify(e.target.value) })
              }
              placeholder="Enter tag name"
            />
          </div>
        </PanelDrawer>
      )}
      {isEditTagDrawerOpen && selectedTag && (
        <PanelDrawer
          title="Edit Tag"
          onCancel={() => {
            setSelectedTag(null)
            setIsEditTagDrawerOpen(false)
          }}
          onSubmit={onUpdateTag}
          submitButtonTxt="Update Tag"
        >
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Name</label>
            <Input
              type="text"
              value={selectedTag?.displayName || ''}
              onChange={(e) =>
                setSelectedTag({ ...selectedTag, displayName: e.target.value, name: slugify(e.target.value) })
              }
              placeholder="Enter tag name"
            />
          </div>
        </PanelDrawer>
      )}
      <ConfirmDialog
        isOpen={isDeleteTagDialogOpen}
        onClose={() => {
          setSelectedTag(null)
          setIsDeleteTagDialogOpen(false)
        }}
        title="Delete Tag"
        description={`Are you sure you want to delete the tag "${
          selectedTag?.displayName
        }"?`}
        onConfirm={onDeleteTag}
        confirmBtnTxt="Delete"
      />
      <SimpleDialog
        isOpen={isSupportedTagValueDialogOpen}
        onClose={() => {
          setSelectedTag(null)
          setSelectedSupportedTagValue(null)
          setSupportedTagValueDialogOpen(false)
        }}
        title="Supported Tag Value"
        onSubmit={onAddSupportedTagValue}
        submitBtnTxt="Add"
        submitBtnColor='green'
      >
        <label className="block text-sm font-bold mb-1">Name</label>
        <Input
          type="text"
          value={selectedSupportedTagValue?.displayName || ''}
          onChange={(e) =>
            setSelectedSupportedTagValue({ ...selectedSupportedTagValue, displayName: e.target.value, name: slugify(e.target.value) })
          }
          placeholder="Enter supported tag value name"
        />
      </SimpleDialog>
    </>
  )
}
