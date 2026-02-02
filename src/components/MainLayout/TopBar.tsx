import { observer } from "mobx-react-lite";
import { useUserStore } from "@/providers/RootStoreProvider";
import Link from "next/link";

const TopBar = observer(() => {
  const userStore = useUserStore();
  const isAdmin = userStore.hasRole("admin");

  return (
    <div className="bg-black text-white text-xs overflow-hidden">
      <div className="mx-12 px-4 py-2 flex justify-between">
        <div className="hidden md:flex gap-4">
          <span>Training</span>
          <span>Manager Module</span>
          <span>Rating</span>
          <span>Privacy</span>
          <span>Support us</span>
          <span>About Us</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
            >
              Admin
            </Link>
          )}
          <span>🔔</span>
          <span>👤</span>
        </div>
      </div>
    </div>
  );
});
export default TopBar;
