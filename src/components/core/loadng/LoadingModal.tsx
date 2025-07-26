import { LoaderCircleIcon } from 'lucide-react';

export default function LoadingModal() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      aria-modal="true"
      role="dialog"
      aria-label="Loading"
    >
      <p>Подключаюсь к серверам...</p>
      <LoaderCircleIcon className="animate-spin text-primary" />
    </div>
  );
}
