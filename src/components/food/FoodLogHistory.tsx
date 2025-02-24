
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const FoodLogHistory = () => {
  const { data: foodLogs, isLoading } = useQuery({
    queryKey: ["foodLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_logs")
        .select(`
          *,
          food_items (
            name,
            calories,
            protein_g,
            carbs_g,
            fat_g
          )
        `)
        .order("logged_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Meal</TableHead>
            <TableHead>Food</TableHead>
            <TableHead>Servings</TableHead>
            <TableHead className="text-right">Calories</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {foodLogs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format(new Date(log.logged_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="capitalize">{log.meal_type}</TableCell>
              <TableCell>{log.food_items?.name}</TableCell>
              <TableCell>{log.servings}</TableCell>
              <TableCell className="text-right">
                {Math.round(log.food_items?.calories * log.servings)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
