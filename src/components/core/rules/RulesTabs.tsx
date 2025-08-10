import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Rules from './Rules';
import RulesChanges from './RulesChanges';
import { LoaderCircleIcon } from 'lucide-react';
import useRules from '@/hooks/useRules';
import { RulesCategory } from '@/lib/api-types-generated';

export default function RulesTabs() {
  const { isLoading, rules, setSelectedCategory } = useRules();

  // const { data: rulesData, isLoading } = useQuery({
  //   queryKey: queryKeys.currentRulesVersion,
  //   queryFn: fetchCurrentRules,
  // });

  // const generalRules = rulesData?.versions.find(rule => rule.category === 'general');
  // const gameplayRules = rulesData?.versions.find(rule => rule.category === 'gameplay');
  // const donationsRules = rulesData?.versions.find(rule => rule.category === 'donations');

  if (isLoading) {
    return <LoaderCircleIcon className="animate-spin text-primary mx-auto mt-20" size={50} />;
  }

  const tabs = [
    {
      name: 'Общие правила',
      value: 'general',
      content: <Rules category="general" rulesData={rules} />,
    },
    {
      name: 'Прохождение игр',
      value: 'gameplay',
      content: <Rules category="gameplay" rulesData={rules} />,
    },
    {
      name: 'Заказ игр',
      value: 'donations',
      content: <Rules category="donations" rulesData={rules} />,
    },
    { name: 'Изменения', value: 'changelog', content: <RulesChanges /> },
  ];

  return (
    <Tabs defaultValue={tabs[0].value} className="gap-0">
      <TabsList className="flex w-full bg-[#81A772]/10 backdrop-blur-md gap-2 p-5 flex-wrap sticky top-0 z-50">
        {tabs.map(({ name, value }) => (
          <TabsTrigger
            key={value}
            className="text-muted-foreground bg-[#575b58] rounded-xl hover:text-foreground transition-colors data-[state=active]:text-primary-foreground data-[state=active]:bg-primary h-8 font-roboto-wide-semibold basis-1/3"
            value={value}
            onClick={() => {
              if (value !== 'changelog') {
                setSelectedCategory(value as RulesCategory);
              }
            }}
          >
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value} className="z-10 px-5">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
