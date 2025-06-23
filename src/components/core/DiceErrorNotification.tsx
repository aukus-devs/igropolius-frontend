import { useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { X } from "../icons";
import useDiceStore from "@/stores/diceStore";
import { useShallow } from "zustand/shallow";

function DiceErrorNotification() {
  const { error, clearError } = useDiceStore(
    useShallow((state) => ({
      error: state.error,
      clearError: state.clearError,
    }))
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <Card className="bg-destructive/90 text-white border-destructive">
      <CardContent className="p-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{error}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearError}
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default DiceErrorNotification; 