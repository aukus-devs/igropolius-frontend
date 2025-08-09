import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Rules from './Rules';
import RulesChanges from './RulesChanges';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { fetchCurrentRules } from '@/lib/api';
import { LoaderCircleIcon } from 'lucide-react';

export default function RulesTabs() {
  const { data: rulesData, isLoading } = useQuery({
    queryKey: queryKeys.currentRulesVersion,
    queryFn: fetchCurrentRules,
  });

  const generalRules = rulesData?.versions.find(rule => rule.category === 'general');
  const gameplayRules = rulesData?.versions.find(rule => rule.category === 'gameplay');
  const donationsRules = rulesData?.versions.find(rule => rule.category === 'donations');

  if (isLoading) {
    return <LoaderCircleIcon className="animate-spin text-primary mx-auto mt-20" size={50} />;
  }

  const tabs = [
    {
      name: 'Общие правила',
      value: 'generic-rules',
      content: <Rules category="general" rulesData={generalRules} />,
    },
    {
      name: 'Прохождение игр',
      value: 'player-rules',
      content: <Rules category="gameplay" rulesData={gameplayRules} />,
    },
    {
      name: 'Заказ игр',
      value: 'donater-rules',
      content: <Rules category="donations" rulesData={donationsRules} />,
    },
    { name: 'Изменения', value: 'changelog', content: <RulesChanges /> },
  ];

  return (
    <Tabs defaultValue={tabs[0].value} className="gap-0">
      <TabsList className="w-full bg-transparent gap-2 p-0 flex-wrap sticky top-[10px] z-50">
        {tabs.map(({ name, value }) => (
          <TabsTrigger
            key={value}
            className="text-muted-foreground bg-[#575b58] rounded-xl hover:text-foreground transition-colors data-[state=active]:text-primary-foreground data-[state=active]:bg-primary h-8 font-roboto-wide-semibold basis-1/3"
            value={value}
          >
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value} className="mt-10 sm:mt-10 z-10">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
