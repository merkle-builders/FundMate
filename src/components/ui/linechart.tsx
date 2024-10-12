"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Payment } from "@/view-functions/getSentPayment";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const description = "An interactive line chart";

const chartData = [
  { date: "2024-04-01", paymentsent: 222, paymentreceived: 200 },
  { date: "2024-04-02", paymentsent: 97, paymentreceived: 200 },
  { date: "2024-04-03", paymentsent: 167, paymentreceived: 200 },
  { date: "2024-04-04", paymentsent: 242, paymentreceived: 200 },
  { date: "2024-04-05", paymentsent: 373, paymentreceived: 200 },
  { date: "2024-04-06", paymentsent: 301, paymentreceived: 200 },
  { date: "2024-04-07", paymentsent: 245, paymentreceived: 200 },
  { date: "2024-04-08", paymentsent: 409, paymentreceived: 200 },
  { date: "2024-04-09", paymentsent: 59, paymentreceived: 200 },
  { date: "2024-04-10", paymentsent: 261, paymentreceived: 200 },
  { date: "2024-04-11", paymentsent: 327, paymentreceived: 200 },
  { date: "2024-04-12", paymentsent: 292, paymentreceived: 200 },
  { date: "2024-04-13", paymentsent: 342, paymentreceived: 200 },
  { date: "2024-04-14", paymentsent: 137, paymentreceived: 200 },
  { date: "2024-04-15", paymentsent: 120, paymentreceived: 200 },
  { date: "2024-04-16", paymentsent: 138, paymentreceived: 200 },
  { date: "2024-04-17", paymentsent: 446, paymentreceived: 200 },
  { date: "2024-04-18", paymentsent: 364, paymentreceived: 200 },
  { date: "2024-04-19", paymentsent: 243, paymentreceived: 200 },
  { date: "2024-04-20", paymentsent: 89, paymentreceived: 200 },
  { date: "2024-04-21", paymentsent: 137, paymentreceived: 200 },
  { date: "2024-04-22", paymentsent: 224, paymentreceived: 200 },
  { date: "2024-04-23", paymentsent: 138, paymentreceived: 200 },
  { date: "2024-04-24", paymentsent: 387, paymentreceived: 200 },
  { date: "2024-04-25", paymentsent: 215, paymentreceived: 200 },
  { date: "2024-04-26", paymentsent: 75, paymentreceived: 200 },
  { date: "2024-04-27", paymentsent: 383, paymentreceived: 200 },
  { date: "2024-04-28", paymentsent: 122, paymentreceived: 200 },
  { date: "2024-04-29", paymentsent: 315, paymentreceived: 200 },
  { date: "2024-04-30", paymentsent: 454, paymentreceived: 200 },
  { date: "2024-05-01", paymentsent: 165, paymentreceived: 200 },
  { date: "2024-05-02", paymentsent: 293, paymentreceived: 200 },
  { date: "2024-05-03", paymentsent: 247, paymentreceived: 200 },
  { date: "2024-05-04", paymentsent: 385, paymentreceived: 200 },
  { date: "2024-05-05", paymentsent: 481, paymentreceived: 200 },
  { date: "2024-05-06", paymentsent: 498, paymentreceived: 200 },
  { date: "2024-05-07", paymentsent: 388, paymentreceived: 200 },
  { date: "2024-05-08", paymentsent: 149, paymentreceived: 200 },
  { date: "2024-05-09", paymentsent: 227, paymentreceived: 200 },
  { date: "2024-05-10", paymentsent: 293, paymentreceived: 200 },
  { date: "2024-05-11", paymentsent: 335, paymentreceived: 200 },
  { date: "2024-05-12", paymentsent: 197, paymentreceived: 200 },
  { date: "2024-05-13", paymentsent: 197, paymentreceived: 200 },
  { date: "2024-05-14", paymentsent: 448, paymentreceived: 200 },
  { date: "2024-05-15", paymentsent: 473, paymentreceived: 200 },
  { date: "2024-05-16", paymentsent: 338, paymentreceived: 200 },
  { date: "2024-05-17", paymentsent: 499, paymentreceived: 200 },
  { date: "2024-05-18", paymentsent: 315, paymentreceived: 200 },
  { date: "2024-05-19", paymentsent: 235, paymentreceived: 200 },
  { date: "2024-05-20", paymentsent: 177, paymentreceived: 200 },
  { date: "2024-05-21", paymentsent: 82, paymentreceived: 200 },
  { date: "2024-05-22", paymentsent: 81, paymentreceived: 200 },
  { date: "2024-05-23", paymentsent: 252, paymentreceived: 200 },
  { date: "2024-05-24", paymentsent: 294, paymentreceived: 200 },
  { date: "2024-05-25", paymentsent: 201, paymentreceived: 200 },
  { date: "2024-05-26", paymentsent: 213, paymentreceived: 200 },
  { date: "2024-05-27", paymentsent: 420, paymentreceived: 200 },
  { date: "2024-05-28", paymentsent: 233, paymentreceived: 200 },
  { date: "2024-05-29", paymentsent: 78, paymentreceived: 200 },
  { date: "2024-05-30", paymentsent: 340, paymentreceived: 200 },
  { date: "2024-05-31", paymentsent: 178, paymentreceived: 200 },
  { date: "2024-06-01", paymentsent: 178, paymentreceived: 200 },
  { date: "2024-06-02", paymentsent: 470, paymentreceived: 200 },
  { date: "2024-06-03", paymentsent: 103, paymentreceived: 200 },
  { date: "2024-06-04", paymentsent: 439, paymentreceived: 200 },
  { date: "2024-06-05", paymentsent: 88, paymentreceived: 200 },
  { date: "2024-06-06", paymentsent: 294, paymentreceived: 200 },
  { date: "2024-06-07", paymentsent: 323, paymentreceived: 200 },
  { date: "2024-06-08", paymentsent: 385, paymentreceived: 200 },
  { date: "2024-06-09", paymentsent: 438, paymentreceived: 200 },
  { date: "2024-06-10", paymentsent: 155, paymentreceived: 200 },
  { date: "2024-06-11", paymentsent: 92, paymentreceived: 200 },
  { date: "2024-06-12", paymentsent: 492, paymentreceived: 200 },
  { date: "2024-06-13", paymentsent: 81, paymentreceived: 200 },
  { date: "2024-06-14", paymentsent: 426, paymentreceived: 200 },
  { date: "2024-06-15", paymentsent: 307, paymentreceived: 200 },
  { date: "2024-06-16", paymentsent: 371, paymentreceived: 200 },
  { date: "2024-06-17", paymentsent: 475, paymentreceived: 200 },
  { date: "2024-06-18", paymentsent: 107, paymentreceived: 200 },
  { date: "2024-06-19", paymentsent: 341, paymentreceived: 200 },
  { date: "2024-06-20", paymentsent: 408, paymentreceived: 200 },
  { date: "2024-06-21", paymentsent: 169, paymentreceived: 200 },
  { date: "2024-06-22", paymentsent: 317, paymentreceived: 200 },
  { date: "2024-06-23", paymentsent: 480, paymentreceived: 200 },
  { date: "2024-06-24", paymentsent: 132, paymentreceived: 200 },
  { date: "2024-06-25", paymentsent: 141, paymentreceived: 200 },
  { date: "2024-06-26", paymentsent: 434, paymentreceived: 200 },
  { date: "2024-06-27", paymentsent: 448, paymentreceived: 200 },
  { date: "2024-06-28", paymentsent: 149, paymentreceived: 200 },
  { date: "2024-06-29", paymentsent: 103, paymentreceived: 200 },
  { date: "2024-06-30", paymentsent: 446, paymentreceived: 200 },
];

const chartConfig = {
  views: {
    label: "Page Views",
  },
  paymentsent: {
    label: "Payments received",
    color: "hsl(var(--chart-1))",
  },
  paymentreceived: {
    label: "Payments sent",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function Linechart() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("paymentsent");

  const total = React.useMemo(
    () => ({
      paymentsent: chartData.reduce((acc, curr) => acc + curr.paymentsent, 0),
      paymentreceived: chartData.reduce((acc, curr) => acc + curr.paymentreceived, 0),
    }),
    [],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardDescription>{activeChart === "paymentsent" ? "Payments sent" : "Payments received"}</CardDescription>
        </div>
        <div className="flex">
          {["paymentsent", "paymentreceived"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground w-[120px]">{chartConfig[chart].label}</span>
                <span className="text-lg font-bold leading-none sm:text-2xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-[700px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line dataKey={activeChart} type="monotone" stroke="green" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
