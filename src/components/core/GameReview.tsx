import { GameReviewType, GameStatusType } from "@/lib/types";

type Props = {
  game: GameReviewType;
};

function getStatusData(status: GameStatusType) {
  switch (status) {
    case "drop":
      return {
        title: "Дропнул",
        color: "text-red-500",
      };
    case "completed":
      return {
        title: "Прошел",
        color: "text-green-500",
      };
    case "reroll":
      return {
        title: "Реролл",
        color: "text-blue-500",
      };
    default: {
      return {
        title: "",
        color: "",
      };
    }
  }
}

function GameReview({ game }: Props) {
  const { gameTitle, description, rating, status, date, poster } = game;
  const fallbackPoster = "https://images.igdb.com/igdb/image/upload/t_cover_big/co9gpd.webp";
  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(date);
  const { color, title } = getStatusData(status);

  return (
    <div className="font-semibold">
      <div className={`text-xs ${color} font-wide-semibold`}>
        {title} — {formattedDate}
      </div>
      <h3 className="text-2xl mb-2 font-wide-semibold">{gameTitle}</h3>
      <div className="flex gap-2.5">
        <div className="min-w-[90px] h-[120px] rounded-md overflow-hidden">
          <img className="h-full object-cover" src={poster || fallbackPoster} />
        </div>
        <div className="text-muted-foreground">
          <p>
            {rating} / 10 — {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GameReview;
