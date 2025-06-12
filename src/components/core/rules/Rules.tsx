import { useState } from "react";
import { RichTextEditor } from "./RichText";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCurrentRules, saveRulesVersion } from "@/lib/api";
import RichDisplay from "./RichDisplay";
import { queryKeys, resetCurrentRulesQuery } from "@/lib/queryClient";
import { formatTsToFullDate } from "@/lib/utils";
import LoadingSpinner from "../loadng/LoadingSpinner";

export default function Rules() {
  const [editValue, setEditValue] = useState<string>("");

  const [editing, setEditing] = useState(false);
  const canEdit = true;

  const { mutateAsync: saveRules, isPending } = useMutation({
    mutationFn: saveRulesVersion,
  });

  const { data: rulesData, isLoading } = useQuery({
    queryKey: queryKeys.currentRulesVersion,
    queryFn: fetchCurrentRules,
  });

  const version = rulesData?.versions[0];

  const handleSave = () => {
    setEditing(false);
    saveRules(editValue).then(() => {
      resetCurrentRulesQuery();
    });
  };

  if (isLoading || !version || isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner text="Загрузка правил..." />
      </div>
    );
  }

  return (
    <div>
      {editing ? (
        <div>
          <div className="flex gap-4 items-center">
            <Button onClick={handleSave}>Сохранить</Button>
            <Button onClick={() => setEditing(false)} variant="destructive">
              Отменить
            </Button>
          </div>
          <RichTextEditor
            initialValue={version.content}
            onTextChange={(value) => {
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
