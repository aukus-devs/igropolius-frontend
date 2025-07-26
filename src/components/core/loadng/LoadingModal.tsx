import { LoaderCircleIcon } from 'lucide-react';

export default function LoadingModal() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50"
      aria-modal="true"
      role="dialog"
      aria-label="Loading"
    >
      <div>Подключаюсь к серверам</div>
      <LoaderCircleIcon className="animate-spin text-primary" size={50} />
    </div>
  );
}
