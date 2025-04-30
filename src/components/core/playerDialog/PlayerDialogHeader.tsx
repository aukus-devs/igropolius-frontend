import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayerData } from "@/lib/types";

function PlayerSocials({ player }: { player: PlayerData; }) {
  const socials = [
    { href: player.twitch_stream_link, title: "Твич" },
    { href: player.vk_stream_link, title: "ВкВидео" },
    { href: player.kick_stream_link, title: "Кик" },
    { href: player.telegram_link, title: "Телеграм" },
    { href: player.donation_link, title: "Донат" },
  ];

  return (
    <div className="flex gap-5 justify-center">
      {socials.map(({ href, title }) => (href && (
        <Button
          key={title}
          className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
          variant="link"
        >
          <a href={href} target="_blank">{title}</a>
        </Button>
      )))}
    </div>
  )
}

function PlayerDialogHeader({ player }: { player: PlayerData; }) {
  return (
    <div className="relative pt-8 mb-6">
      <div className="flex gap-2 justify-center items-center mb-5">
        <div className="relative">
          <Avatar className="w-11 h-11 overflow-auto">
            <AvatarImage src={player.avatar_link} />
            <AvatarFallback className="uppercase">{player.nickname.slice(0, 2)}</AvatarFallback>
          </Avatar>
          {player.is_online && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] leading-3 bg-red-500 px-1 rounded-[2px] font-medium">
              LIVE
            </div>
          )}
        </div>
        <div className="font-wide-black text-4xl text-center">{player.nickname}</div>
      </div>
      <PlayerSocials player={player} />
    </div>
  );
}

export default PlayerDialogHeader;
