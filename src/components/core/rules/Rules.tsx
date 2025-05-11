import { useState } from "react";
import { RichTextDisplay, RichTextEditor } from "./RichText";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchRules } from "@/lib/api";

export default function Rules() {
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

  return (
    <div>
      {editing ? (
        <>
          <Button onClick={() => setEditing(false)}>Сохранить</Button>
          <RichTextEditor
            initialValue={rules}
            onTextChange={(value) => {
              console.log(value);
            }}
          />
        </>
      ) : (
        <>
          {canEdit && <Button onClick={() => setEditing(true)}>Редактировать</Button>}
          <RichTextDisplay value={rules} />
        </>
      )}
    </div>
  );
}
