import { Badge } from '../ui/badge';
import { adjustGameLength, formatMs } from '@/lib/utils';
import { useState } from 'react';
import { Edit, Share } from '../icons';
import { FALLBACK_GAME_POSTER, GameRollTypeShortName } from '@/lib/constants';
import { GameCompletionType, PlayerGame } from '@/lib/api-types-generated';
import { parseReview } from '@/lib/textParsing';
import { Button } from '../ui/button';
import GameReviewEditForm from './turnUI/GameReviewEditForm';
import useSystemStore from '@/stores/systemStore';
import ImageLoader from './ImageLoader';
import { SectorsById } from '@/lib/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type Props = {
  game: PlayerGame;
};

function getStatusData(status: GameCompletionType) {
  switch (status) {
    case 'drop':
      return {
        statusText: 'Дропнул',
        color: 'text-red-500',
      };
    case 'completed':
      return {
        statusText: 'Прошёл',
        color: 'text-green-500',
      };
    case 'reroll':
      return {
        statusText: 'Реролл',
        color: 'text-blue-500',
      };
    default: {
      const error: never = status;
      throw new Error(`Unknown game status: ${error}`);
    }
  }
}

function GameReview({ game }: Props) {
  const { title, review, duration, rating, status, created_at, cover } = game;
  const myUser = useSystemStore(state => state.myUser);

  const [showEditForm, setShowEditForm] = useState(false);

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(created_at * 1000));
  const { color, statusText } = getStatusData(status);

  const canEdit =
    myUser?.role === 'admin' ||
    myUser?.id === game.player_id ||
    (myUser?.role === 'moder' && myUser?.moder_for === game.player_id);

  // revert game length bonus to show actual hltb time
  const adjustedLength = adjustGameLength(game.length, -game.length_bonus);

  const scoreChange = game.score_change_amount;
  const rollType = SectorsById[game.sector_id]?.rollType;

  return (
    <div className="font-semibold">
      <div className="w-full flex items-center justify-between mb-2.5">
        <div className={`${color} font-wide-semibold text-xs`}>
          {statusText} — {formattedDate}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditForm(true)}
              className="text-sm gap-[3px] px-2.5 bg-white/20 text-white/70 hover:bg-white/30"
            >
              <Edit className="size-4" />
              Редактировать
            </Button>
          )}
        </div>
      </div>
      <h3 className="text-2xl mb-2.5 font-wide-semibold leading-tight max-w-full overflow-hidden">
        {title}
      </h3>
      <div className="flex gap-2.5">
        <ImageLoader
          className="min-w-[105px] w-[105px] h-[140px] rounded-md overflow-hidden"
          src={cover || FALLBACK_GAME_POSTER}
          alt={title}
        />
        <div className="text-muted-foreground">
          <div className="flex flex-wrap gap-2 mb-2.5">
            {game.difficulty_level === 1 && (
              <Badge className="bg-red-500/20 text-white/70 font-semibold">
                <p>На сложном</p>
              </Badge>
            )}
            {game.difficulty_level === -1 && (
              <Badge className="bg-green-500/20 text-white/70 font-semibold">
                <p>На легком</p>
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-white/20 text-white/70 font-semibold">
                  <p> Время — {duration && duration > 0 ? formatMs(duration * 1000) : '[Н/Д]'}</p>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Примерное время прохождения по категории стрима</TooltipContent>
            </Tooltip>
            {adjustedLength && (
              <>
                <Badge className="bg-white/20 text-white/70 font-semibold">
                  <p> По HLTB — {adjustedLength}ч</p>
                </Badge>
                {game.length_bonus > 0 && (
                  <Badge className="bg-green-500/20 text-white/70 font-semibold">
                    <p>Тир +{game.length_bonus}</p>
                  </Badge>
                )}
                {game.length_bonus < 0 && (
                  <Badge className="bg-red-500/20 text-white/70 font-semibold">
                    <p>Тир {game.length_bonus}</p>
                  </Badge>
                )}
                {scoreChange && (
                  <Badge className="bg-green-500/20 text-white/70 font-semibold">
                    +{scoreChange} <Share />
                  </Badge>
                )}
              </>
            )}
            {game.status === 'drop' && scoreChange && (
              <Badge className="bg-red-500/20 text-white/70 font-semibold">
                {scoreChange} <Share />
              </Badge>
            )}

            {rollType && (
              <Badge className="bg-white/20 text-white/70 font-semibold">
                <p>
                  {GameRollTypeShortName[rollType]} на #{game.sector_id}
                </p>
              </Badge>
            )}
          </div>

          <p>
            {rating} / 10 — {parseReview(review)}
          </p>
        </div>
      </div>

      {showEditForm && (
        <GameReviewEditForm gameToEdit={game} open={showEditForm} setOpen={setShowEditForm} />
      )}
    </div>
  );
}

export default GameReview;
