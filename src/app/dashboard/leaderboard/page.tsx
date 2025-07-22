// Example: src/app/dashboard/leaderboard/page.tsx

"use client";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";


export default function LeaderboardPage() {
  return (
    
    <main className="min-h-screen flex flex-col bg-black font-['Montserrat',_sans-serif] overflow-x-hidden">
      <Sidebar />
      <div className="pl-20">
        <TopBar />
      </div>
      <section className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center mx-auto pt-12">
        <h1 className="text-4xl font-bold text-white mb-12">Leaderboard</h1>
        {}
      </section>
    </main>
  );
}