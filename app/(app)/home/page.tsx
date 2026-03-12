"use client";
import { HomeHeader } from "@/components/home/home-header";
import { StatsBar } from "@/components/home/stats-bar";
import { UpNext } from "@/components/home/up-next";
import { Schedule } from "@/components/home/schedule";
import { MyTasks } from "@/components/home/my-tasks";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5">
      <HomeHeader />
      <StatsBar />

      {/* Two column section */}
      <div className="grid grid-cols-2 gap-5">
        <UpNext />
        <Schedule />
      </div>

      <MyTasks />
    </div>
  );
}
