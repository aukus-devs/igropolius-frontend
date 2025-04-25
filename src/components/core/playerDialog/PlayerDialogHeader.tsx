import { Button } from "@/components/ui/button";
import { PlayerData } from "@/types";

type Props = {
  player: PlayerData;
};

function PlayerDialogHeader({ player }: Props) {
  return (
    <div className="relative mb-8">
      <div className="font-wide-black text-4xl text-center mb-2">{player.nickname}</div>
      <div className="flex gap-5 justify-center">
        {player.twitch_stream_link && (
          <Button
            className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.twitch_stream_link} target="_blank noreferrer noopener">
              Твич
            </a>
          </Button>
        )}

        {player.vk_stream_link && (
          <Button
            className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.vk_stream_link} target="_blank noreferrer noopener">
              ВкВидео
            </a>
          </Button>
        )}

        {player.kick_stream_link && (
          <Button
            className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.kick_stream_link} target="_blank noreferrer noopener">
              Кик
            </a>
          </Button>
        )}

        {player.telegram_link && (
          <Button
            className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.telegram_link} target="_blank noreferrer noopener">
              Телеграм
            </a>
          </Button>
        )}

        {player.donation_link && (
          <Button
            className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.donation_link} target="_blank noreferrer noopener">
              Донат
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default PlayerDialogHeader;
