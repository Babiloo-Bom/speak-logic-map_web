import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Button, Rate, Tabs, message } from "antd";
import { EditOutlined, CheckOutlined, UserOutlined } from "@ant-design/icons";
import { getAuthToken } from "@/utils/constants";
import DEFAULT_AVATAR from "@/assets/images/user.jpg";
import LocationMiniMap from "@/components/Profile/LocationMiniMap";

type ManagerData = {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  expertise?: string;
  rating: number;
  rating_count: number;
  is_given_set: boolean;
  image_url?: string;
  avatar_url?: string;
  avatar?: string;
  city?: string;
  country?: string;
  location?: string;
  phone?: string;
  website?: string;
  zip_code?: string;
  functions?: Array<{ id: number; name: string; description?: string }>;
  problems?: Array<{ id: number; name: string; description?: string }>;
};

export default function ManagerProfilePage() {
  const router = useRouter();
  const [managerData, setManagerData] = useState<ManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState<string | typeof DEFAULT_AVATAR>(DEFAULT_AVATAR);

  useEffect(() => {
    const fetchMe = async () => {
      const token = getAuthToken();
      if (!token) {
        message.error("Vui lòng đăng nhập");
        router.replace("/auth/sign-in");
        return;
      }
      try {
        const res = await fetch("/api/managers/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          router.replace("/userprofile");
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          message.error(err.error || "Không tải được hồ sơ manager");
          router.replace("/userprofile");
          return;
        }
        const data = await res.json();
        setManagerData(data);
        const url = data?.avatar ?? data?.image_url ?? data?.avatar_url;
        setAvatarSrc(url ? url : DEFAULT_AVATAR);
      } catch {
        message.error("Lỗi tải hồ sơ");
        router.replace("/userprofile");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [router]);

  const functionNames = managerData?.functions?.map((f) => f.name).join(", ") || managerData?.description || "—";
  const problemNames = managerData?.problems?.map((p) => p.name).join(", ") || "—";
  const address = (managerData as any)?.location || [managerData?.city, managerData?.country].filter(Boolean).join(", ") || "—";
  const addressWithZip =
    address === "—"
      ? "—"
      : managerData?.zip_code
        ? `${address}, ${managerData.zip_code}`
        : address;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!managerData) return null;

  const rowClass = "flex flex-wrap items-baseline gap-2 py-4 border-b border-gray-100 last:border-0";
  const labelClass = "font-semibold text-gray-900 shrink-0 min-w-[140px]";
  const valueClass = "text-gray-500 text-sm";

  const tabItems = [
    {
      key: "about",
      label: "About",
      children: (
        <div className="py-4 max-w-2xl mx-auto text-left">
          <div className={rowClass}>
            <span className={labelClass}>Manager Function</span>
            <span className={valueClass}>{functionNames}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Manager Expertise</span>
            <span className={valueClass}>{managerData.expertise || "—"}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>Problem Solved</span>
            <span className={valueClass}>{problemNames}</span>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" checked={managerData.is_given_set} readOnly className="rounded" />
            <span className="text-sm">The Given Set Applicable</span>
          </div>
        </div>
      ),
    },
    {
      key: "function",
      label: "Function",
      children: (
        <div className="py-4 max-w-2xl mx-auto text-left">
          <div className={rowClass}>
            <span className={labelClass}>Function Description</span>
            <span className={valueClass}>{managerData.description || "—"}</span>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" checked={managerData.is_given_set} readOnly className="rounded" />
            <span className="text-sm">The Given Set Applicable</span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      children: (
        <div className="py-4 max-w-2xl mx-auto text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
          <p className={`${valueClass} mb-4`}>{addressWithZip}</p>
          <div className="rounded-b-xl overflow-hidden mb-6 relative h-[360px] w-full bg-gray-100">
            {address && address !== "—" ? (
              <>
                <LocationMiniMap locationName={address} height={360} />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 transform z-[1000] pointer-events-none flex justify-center">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 pointer-events-auto max-w-md w-full mx-4">
                    <p className="text-xs text-gray-500 mb-0.5">Manager Name</p>
                    <p className="text-green-600 font-semibold mb-1">{managerData?.name || "—"}</p>
                    <p className="text-xs text-gray-500 truncate">
                      The Given Set Applicab
                      {managerData?.is_given_set ? <CheckOutlined className="text-green-600 ml-1" /> : null}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {managerData?.website || "—"}
                      <UserOutlined className="text-blue-500 text-xs" />
                    </p>
                    {functionNames && functionNames !== "—" ? (
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="text-gray-500">Function: </span>
                        <span className="text-green-600">{functionNames}</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Chưa có địa chỉ. Cập nhật tại trang User Profile.</div>
            )}
          </div>
          <div className="py-4 border-b border-gray-100">
            <p className={labelClass}>Phone</p>
            <p className={`${valueClass} mt-1`}>{managerData?.phone || "—"}</p>
          </div>
          <div className="py-4 border-b border-gray-100">
            <p className={labelClass}>Website</p>
            <p className={`${valueClass} mt-1`}>{managerData?.website || "—"}</p>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" checked={managerData.is_given_set} readOnly className="rounded" />
            <span className="text-sm">The Given Set Applicable</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Banner */}
      <div className="relative h-[200px] md:h-[240px] bg-cover bg-center bg-[#e8eef3]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-semibold drop-shadow">Manager Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-12">
        {/* Avatar + Name + Rating */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
            <Image
              src={avatarSrc}
              alt={managerData.name}
              fill
              className="object-cover"
              onError={() => setAvatarSrc(DEFAULT_AVATAR)}
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{managerData.name}</h2>
          <Rate disabled value={managerData.rating} allowHalf className="mt-1" />
          <div className="flex items-center gap-3 mt-4">
            <Link href="/userprofile">
              <Button type="default" icon={<EditOutlined />} className="bg-white text-[#324899] border-[#324899] hover:!bg-gray-50 hover:!border-[#324899]">
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Panel / Function Rating */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link href="/my-rating">
            <Button size="large" className="bg-white text-[#324899] border-[#324899] hover:!bg-gray-50 hover:!border-[#324899]">
              Project Panel
            </Button>
          </Link>
          <Link href="/function-ratings">
            <Button size="large" className="bg-white text-[#324899] border-[#324899] hover:!bg-gray-50 hover:!border-[#324899]">
              Function Rating
            </Button>
          </Link>
        </div>

        {/* Tabs - dàn đều 3 tab ra toàn bộ header */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Tabs
            defaultActiveKey="about"
            items={tabItems}
            className="[&_.ant-tabs-nav]:!w-full [&_.ant-tabs-nav-list]:!w-full [&_.ant-tabs-nav-list]:!flex [&_.ant-tabs-tab]:!flex-1 [&_.ant-tabs-tab]:!justify-center [&_.ant-tabs-content]:px-4"
          />
        </div>
      </div>
    </div>
  );
}
