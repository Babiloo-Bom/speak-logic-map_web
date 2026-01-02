import React, { useEffect, useState } from "react";
import ProfileList from "./ProfileList";
import { Profile } from "./types";
import HeaderSearch from "@/components/HeaderSearch/HeaderSearch";
import { getAuthToken } from "@/utils/constants";

function ManagerSearch() {
  const [data, setData] = useState<Profile[]>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch("/api/managers/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response: ", response);
    } catch (error) {
      setError("Network error. Please try again.");
    }

    //   if (response.ok) {
    //     const data: ApiResponse = await response.json();
    //     setUser(data.user);
    //     setProfile(data.profile);

    //     // Update form data
    //     if (data.profile) {
    //       setFormData({
    //         firstName: data.profile.first_name || '',
    //         lastName: data.profile.last_name || '',
    //         title: data.profile.title || '',
    //         function: data.profile.function || '',
    //         penName: data.profile.pen_name || '',
    //       });
    //     }
    //   } else {
    //     const errorData = await response.json();
    //     setError(errorData.error || 'Failed to fetch profile');
    //   }
    // } catch (error) {
    //   setError('Network error. Please try again.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  useEffect(() => {
    fetchProfile();
    // setTimeout(() => {
    //   setData(
    //     Array.from({ length: 9 }).map((_, i) => ({
    //       id: String(i),
    //       name: "Patrick Thompson",
    //       avatar: "/images/avatar.png",
    //       rating: 5,
    //       functionProvided: "Manage house Renovation",
    //       expertise: "House renovation, Expertise 2",
    //       applicable: true,
    //     }))
    //   );
    // }, 2000);
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
