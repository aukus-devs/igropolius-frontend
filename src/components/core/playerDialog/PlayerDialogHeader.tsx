import { Button } from "@/components/ui/button";
import { PlayerData } from "@/types";

type Props = {
  player: PlayerData;
};

function PlayerDialogHeader({ player }: Props) {
  const socials = [
    { href: player.twitch_stream_link, title: 'Твич' },
    { href: player.vk_stream_link, title: 'ВкВидео' },
    { href: player.kick_stream_link, title: 'Кик' },
    { href: player.telegram_link, title: 'Телеграм' },
    { href: player.donation_link, title: 'Донат' },
  ];

  return (
    <div className="relative mb-8">
      <div className="font-wide-black text-4xl text-center mb-2">{player.nickname}</div>
      <div className="flex gap-5 justify-center">
        {socials.map(({ href, title }) =>
        (href && (
          <Button
            className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
            variant="link"
          >
            <a href={href} target="_blank">{title}</a>
          </Button>
        ))
        )}
      </div>
    </div>
  );
}

export default PlayerDialogHeader;
