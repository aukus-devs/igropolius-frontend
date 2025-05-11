import { RichTextDiff } from "./RichText";

export default function RulesChanges() {
  const oldContent = JSON.stringify({ ops: [{ insert: "Правило 1: нельзя" }] });
  const newContent = JSON.stringify({ ops: [{ insert: "Правило 2: можно" }] });
  return (
    <div>
      <RichTextDiff oldContent={oldContent} newContent={newContent} />
    </div>
  );
}
