import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Rules from './Rules';
import RulesChanges from './RulesChanges';
import { LoaderCircleIcon } from 'lucide-react';
import useRules from '@/hooks/useRules';
import { RulesCategory } from '@/lib/api-types-generated';
import useScrollStyler from '@/hooks/useScrollStyler';
import { RefObject } from 'react';

export default function RulesTabs({
  scrollAreaRef,
}: {
  scrollAreaRef?: RefObject<HTMLDivElement | null>;
}) {
  const { isLoading, rules, setSelectedCategory } = useRules();

  const { onRender, style } = useScrollStyler();

  const handleTabChange = (value: string) => {
    if (value !== 'changelog') {
      setSelectedCategory(value as RulesCategory);
    }

    if (scrollAreaRef?.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

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

  // console.log({ stuck, tabsStyle });

  return (
    <Tabs defaultValue={tabs[0].value} className="gap-0" onValueChange={handleTabChange}>
      <TabsList
        className="flex w-full gap-2 p-5 flex-wrap sticky top-0 z-50"
        style={style}
        ref={onRender}
      >
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
        <TabsContent key={value} value={value} className="z-10 px-5">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
