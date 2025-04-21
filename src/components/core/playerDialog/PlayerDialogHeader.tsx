import { Button } from "@/components/ui/button";
import { PlayerData } from "@/types";

type Props = {
  player: PlayerData;
};

function PlayerDialogHeader({ player }: Props) {
  return (
    <div className="relative mb-8 pt-[76px]">
      <div className="absolute top-0 left-0 z-[-1] w-full h-[240px] blur-2xl">
        <img
          src={player.avatar_link}
          className="w-full h-full opacity-50"
          alt="player avatar"
        />
      </div>
      <div className="font-wide-black text-4xl text-center mb-2">{player.nickname}</div>
      <div className="flex gap-5 justify-center">
        {player.twitch_stream_link && (
          <Button
            className="font-wide-demi text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.twitch_stream_link} target="_blank noreferrer noopener">
              Твич
            </a>
          </Button>
        )}

        {player.vk_stream_link && (
          <Button
            className="font-wide-demi text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.vk_stream_link} target="_blank noreferrer noopener">
              ВкВидео
            </a>
          </Button>
        )}

        {player.kick_stream_link && (
          <Button
            className="font-wide-demi text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.kick_stream_link} target="_blank noreferrer noopener">
              Кик
            </a>
          </Button>
        )}

        {player.telegram_link && (
          <Button
            className="font-wide-demi text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={player.telegram_link} target="_blank noreferrer noopener">
              Телеграм
            </a>
          </Button>
        )}

        {player.donation_link && (
          <Button
            className="font-wide-demi text-muted-foreground hover:text-foreground h-auto p-0"
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
