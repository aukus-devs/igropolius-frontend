import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Rules from './Rules';
import RulesChanges from './RulesChanges';
import { LoaderCircleIcon } from 'lucide-react';
import useRules from '@/hooks/useRules';
import { RulesCategory } from '@/lib/api-types-generated';
import { useRef, useState } from 'react';

export default function RulesTabs() {
  const { isLoading, rules, setSelectedCategory } = useRules();

  const stickyRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  const onRender = (element: HTMLDivElement | null) => {
    if (!element) return;

    stickyRef.current = element;

    const container = element.closest('#scroll-area-viewport');
    if (!container) return; // fallback

    const handleScroll = () => {
      // console.log({ scrollRef: stickyRef.current });
      if (!stickyRef.current) return;

      const cRect = container.getBoundingClientRect();
      const sRect = stickyRef.current.getBoundingClientRect();
      const topRelative = sRect.top - cRect.top;
      setStuck(topRelative <= 0);
    };
    // Run on mount and on scroll
    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
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

  const tabsStyle: React.CSSProperties = {};
  if (stuck) {
    tabsStyle.backgroundColor = 'rgba(129, 167, 114, 0.1)';
    tabsStyle.backdropFilter = 'blur(10px)';
    tabsStyle.borderRadius = '16px';
  } else {
    tabsStyle.background = 'transparent';
  }

  // console.log({ stuck, tabsStyle });

  return (
    <Tabs defaultValue={tabs[0].value} className="gap-0">
      <TabsList
        className="flex w-full gap-2 p-5 flex-wrap sticky top-0 z-50"
        style={tabsStyle}
        ref={onRender}
      >
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
