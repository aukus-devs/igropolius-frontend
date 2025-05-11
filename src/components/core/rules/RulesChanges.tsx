import { useQuery } from "@tanstack/react-query";
import { RichTextDiff } from "./RichText";
import { fetchRules } from "@/lib/api";
import { RulesVersion } from "@/lib/types";

export default function RulesChanges() {
  const { data: rulesData } = useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
  });

  const rules = rulesData?.rules ?? [];
  const rulesSorted = rules.sort((a, b) => {
    return b.created_at - a.created_at;
  });

  const diffPairs: [RulesVersion, RulesVersion][] = [];
  for (let i = 0; i < rulesSorted.length - 1; i++) {
    const newV = rulesSorted[i];
    const oldV = rulesSorted[i + 1];
    diffPairs.push([oldV, newV]);
  }

  return (
    <div>
      {diffPairs.map(([oldV, newV], idx) => {
        return (
          <div key={idx}>
            Изменения {formatTs(newV.created_at)}
            <RichTextDiff oldContent={oldV.content} newContent={newV.content} />
          </div>
        );
      })}
    </div>
  );
}

function formatTs(ts: number) {
  return new Date(ts * 1000).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
