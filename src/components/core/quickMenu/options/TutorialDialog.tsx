import { ArrowRight } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useLocalStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import usePlayerStore from "@/stores/playerStore";
import { BookOpenTextIcon } from "lucide-react";
import { useEffect, useState } from "react";


function TutorialDialog({ className }: { className?: string }) {
	const { value: firstTimeVisit, save: saveFirstTimeVisit } = useLocalStorage({
		key: 'first-time-visit',
		defaultValue: true,
  });
	const myPlayer = usePlayerStore((state) => state.myPlayer)
  const [isOpen, setIsOpen] = useState(firstTimeVisit ? true : false);

  useEffect(() => {
    saveFirstTimeVisit(false);
  }, [saveFirstTimeVisit]);

	return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        <BookOpenTextIcon />
        Гайд
      </DialogTrigger>
      <DialogContent className="w-[600px]" aria-describedby="">
				<DialogHeader>
					<DialogTitle className="text-[32px] font-wide-black leading-[38px]">
						Добро пожаловать в Игрополиус,
						<span className="text-primary"> {myPlayer?.username || 'Зритель'}</span>
					</DialogTitle>
				</DialogHeader>
				<div>

					<div className="font-semibold">
						<p>Ваша задача — набрать наибольшее количество очков, став самым массивным предпринимателем на ивенте.</p>
						<p className="mt-5">Дальше мы в двух словах раскажем об интерфейсе и некоторых особеностях ивента. Эта часть не обязательна, вы можете закрыть это окно, или перейти дальше.</p>
					</div>
					<div className="flex gap-[15px] w-full mt-[50px]">
						<DialogClose asChild>
							<Button size="lg" className="w-[200px] bg-[#494949] hover:bg-[#494949]/50">Закрыть</Button>
						</DialogClose>
						<Button size="lg" className="flex-1">Дальше 1/? <ArrowRight /> </Button>
					</div>
				</div>
      </DialogContent>
    </Dialog>
	)
}

export default TutorialDialog;
