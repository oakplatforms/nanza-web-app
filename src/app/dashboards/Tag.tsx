import { useEffect, useState } from 'react';
import { TagDto } from '../../types';
import { tagService } from '../../services/api/Tag';
import { SimpleTable } from '../../components/Table';
import { Header } from '../../components/Header';

export function TagsDashboard () {
  const [tags, setTags] = useState<TagDto[]>([]);
  
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await tagService.list();
        setTags(tagsData);
      } catch (error) {
        console.log('Error fetching tags.', error);
      }
    };
    loadTags();
  }, []);

  const headers = ['Name', 'ID']
  const tableRows = tags.map((tag) => (
    {
      displayName: tag.displayName || tag.name || '',
      id: tag.id || '',
    }))

  return (
    <>
      <Header>Tags</Header>
      <br></br>
      <SimpleTable headers={headers} rows={tableRows} />
    </>
  );
};
