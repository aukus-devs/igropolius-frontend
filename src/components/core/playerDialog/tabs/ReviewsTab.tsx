import { Input } from "@/components/ui/input";
import { GameReviewType } from "@/lib/types";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import GameReview from "./GameReview";

type Props = {
  reviews: GameReviewType[];
};

function ReviewsTab({ reviews }: Props) {
  const [searchText, setSearchText] = useState("");
  const filteredReviews = reviews.filter((review) =>
    review.gameTitle.toLowerCase().includes(searchText.toLowerCase()),
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
          className="pl-8 font-roboto-wide-semibold"
          placeholder="Поиск по играм"
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-8 py-8">
        {filteredReviews.map((review) => (
          <GameReview key={review.gameTitle} review={review} />
        ))}
      </div>
    </>
  );
}

export default ReviewsTab;
