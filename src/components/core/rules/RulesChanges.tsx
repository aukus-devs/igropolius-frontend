import { useQuery } from '@tanstack/react-query';
import { RichTextDiff } from './RichText';
import { fetchAllRules } from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';
import { formatTsToFullDate } from '@/lib/utils';
import { RulesVersion } from '@/lib/api-types-generated';

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
    <div className="mt-8">
      {diffPairs.map(([oldV, newV], idx) => {
        return (
          <div key={idx}>
            <div className="font-roboto-wide-semibold text-xl">
              Изменения {formatTsToFullDate(newV.created_at)}
            </div>
            <div className="font-semibold text-base">
              <RichTextDiff oldContent={oldV.content} newContent={newV.content} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
