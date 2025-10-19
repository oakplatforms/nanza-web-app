import { useState } from 'react'
import { Input, Textarea, Button, Header } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { SetDto } from '../../types'
import { setService } from '../../services/api/Set'
import { useSession } from '../../context/SessionContext'

type CreateOrEditSetProps = {
  selectedSet: SetDto | null
  setSelectedSet: React.Dispatch<React.SetStateAction<SetDto | null>>
}

export function CreateOrEditSet({
  selectedSet,
  setSelectedSet,
}: CreateOrEditSetProps) {
  const { currentUser } = useSession()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageField: 'banner' | 'logo') => {
    const file = e.target.files?.[0]
    if (!file || !selectedSet?.id) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('marketId', 'tcgx')

    try {
      const response = await setService.uploadImage(selectedSet.id, formData, imageField)
      setSelectedSet((prev) => prev && {
        ...prev,
        [imageField]: imageField === 'banner' ? response?.banner : response?.logo
      })
    } catch (err) {
      console.log('Image upload failed.', err)
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, 'banner')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, 'logo')
  }

  const handleRemoveImage = async (imageField: 'banner' | 'logo') => {
    if (!selectedSet?.id || !currentUser?.admin?.id) return

    try {
      await setService.deleteImage(selectedSet.id, currentUser.admin.id, imageField)
      setSelectedSet((prev) => prev && { ...prev, [imageField]: null })
    } catch (err) {
      console.log('Image deletion failed.', err)
    }
  }

  return (
    <div className="space-y-6">
      {/*Basic Set Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Display Name</label>
          <Input
            type="text"
            value={selectedSet?.displayName || ''}
            onChange={(e) =>
              setSelectedSet({
                ...selectedSet!,
                displayName: e.target.value,
                name: slugify(e.target.value),
              })
            }
            placeholder="Enter set display name"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Code</label>
          <Input
            type="text"
            value={selectedSet?.code || ''}
            onChange={(e) =>
              setSelectedSet({
                ...selectedSet!,
                code: e.target.value,
              })
            }
            placeholder="Enter set code"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Description</label>
          <Textarea
            value={selectedSet?.description || ''}
            onChange={(e) =>
              setSelectedSet({
                ...selectedSet!,
                description: e.target.value,
              })
            }
            placeholder="Enter set description"
            rows={3}
          />
        </div>
      </div>

      {/*Image Upload Section */}
      <div className="space-y-4">
        <Header level={4}>Images</Header>

        {/*Banner Upload */}
        <div>
          <label className="block text-sm font-bold mb-1">Banner Image</label>
          <div className="space-y-2">
            {selectedSet?.banner && (
              <div className="flex items-center space-x-2">
                <img
                  src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}${selectedSet.banner}`}
                  alt="Banner preview"
                  className="w-64 h-40 object-cover rounded border"
                />
                <Button
                  color="red"
                  onClick={() => handleRemoveImage('banner')}
                >
                  Remove Banner
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/*Logo Upload */}
        <div>
          <label className="block text-sm font-bold mb-1">Logo Image</label>
          <div className="space-y-2">
            {selectedSet?.logo && (
              <div className="flex items-center space-x-2">
                <img
                  src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}${selectedSet.logo}`}
                  alt="Logo preview"
                  className="w-16 h-16 object-cover rounded border"
                />
                <Button
                  color="red"
                  onClick={() => handleRemoveImage('logo')}
                >
                  Remove Logo
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
