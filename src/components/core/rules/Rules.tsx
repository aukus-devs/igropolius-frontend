import { useState } from "react";
import { RichTextEditor } from "./RichText";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentRules } from "@/lib/api";
import useLocalStorage from "@/hooks/useLocalStorage";
import RichDisplay from "./RichDisplay";
import { queryKeys } from "@/lib/queryClient";
import { formatTsToFullDate } from "@/lib/utils";

export default function Rules() {
  // const { value: localRules, save: localSave } = useLocalStorage<string>({
  //   key: "rules-local",
  //   defaultValue: "",
  // });

  const [editValue, setEditValue] = useState<string>("");

  const [editing, setEditing] = useState(false);
  const canEdit = true;

  const { data: rulesData, isLoading } = useQuery({
    queryKey: queryKeys.rules,
    queryFn: fetchCurrentRules,
  });

  // const empty = JSON.stringify({ ops: [{ insert: "Добавь правила" }] });

  const rules = rulesData?.rules[0];
  // if (localRules && localRules.length > 0) {
  //   rules = localRules;
  // }

  const handleSave = () => {
    setEditing(false);
    // localSave({created_at: , editValue});
  };

  if (isLoading || !rules) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      {editing ? (
        <>
          <Button onClick={handleSave}>Сохранить</Button>
          <RichTextEditor
            initialValue={rules.content}
            onTextChange={(value) => {
              setEditValue(value);
            }}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            {canEdit && <Button onClick={() => setEditing(true)}>Редактировать</Button>}
            от {formatTsToFullDate(rules.created_at)}
          </div>
          <div className="mt-2">
            <div className="rich-display">
              <RichDisplay value={rules.content} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
