import { useQuery } from "@tanstack/react-query";
import { RichTextDiff } from "./RichText";
import { fetchAllRules } from "@/lib/api";
import { RulesVersion } from "@/lib/types";
import { queryKeys } from "@/lib/queryClient";
import { formatTsToFullDate } from "@/lib/utils";

export default function RulesChanges() {
  const { data: rulesData } = useQuery({
    queryKey: queryKeys.allRulesVersions,
    queryFn: fetchAllRules,
  });

  const versions = rulesData?.versions ?? [];
  const versionsSorted = versions.sort((a, b) => {
    return b.created_at - a.created_at;
  });

  const diffPairs: [RulesVersion, RulesVersion][] = [];
  for (let i = 0; i < versionsSorted.length - 1; i++) {
    const newV = versionsSorted[i];
    const oldV = versionsSorted[i + 1];
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
