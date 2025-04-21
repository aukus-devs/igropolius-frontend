import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  avatar: string;
  socials: string[];
};

function PlayerDialogHeader({ name, avatar, socials }: Props) {
  return (
    <div className="relative mb-8 pt-[76px]">
      <div className="absolute top-0 left-0 z-[-1] w-full h-[240px] blur-2xl">
        <img src={avatar} className="w-full h-full opacity-50" alt="player avatar" />
      </div>
      <div className="font-wide-black text-4xl text-center mb-2">{name}</div>
      <div className="flex gap-5 justify-center">
        {socials.map((url) => (
          <Button
            className="font-wide-demi text-muted-foreground hover:text-foreground h-auto p-0"
            key={url}
            variant="link"
          >
            <a href={url} target="_blank">
              {url}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default PlayerDialogHeader;
