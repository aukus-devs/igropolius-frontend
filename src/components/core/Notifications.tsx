import { ZapIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

function Notifications() {
  const notifications = [
    {
      date: "12 января 17:12",
      text: "Вы ступили на поле игрока Honeymad",
      points: 9640,
      type: "negative",
    },
    {
      date: "12 января 13:11",
      text: "Melharucos ступил на ваше поле",
      points: 1200,
      type: "positive",
    },
    {
      date: "12 января 17:12",
      text: "Вы ступили на поле игрока Honeymad",
      points: 9640,
      type: "negative",
    },
  ];

  return (
    <div>
      <div className="text-right text-[#494949] roboto-flex-wide text-sm">Уведомления</div>
      <div className="flex flex-col gap-2">
        {notifications.map(({ date, text, points, type }, idx) => {
          const color = type === "positive" ? "text-blue-500" : "text-red-500";
          const symbol = type === "positive" ? "+" : "-";

          return (
            <Card key={idx} className="p-2 gap-1">
              <CardHeader className="px-2">
                <CardDescription className="text-xs">{date}</CardDescription>
                <CardTitle className="font-semibold text-base">{text}</CardTitle>
              </CardHeader>
              <CardContent
                className={`px-2 font-semibold text-base flex items-center gap-1 ${color}`}
              >
                {`${symbol} ${points}`} <ZapIcon className="w-4 h-4" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Notifications;
