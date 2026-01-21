const TopBar = () => (
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
        <span>🔔</span>
        <span>👤</span>
      </div>
    </div>
  </div>
);
export default TopBar;
