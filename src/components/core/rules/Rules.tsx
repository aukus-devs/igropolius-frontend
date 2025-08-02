import { useState } from 'react';
import { RichTextEditor } from './RichText';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import useSystemStore from '@/stores/systemStore';
import { saveRulesVersion } from '@/lib/api';
import RichDisplay from './RichDisplay';
import { resetCurrentRulesQuery } from '@/lib/queryClient';
import { formatTsToFullDate } from '@/lib/utils';
import { RulesCategory, RulesVersion } from '@/lib/api-types-generated';

export default function Rules({
  category,
  rulesData,
}: {
  category: RulesCategory;
  rulesData?: RulesVersion;
}) {
  const [editValue, setEditValue] = useState<string>('');

  const [editing, setEditing] = useState(false);
  const myUser = useSystemStore(state => state.myUser);

  const canEdit = myUser?.role === 'admin';

  const { mutateAsync: saveRules, isPending } = useMutation({
    mutationFn: saveRulesVersion,
  });

  const handleSave = () => {
    setEditing(false);
    saveRules({ content: editValue, category }).then(() => {
      resetCurrentRulesQuery();
    });
  };

  const version = rulesData || {
    content: JSON.stringify({
      ops: [{ insert: 'Правила не найдены, нажми редактировать и сохрани новые' }],
    }),
    created_at: Date.now() / 1000,
    category,
  };

  return (
    <div className="my-5">
      {editing ? (
        <div>
          <div className="flex gap-4 items-center">
            <Button onClick={handleSave} loading={isPending}>
              Сохранить
            </Button>
            <Button onClick={() => setEditing(false)} variant="destructive">
              Отменить
            </Button>
          </div>
          <RichTextEditor
            initialValue={version.content}
            onTextChange={value => {
              setEditValue(value);
            }}
          />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center">
            {canEdit && <Button onClick={() => setEditing(true)}>Редактировать</Button>}
            от {formatTsToFullDate(version.created_at)}
          </div>
          <div className="mt-2">
            <div className="rich-display">
              <RichDisplay value={version.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
