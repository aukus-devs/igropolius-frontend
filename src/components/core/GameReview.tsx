import { GameReviewType, GameStatusType } from "@/types";
import { ZapIcon } from "lucide-react";

type Props = {
  review: GameReviewType;
}

function getStatusData(status: GameStatusType) {
  switch (status) {
    case "drop": return {
      statusName: 'Дропнул',
      statusColor: "text-red-500",
    };
    case "in_progress": return {
      statusName: 'Текущая игра',
      statusColor: "",
    };
    case "completed": return {
      statusName: 'Прошел',
      statusColor: "text-green-500",
    };
    case "reroll": return {
      statusName: 'Реролл',
      statusColor: "text-blue-500",
    };
  }
}

function GameReview({ review }: Props) {
  const { gameTitle, description, rating, points, status, date, poster } = review;
  const fallbackPoster = "https://images.igdb.com/igdb/image/upload/t_cover_big/co9gpd.webp";
  const formattedDate = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
  const { statusColor, statusName } = getStatusData(status);
  const formattedPoints = points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const pointsSymbol = points >= 0 ? '+' : '-';

  return (
    <div className="font-semibold">
      <div className={`text-xs ${statusColor}`}>{statusName} — {formattedDate}</div>
      <h3 className="text-2xl mb-2">{gameTitle}</h3>
      <div className="flex gap-2.5">
        <div className="min-w-[90px] h-[120px] rounded-md overflow-hidden">
          <img className="h-full object-cover" src={poster || fallbackPoster} />
        </div>
        <div className="text-muted-foreground">
          <p>{rating} / 10 — {description}</p>
          <div className="flex items-center gap-1 mt-2">
            {pointsSymbol} {formattedPoints} <ZapIcon size="1rem" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameReview;
