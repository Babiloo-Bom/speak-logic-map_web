import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Button, Rate, message } from "antd";
import { getAuthToken } from "@/utils/constants";
import DEFAULT_AVATAR from "@/assets/images/user.jpg";

type ProviderData = {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  rating: number;
  image_url?: string;
  url?: string;
  website_url?: string;
  is_applicable?: boolean;
  functions?: Array<{ id: number; name: string; description?: string }>;
  problems?: Array<{ id: number; name: string; description?: string }>;
};

export default function ProviderProfilePage() {
  const router = useRouter();
  const [providerData, setProviderData] = useState<ProviderData | null>(null);
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
        const res = await fetch("/api/providers/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          router.replace("/userprofile");
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          message.error(err.error || "Không tải được hồ sơ provider");
          router.replace("/userprofile");
          return;
        }
        const data = await res.json();
        setProviderData(data);
        const url = data?.image_url;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!providerData) return null;

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
          <h1 className="text-white text-3xl md:text-4xl font-semibold drop-shadow">Provider Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-12">
        {/* Article Author + Avatar + Name + Rating */}
        <div className="flex flex-col items-center">
          <p className="text-gray-500 text-lg mb-2">Article Author</p>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
            <Image
              src={avatarSrc}
              alt={providerData.name}
              fill
              className="object-cover"
              onError={() => setAvatarSrc(DEFAULT_AVATAR)}
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{providerData.name}</h2>
          <Rate disabled value={providerData.rating} allowHalf className="mt-1" />
          <div className="flex items-center gap-3 mt-4">
            <Link href="/my-rating">
              <Button type="primary" size="large" className="bg-[#324899] border-[#324899]">
                My Ratings
              </Button>
            </Link>
            <Link href="/my-articles">
              <Button size="large" className="bg-white text-[#324899] border-[#324899] hover:!bg-gray-50 hover:!border-[#324899]">
                My Articles
              </Button>
            </Link>
          </div>
        </div>

        {/* About Provider */}
        <div className="mt-10 max-w-2xl mx-auto text-left bg-white rounded-lg p-6 shadow-sm" style={{ border: '1px solid #D0DAEE' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About Provider:</h3>
          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {providerData.description || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
