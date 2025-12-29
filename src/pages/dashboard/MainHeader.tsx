const MainHeader = () => (
  <header className="bg-white shadow">
    <div className="mx-12 px-4 py-4 flex items-center justify-between overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-700 text-white font-bold flex items-center justify-center rounded">FP</div>
        <span className="font-semibold text-lg">Function Provider</span>
      </div>

      <nav className="hidden md:flex gap-6 text-sm font-medium">
        <a href="#">Provider</a>
        <a href="#">Problem</a>
        <a href="#">Function</a>
        <a href="#">News</a>
      </nav>

      <button className="md:hidden text-2xl">☰</button>
    </div>
  </header>
);
export default MainHeader;
