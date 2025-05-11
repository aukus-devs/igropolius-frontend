import { useState } from "react";
import { RichTextDisplay, RichTextEditor } from "./RichText";
import { Button } from "@/components/ui/button";

export default function Rules() {
  const [editing, setEditing] = useState(false);
  const canEdit = true;
  const rules = JSON.stringify({ ops: [{ insert: "Добавь правила" }] });
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
