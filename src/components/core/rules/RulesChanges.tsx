import { useQuery } from '@tanstack/react-query';
import { RichTextDiff } from './RichText';
import { fetchAllRules } from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';
import { formatTsToFullDate } from '@/lib/utils';
import { RulesCategory, RulesVersion } from '@/lib/api-types-generated';
import { LoaderCircleIcon } from 'lucide-react';

export default function RulesChanges() {
  const { data: rulesData, isPending } = useQuery({
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
    let oldV = null;
    for (let j = i + 1; j < versionsSorted.length; j++) {
      if (versionsSorted[j].category === newV.category) {
        oldV = versionsSorted[j];
        break;
      }
    }
    if (oldV) {
      diffPairs.push([oldV, newV]);
    }
  }

  if (isPending) {
    return (
      <div className="flex justify-center mt-20">
        <LoaderCircleIcon className="animate-spin text-primary" size={50} />
      </div>
    );
  }

  if (diffPairs.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground">
        Тут будут логи изменений в правилах
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      {diffPairs.map(([oldV, newV], idx) => {
        return (
          <div key={idx}>
            <div className="font-roboto-wide-semibold text-xl">
              <div className="flex justify-between items-center">
                <p>{categoryTitle(newV.category)}</p>
                <p className="text-base">{formatTsToFullDate(newV.created_at)}</p>
              </div>
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

function categoryTitle(category: RulesCategory) {
  switch (category) {
    case 'general':
      return 'Общие правила';
    case 'gameplay':
      return 'Правила прохождения игр';
    case 'donations':
      return 'Правила заказа игр';
    default: {
      const error: never = category;
      throw new Error(`Unknown rules category: ${error}`);
    }
  }
}
