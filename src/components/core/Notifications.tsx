import { BellIcon, XIcon, ZapIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";
import { Button } from "../ui/button";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

type NotificationType = {
  date: string;
  text: string;
  points: number;
  type: "positive" | "negative";
}

const mockNotifications: NotificationType[] = [
  {
    date: "12 января 17:12",
    text: "Вы ступили на поле игрока Honeymad",
    points: 325,
    type: "negative",
  },
  {
    date: "12 января 13:11",
    text: "Melharucos ступил на ваше поле",
    points: 154,
    type: "positive",
  },
  {
    date: "11 января 10:42",
    text: "Вы ступили на поле игрока Honeymad",
    points: 113,
    type: "negative",
  },
  {
    date: "12 января 17:12",
    text: "Вы ступили на поле игрока Honeymad",
    points: 325,
    type: "negative",
  },
  {
    date: "12 января 13:11",
    text: "Melharucos ступил на ваше поле",
    points: 154,
    type: "positive",
  },
  {
    date: "11 января 10:42",
    text: "Вы ступили на поле игрока Honeymad",
    points: 113,
    type: "negative",
  },
  {
    date: "12 января 17:12",
    text: "Вы ступили на поле игрока Honeymad",
    points: 325,
    type: "negative",
  },
  {
    date: "12 января 13:11",
    text: "Melharucos ступил на ваше поле",
    points: 154,
    type: "positive",
  },
  {
    date: "11 января 10:42",
    text: "Вы ступили на поле игрока Honeymad",
    points: 113,
    type: "negative",
  },
];

type NotificationCardProps = {
  notification: NotificationType;
  isLast?: boolean;
}

function NotificationCard({ notification, isLast = false }: NotificationCardProps) {
  const { type, date, text, points } = notification;
  const color = type === "positive" ? "text-green-500" : "text-red-500";
  const symbol = type === "positive" ? "+" : "-";

  return (
    <Card className="p-2 gap-0.5 font-semibold">
      <CardHeader className="px-0 gap-0.5">
        <CardDescription className="text-sm">{isLast ? "Последнее" : date}</CardDescription>
        <CardTitle className="text-base">{text}</CardTitle>
      </CardHeader>
      <CardContent
        className={`px-0 text-base flex items-center gap-1 ${color}`}
      >
        {`${symbol} ${points}`} <ZapIcon className="w-4 h-4" />
      </CardContent>
    </Card>
  )
}

function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const lastNotification = notifications[0];
  const collapsibleNotifications = notifications.slice(1);

  function dismissAllNotifications() {
    setNotifications([]);
  }

  return notifications.length > 0 && (
    <Collapsible>
      <div className="flex gap-[5px]">
        <CollapsibleTrigger className="!pr-[5px] font-semibold text-sm text-muted-foreground">
          <BellIcon />
          Уведомления
        </CollapsibleTrigger>

        <Button
          variant="outline"
          className="w-full shrink rounded-[10px] backdrop-blur-[1.5rem] bg-card/70 text-muted-foreground"
          onClick={dismissAllNotifications}
        >
          <XIcon strokeWidth={4} />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="mt-[5px]">
          <NotificationCard notification={lastNotification} isLast />
        </div>

        <CollapsibleContent>
          {collapsibleNotifications.map((notification, idx) => (
            <div key={idx} className="first:mt-[5px]">
              <NotificationCard notification={notification} />
            </div>
          ))}
        </CollapsibleContent>
      </ScrollArea>
    </Collapsible>
  )
}

export default Notifications;
