"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { getSentPayment } from "@/view-functions/getSentPayment";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const description = "An interactive line chart";

const chartData = [
  { date: "2024-04-01", payment: 222 },
  { date: "2024-04-02", payment: 97 },
  { date: "2024-04-03", payment: 167 },
  { date: "2024-04-04", payment: 242 },
  { date: "2024-04-05", payment: 373 },
  { date: "2024-04-06", payment: 301 },
  { date: "2024-04-07", payment: 245 },
  { date: "2024-04-08", payment: 409 },
  { date: "2024-04-09", payment: 59 },
  { date: "2024-04-10", payment: 261 },
  { date: "2024-04-11", payment: 327 },
  { date: "2024-04-12", payment: 292 },
  { date: "2024-04-13", payment: 342 },
  { date: "2024-04-14", payment: 137 },
  { date: "2024-04-15", payment: 120 },
  { date: "2024-04-16", payment: 138 },
  { date: "2024-04-17", payment: 446 },
  { date: "2024-04-18", payment: 364 },
  { date: "2024-04-19", payment: 243 },
  { date: "2024-04-20", payment: 89 },
  { date: "2024-04-21", payment: 137 },
  { date: "2024-04-22", payment: 224 },
  { date: "2024-04-23", payment: 138 },
  { date: "2024-04-24", payment: 387 },
  { date: "2024-04-25", payment: 215 },
  { date: "2024-04-26", payment: 75 },
  { date: "2024-04-27", payment: 383 },
  { date: "2024-04-28", payment: 122 },
  { date: "2024-04-29", payment: 315 },
  { date: "2024-04-30", payment: 454 },
  { date: "2024-05-01", payment: 165 },
  { date: "2024-05-02", payment: 293 },
  { date: "2024-05-03", payment: 247 },
  { date: "2024-05-04", payment: 385 },
  { date: "2024-05-05", payment: 481 },
  { date: "2024-05-06", payment: 498 },
  { date: "2024-05-07", payment: 388 },
  { date: "2024-05-08", payment: 149 },
  { date: "2024-05-09", payment: 227 },
  { date: "2024-05-10", payment: 293 },
  { date: "2024-05-11", payment: 335 },
  { date: "2024-05-12", payment: 197 },
  { date: "2024-05-13", payment: 197 },
  { date: "2024-05-14", payment: 448 },
  { date: "2024-05-15", payment: 473 },
  { date: "2024-05-16", payment: 338 },
  { date: "2024-05-17", payment: 499 },
  { date: "2024-05-18", payment: 315 },
  { date: "2024-05-19", payment: 235 },
  { date: "2024-05-20", payment: 177 },
  { date: "2024-05-21", payment: 82 },
  { date: "2024-05-22", payment: 81 },
  { date: "2024-05-23", payment: 252 },
  { date: "2024-05-24", payment: 294 },
  { date: "2024-05-25", payment: 201 },
  { date: "2024-05-26", payment: 213 },
  { date: "2024-05-27", payment: 420 },
  { date: "2024-05-28", payment: 233 },
  { date: "2024-05-29", payment: 78 },
  { date: "2024-05-30", payment: 340 },
  { date: "2024-05-31", payment: 178 },
  { date: "2024-06-01", payment: 178 },
  { date: "2024-06-02", payment: 470 },
  { date: "2024-06-03", payment: 103 },
  { date: "2024-06-04", payment: 439 },
  { date: "2024-06-05", payment: 88 },
  { date: "2024-06-06", payment: 294 },
  { date: "2024-06-07", payment: 323 },
  { date: "2024-06-08", payment: 385 },
  { date: "2024-06-09", payment: 438 },
  { date: "2024-06-10", payment: 155 },
  { date: "2024-06-11", payment: 92 },
  { date: "2024-06-12", payment: 492 },
  { date: "2024-06-13", payment: 81 },
  { date: "2024-06-14", payment: 426 },
  { date: "2024-06-15", payment: 307 },
  { date: "2024-06-16", payment: 371 },
  { date: "2024-06-17", payment: 475 },
  { date: "2024-06-18", payment: 107 },
  { date: "2024-06-19", payment: 341 },
  { date: "2024-06-20", payment: 408 },
  { date: "2024-06-21", payment: 169 },
  { date: "2024-06-22", payment: 317 },
  { date: "2024-06-23", payment: 480 },
  { date: "2024-06-24", payment: 132 },
  { date: "2024-06-25", payment: 141 },
  { date: "2024-06-26", payment: 434 },
  { date: "2024-06-27", payment: 448 },
  { date: "2024-06-28", payment: 149 },
  { date: "2024-06-29", payment: 103 },
  { date: "2024-06-30", payment: 446 },
];

const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Payments received",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Payments sent",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function Linechart() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop");

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardDescription>{activeChart === "desktop" ? "Payments received" : "Payments sent"}</CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
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
