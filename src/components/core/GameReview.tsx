import { Badge } from '../ui/badge';
import { formatMs } from '@/lib/utils';
import { useState } from 'react';
import { Toggle } from '../ui/toggle';
import { VideoCircle, Edit } from '../icons';
import { FALLBACK_GAME_POSTER } from '@/lib/constants';
import { GameCompletionType, PlayerGame } from '@/lib/api-types-generated';
import { parseReview } from '@/lib/textParsing';
import { Button } from '../ui/button';
import GameReviewEditForm from './turnUI/GameReviewEditForm';
import useSystemStore from '@/stores/systemStore';
import ImageLoader from './ImageLoader';

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
        statusText: 'Прошел',
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
  const { title, review, vod_links, duration, length, rating, status, created_at, cover } = game;
  const myUser = useSystemStore(state => state.myUser);

  const [isVodsOpen, setIsVodsOpen] = useState(false);
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

  function toggleVods() {
    setIsVodsOpen(!isVodsOpen);
  }

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
          <Toggle
            size="sm"
            className="bg-foreground/20 text-foreground/70"
            disabled={!vod_links}
            onPressedChange={toggleVods}
          >
            <VideoCircle />
            Записи
          </Toggle>
        </div>
      </div>
      <h3 className="text-2xl mb-2.5 font-wide-semibold">{title}</h3>
      <div className="flex gap-2.5">
        <ImageLoader
          className="min-w-[105px] w-[105px] h-[140px] rounded-md overflow-hidden"
          src={cover || FALLBACK_GAME_POSTER}
          alt={title}
        />
        <div className="text-muted-foreground">
          {length && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              <Badge className="bg-white/20 text-white/70 font-semibold">
                <p> Время — {duration && duration > 0 ? formatMs(duration * 1000) : '[Н/Д]'}</p>
              </Badge>
              <Badge className="bg-white/20 text-white/70 font-semibold">
                <p> По HLTB — {length}ч</p>
              </Badge>
            </div>
          )}
          {isVodsOpen ? (
            <div className="flex flex-col">
              {vod_links?.split(',')?.map(vod => (
                <a
                  key={vod}
                  href={vod}
                  target="_blank"
                  className="hover:underline underline-offset-4 break-all"
                >
                  {vod}
                </a>
              ))}
            </div>
          ) : (
            <p>
              {' '}
              {rating} / 10 — {parseReview(review)}{' '}
            </p>
          )}
        </div>
      </div>

      {showEditForm && (
        <GameReviewEditForm gameToEdit={game} open={showEditForm} setOpen={setShowEditForm} />
      )}
    </div>
  );
}

export default GameReview;
