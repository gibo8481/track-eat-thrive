
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

interface WeekNavigationProps {
  currentWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onShowShoppingList: () => void;
}

export const WeekNavigation = ({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onShowShoppingList,
}: WeekNavigationProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5" />
        <h3 className="font-semibold">
          Week of {format(currentWeek, "MMMM d, yyyy")}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          className="ml-4"
          onClick={onShowShoppingList}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Generate Shopping List
        </Button>
      </div>
    </div>
  );
};
