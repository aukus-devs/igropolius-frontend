import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { useEffect, useState } from 'react';

type Props = {
  size: 'small' | 'large';
  header: React.ReactNode;
  value?: React.ReactNode;
  description: string;
  variant: 'positive' | 'negative' | 'neutral';
  tooltipHeader?: string;
  image?: string;
};

export default function BonusCardComponent({
  size,
  header,
  value,
  variant,
  description,
  tooltipHeader,
  image,
}: Props) {
  const isMobile = useIsMobile();
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (showDescription) {
        setShowDescription(false);
      }
    };

    if (isMobile) {
      document.addEventListener('scroll', handleScroll, { passive: true });
      return () => document.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, showDescription]);

  if (size === 'small') {
    return (
      <SmallBonusCard
        header={header}
        value={value}
        variant={variant}
        description={description}
        tooltipHeader={tooltipHeader}
        image={image}
      />
    );
  }

  const handleCardClick = () => {
    if (isMobile) {
      setShowDescription(!showDescription);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowDescription(false);
    }
  };

  if (isMobile) {
    return (
      <div className="relative">
        <div
          className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl cursor-pointer"
          onClick={handleCardClick}
        >
          <div
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[170px] rounded-xl overflow-hidden justify-center items-center text-4xl data-[variant=positive]:bg-green-500/30 data-[variant=positive]:text-green-400 data-[variant=neutral]:bg-blue-500/30 data-[variant=neutral]:text-blue-400 data-[variant=negative]:bg-red-500/30 data-[variant=negative]:text-red-400"
            data-variant={variant}
          >
            {image ? (
              <div className="relative">
                <img src={image} />
                <div className="z-50 absolute top-14 left-12 text-white">{value}</div>
              </div>
            ) : (
              <div>
                <div className="text-xl mt-4 mb-4">{header}</div>
                <div className="text-2xl">{value}</div>
              </div>
            )}
          </div>
        </div>
        {showDescription && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            <div className="bg-card/95 backdrop-blur-[1.5rem] p-4 rounded-lg border shadow-lg w-full max-w-sm">
              <div className="text-[16px] font-semibold mb-2">{header}</div>
              <div className="text-sm font-semibold text-muted-foreground">{description}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl">
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger>
          <div
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[170px] rounded-xl data-[variant=positive]:bg-green-500/30 data-[variant=positive]:text-green-400  data-[variant=neutral]:bg-blue-500/30 data-[variant=neutral]:text-blue-400 data-[variant=negative]:bg-red-500/30 data-[variant=negative]:text-red-400 justify-center text-4xl  "
            data-variant={variant}
          >
            {image ? (
              <div className="relative">
                <img src={image} />
                <div className="z-50 absolute top-14 left-12 text-white">{value}</div>
              </div>
            ) : (
              <div>
                <div className="text-xl mt-4 mb-4">{header}</div>
                <div className="text-2xl">{value}</div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3 rounded-xl"
          side="right"
          align="start"
          sideOffset={8}
        >
          <div className="text-[20px] font-semibold mb-2 leading-6">{tooltipHeader ?? header}</div>
          <div className="text-base font-semibold text-muted-foreground leading-[19px]">
            {description}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function SmallBonusCard({
  header,
  value,
  variant,
  description,
  tooltipHeader,
  image,
}: Omit<Props, 'size'>) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className="w-[32px] h-[45px] rounded-sm data-[variant=positive]:bg-green-500/30 data-[variant=positive]:text-green-400  data-[variant=neutral]:bg-blue-500/30 data-[variant=neutral]:text-blue-400 data-[variant=negative]:bg-red-500/30 data-[variant=negative]:text-red-400 "
          data-variant={variant}
        >
          {image ? (
            <div className="relative">
              <img src={image} />
              <div className="z-50 absolute top-2 left-2 text-sm text-white/70">{value}</div>
            </div>
          ) : (
            <>
              {header} {value}
            </>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="w-[200px]">
          <div className="text-[20px] font-semibold mb-2 leading-6">{tooltipHeader}</div>
          <div className="text-base font-semibold text-muted-foreground leading-[19px]">
            {description}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
