import { EntityCard, EntityListType } from './index'
import { EntityDto } from '../../../types'

export function CollectionEntityCard({ entity, entityList, onNavigate }: { entity: EntityDto; entityList?: EntityListType; onNavigate: (path: string) => void }) {
  return <EntityCard entity={entity} entityList={entityList} onNavigate={onNavigate} />
}

