import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import GameReview from "./GameReview";
import { GameReviewType } from "@/types";

function ReviewsTab({ games }: { games: GameReviewType[] }) {
  const [searchText, setSearchText] = useState("");
  const filteredGames = games.filter((game) =>
    game.gameTitle.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <>
      <div className="relative">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size="1rem"
        />
        <Input
          id="search"
          type="text"
          className="pl-8 font-roboto-wide-semibold bg-foreground/10"
          placeholder="Поиск по играм"
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-8 py-8">
        {filteredGames.map((game) => (
          <GameReview key={game.gameTitle} game={game} />
        ))}
      </div>
    </>
  );
}

export default ReviewsTab;
