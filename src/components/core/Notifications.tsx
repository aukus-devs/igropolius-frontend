import Card from "./Card";

export default function Notifications() {
  const notifications = [
    "Вы ступили на поле игрока 1",
    "Вы ступили на поле игрока 2",
    "Вы заплатили налог",
  ];

  return (
    <div className="absolute top-27 right-7 z-10">
      <div className="text-right text-[#828282]">Уведомления</div>
      <div className="flex flex-col gap-[10px]">
        {notifications.map((notification, index) => (
          <Card key={index} className="w-80 h-14">
            {notification}
          </Card>
        ))}
      </div>
    </div>
  );
}
