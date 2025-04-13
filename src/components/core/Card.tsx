import { ComponentProps } from "react";
import { Card as DefaultCard } from "@/components/ui/card";

export default function Card(props: ComponentProps<typeof DefaultCard>) {
  const baseClass = "p-2 bg-[rgba(51,51,51,0.5)] backdrop-blur-[25px] rounded-[10px]";
  return <DefaultCard {...props} className={`${props.className} ${baseClass}`} />;
}
