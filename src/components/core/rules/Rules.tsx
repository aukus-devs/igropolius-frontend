import { useState } from "react";
import { RichTextEditor } from "./RichText";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchRules } from "@/lib/api";
import useLocalStorage from "@/hooks/useLocalStorage";
import RichDisplay from "./RichDisplay";

export default function Rules() {
  const { value: localRules, save: localSave } = useLocalStorage<string>({
    key: "rules-local",
    defaultValue: "",
  });

  const [editValue, setEditValue] = useState<string>("");

  const [editing, setEditing] = useState(false);
  const canEdit = true;

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
  });

  const loading = JSON.stringify({ ops: [{ insert: "Загрузка..." }] });
  const empty = JSON.stringify({ ops: [{ insert: "Добавь правила" }] });

  let rules = empty;
  if (isLoading) {
    rules = loading;
  }
  if (rulesData && rulesData.rules.length > 0) {
    const sortedRules = rulesData.rules.sort((a, b) => b.created_at - a.created_at);
    if (sortedRules.length > 0) {
      rules = sortedRules[0].content;
    }
  }
  if (localRules && localRules.length > 0) {
    rules = localRules;
  }

  const handleSave = () => {
    setEditing(false);
    localSave(editValue);
  };

  return (
    <div>
      {editing ? (
        <>
          <Button onClick={handleSave}>Сохранить</Button>
          <RichTextEditor
            initialValue={rules}
            onTextChange={(value) => {
              setEditValue(value);
            }}
          />
        </>
      ) : (
        <>
          {canEdit && <Button onClick={() => setEditing(true)}>Редактировать</Button>}
          <div className="mt-2">
            <div className="rich-display">
              <RichDisplay value={rules} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
