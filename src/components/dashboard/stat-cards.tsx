
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Plane, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
  style: {
    iconBg: string;
    iconColor: string;
  };
}

const stats: Stat[] = [
  {
    icon: Briefcase,
    value: "128",
    label: "Total Bookings",
    style: { iconBg: "bg-primary/20", iconColor: "text-primary" },
  },
  {
    icon: Users,
    value: "56",
    label: "Active Clients",
    style: { iconBg: "bg-chart-2/20", iconColor: "text-chart-2" },
  },
  {
    icon: Plane,
    value: "$24,560",
    label: "Revenue",
    style: { iconBg: "bg-accent/20", iconColor: "text-accent" },
  },
  {
    icon: ListTodo,
    value: "12",
    label: "Pending Tasks",
    style: { iconBg: "bg-destructive/20", iconColor: "text-destructive" },
  },
];

const StatCards = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${stat.style.iconBg}`}
            >
              <stat.icon className={`h-7 w-7 ${stat.style.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-3xl font-bold">{stat.value}</p>
              <p className="truncate text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
