import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import NotificationPanel from "../notifications/NotificationPanel";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-mesh flex flex-col">
      {/* Desktop sidebar nav */}
      <Navbar />

      {/* Page content */}
      <main className="flex-1 md:ml-20 lg:ml-64 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Global notification panel */}
      <NotificationPanel />
    </div>
  );
}
