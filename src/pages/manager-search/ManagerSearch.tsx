import React, { useEffect, useState } from "react";
import ProfileList from "./ProfileList";
import { Profile } from "./types";
import HeaderSearch from "@/components/HeaderSearch/HeaderSearch";

function ManagerSearch() {
  const [data, setData] = useState<Profile[]>();

  useEffect(() => {
    setTimeout(() => {
      setData(
        Array.from({ length: 9 }).map((_, i) => ({
          id: String(i),
          name: "Patrick Thompson",
          avatar: "/images/avatar.png",
          rating: 5,
          functionProvided: "Manage house Renovation",
          expertise: "House renovation, Expertise 2",
          applicable: true,
        }))
      );
    }, 2000);
  }, []);

  return (
    <div className="mx-12 px-4 py-8">
      <HeaderSearch imageUrl="/img/search-bar.png" />
      <div className="mt-8">
        <ProfileList data={data} />
      </div>
    </div>
  );
}

export default ManagerSearch;
