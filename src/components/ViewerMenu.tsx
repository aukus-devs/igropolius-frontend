import { useContext, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "./ui/sidebar";
import { AppContext } from "@/contexts/AppContext";
import { EntityType } from "@/lib/interfaces";
import { ScrollArea } from "./ui/scroll-area";
import { Plus as PlusIcon, Trash as TrashIcon } from 'lucide-react';

function ViewerMenu() {
  const radioOptions: EntityType[] = ['box', 'pyramid'];
  const appContext = useContext(AppContext);

  const [type, setType] = useState<EntityType>(radioOptions[0]);
  const [length, setLength] = useState(1);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [amount, setAmount] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  function resetStates() {
    setType(radioOptions[0]);
    setLength(1);
    setWidth(1);
    setHeight(1);
    setAmount(1);
  }

  function cancel() {
    setIsOpen(false);
    resetStates();
  }

  function confirm() {
    if (!appContext) return;

    for (let i = 0; i < amount; i++) {
      appContext.addEntity({ type, length, width, height });
    }

    setIsOpen(false);
    resetStates();
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b bg-accent">
        <h2 className="text-lg font-medium">Entities ({Object.keys(appContext?.entities || {}).length})</h2>
      </SidebarHeader>
      <SidebarContent className="flex overflow-hidden border-b">
        <ScrollArea className="px-4 h-full">
          <div className="flex flex-col py-4">
            {Object.values(appContext?.entities || {}).map((entity) => (
              <Button
                key={entity.id}
                variant={appContext?.selectedEntity?.id === entity.id ? 'default' : 'ghost'}
                className="justify-between h-auto w-full"
                onClick={() => appContext?.selectEntity(entity)}
              >
                <div className="flex flex-col">
                  <div className="truncate whitespace-pre-line text-start">{entity.id}</div>
                  <div className="flex font-normal text-muted-foreground">
                    position: {entity.position.map((v) => {
                      const str = v.toFixed(2);
                      return str.indexOf('.00') === str.length - 3 ? str.slice(0, -3) : str;
                    }).join(', ')}
                  </div>
                </div>
                <div className="flex min-w-6 min-h-6 rounded-full" style={{ backgroundColor: entity.color }}></div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="w-full flex-row gap-2 justify-between bg-accent">
        <Button variant="ghost" size="icon" onClick={() => appContext?.clearEntities()} disabled={Object.keys(appContext?.entities || {}).length < 1}>
          <TrashIcon />
        </Button>
        <Popover open={isOpen} defaultOpen={false} onOpenChange={setIsOpen}>
          <PopoverTrigger className={buttonVariants({ size: 'icon' })}>
            <PlusIcon />
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2" side="right" align="end" sideOffset={12}>
            <div className="flex mb-2 space-x-2 items-center">
              <Label className="w-20">Type</Label>
              <RadioGroup className="flex gap-2" defaultValue={type} onValueChange={(value) => setType(value as EntityType)}>
                {radioOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="group-width" className="w-20">Width</Label>
              <Input id="group-width" value={width} onChange={(e) => setWidth(parseInt(e.target.value))} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="group-height" className="w-20">Height</Label>
              <Input id="group-height" value={height} onChange={(e) => setHeight(parseInt(e.target.value))} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="group-length" className="w-20">Length</Label>
              <Input id="group-length" value={length} onChange={(e) => setLength(parseInt(e.target.value))} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="group-amount" className="w-20">Amount</Label>
              <Input id="group-amount" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={cancel}>Cancel</Button>
              <Button onClick={confirm}>Confirm</Button>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  )
}

export default ViewerMenu;
