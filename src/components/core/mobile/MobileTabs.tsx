import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapTab from './tabs/MapTab';
import RulesTab from './tabs/RulesTab';
import { Document, Home } from '@/components/icons';
import useRenderStore from '@/stores/renderStore';

function MobileTabs() {
  const setShouldRender3D = useRenderStore(state => state.setShouldRender3D);

  const tabs = [
    { icon: <Home />, value: 'map', content: <MapTab /> },
    { icon: <Document />, value: 'rules', content: <RulesTab /> },
  ];

  const handleValueChange = (value: string) => {
    setShouldRender3D(value === 'map');
  };

  return (
    <Tabs className="gap-0" defaultValue={tabs[0].value} onValueChange={handleValueChange}>
      <TabsList className="w-full gap-2 p-[15px] h-auto rounded-none bg-transparent fixed top-0 z-50">
        {tabs.map(({ icon, value }) => (
          <TabsTrigger
            key={value}
            className="bg-[#1C1C1C] text-muted-foreground rounded-[10px] hover:text-foreground transition-colors data-[state=active]:text-primary-foreground h-11 font-roboto-wide-semibold [&_svg:not([class*='size-'])]:size-6 data-[state=active]:bg-primary"
            value={value}
          >
            {icon}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value}>
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default MobileTabs;
