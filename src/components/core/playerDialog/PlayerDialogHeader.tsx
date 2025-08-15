import { Donationalerts, Kick, Telegram, Twitch, VkVideoLive } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlayerDetails } from '@/lib/api-types-generated';
import { FALLBACK_AVATAR_URL } from '@/lib/constants';

function getMainPlatformStreamLink(player: PlayerDetails): string | null {
  if (!player.main_platform) return null;

  switch (player.main_platform) {
    case 'twitch':
      return player.twitch_stream_link ?? null;
    case 'vk':
      return player.vk_stream_link ?? null;
    case 'kick':
      return player.kick_stream_link ?? null;
    default:
      return null;
  }
}

function PlayerSocials({ player }: { player: PlayerDetails }) {
  const socials = [
    { href: player.twitch_stream_link, title: 'Твич', Icon: <Twitch /> },
    { href: player.vk_stream_link, title: 'ВкВидео', Icon: <VkVideoLive /> },
    {
      href: player.kick_stream_link,
      title: '',
      Icon: <Kick style={{ width: '48px', height: '16px' }} />,
    },
    { href: player.telegram_link, title: 'Телеграм', Icon: <Telegram /> },
    { href: player.donation_link, title: 'Донат', Icon: <Donationalerts /> },
  ];

  return (
    <div className="flex justify-evenly flex-wrap gap-2 px-4">
      {socials.map(
        ({ href, title, Icon }) =>
          href && (
            <Button
              key={title}
              className="font-wide-semibold text-muted-foreground hover:text-foreground h-auto p-0"
              variant="link"
            >
              <a
                href={href}
                target="_blank"
                className={`flex items-center ${title ? 'gap-[5px]' : ''}`}
              >
                {Icon}
                {title && <span className="text-box-trim-end">{title}</span>}
              </a>
            </Button>
          )
      )}
    </div>
  );
}

function PlayerDialogHeader({ player }: { player: PlayerDetails }) {
  const mainPlatformLink = getMainPlatformStreamLink(player);
  const isStreamLinkAvailable = player.is_online && mainPlatformLink;

  const avatarContent = (
    <Avatar
      className="w-[54px] h-[54px] overflow-auto"
      style={{ outline: `2px solid ${player.color}` }}
    >
      <AvatarImage src={player.avatar_link ?? FALLBACK_AVATAR_URL} />
      <AvatarFallback className="uppercase">{player.username.slice(0, 2)}</AvatarFallback>
    </Avatar>
  );

  return (
    <div className="relative md:pt-8 pt-[50px] mb-6">
      <div className="flex gap-2 justify-center items-center mb-5">
        <div className="relative">
          {isStreamLinkAvailable ? (
            <a
              href={mainPlatformLink}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hover:opacity-80 transition-opacity block"
            >
              {avatarContent}
            </a>
          ) : (
            avatarContent
          )}
          {player.is_online && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm leading-[17px] px-2 rounded-[2px] font-bold pointer-events-none"
              style={{ background: player.color }}
            >
              LIVE
            </div>
          )}
        </div>
        <div className="font-wide-black text-4xl text-center text-box-trim-end">
          {player.username}
        </div>
      </div>
      <PlayerSocials player={player} />
    </div>
  );
}

export default PlayerDialogHeader;
