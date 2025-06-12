import { useQuery } from "@tanstack/react-query";
import { RichTextDiff } from "./RichText";
import { fetchCurrentRules } from "@/lib/api";
import { RulesVersion } from "@/lib/types";
import { queryKeys } from "@/lib/queryClient";
import { formatTsToFullDate } from "@/lib/utils";

export default function RulesChanges() {
  const { data: rulesData } = useQuery({
    queryKey: queryKeys.rules,
    queryFn: fetchCurrentRules,
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
            Изменения {formatTsToFullDate(newV.created_at)}
            <RichTextDiff oldContent={oldV.content} newContent={newV.content} />
          </div>
        );
      })}
    </div>
  );
}
