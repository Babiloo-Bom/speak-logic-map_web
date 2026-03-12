"use client";

import { Modal } from "antd";
import { CheckOutlined, UserOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Icon } from "leaflet";
import type { ProviderItem } from "@/lib/pages/provider-search/types";

import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

const DEFAULT_CENTER: [number, number] = [21.0285, 105.8542];
const DEFAULT_ZOOM = 4;

interface ShowMapModalProps {
  open: boolean;
  onClose: () => void;
  provider: ProviderItem | null;
}

export default function ShowMapModal({
  open,
  onClose,
  provider,
}: ShowMapModalProps) {
  const [mounted, setMounted] = useState(false);
  const [markerIcon, setMarkerIcon] = useState<Icon | null>(null);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setMarkerIcon(icon);
    });
    return () => {
      cancelled = true;
    };
  }, [open, mounted]);

  const hasCoords =
    provider &&
    typeof provider.lat === "number" &&
    typeof provider.lng === "number" &&
    !Number.isNaN(provider.lat) &&
    !Number.isNaN(provider.lng);

  const center: [number, number] = hasCoords
    ? [provider!.lat!, provider!.lng!]
    : DEFAULT_CENTER;
  const zoom = hasCoords ? 13 : DEFAULT_ZOOM;
  const functionLabel =
    provider?.function || provider?.functions?.[0]?.name || "";
  const givenSetApplicable =
    provider?.is_applicable ?? provider?.is_given_set ?? false;

  return (
    <Modal
      title={
        <div className="w-full text-center">
          <span className="text-lg font-semibold text-[#324899]">Show Map</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      destroyOnClose
      className="show-map-modal"
      styles={{ body: { padding: 0 } }}
    >
      <div className="rounded-b-xl overflow-hidden">
        {/* Map */}
        <div className="relative h-[360px] w-full bg-gray-100">
          {mounted && open && (
            <MapContainer
              center={center}
              zoom={zoom}
              scrollWheelZoom={true}
              style={{ width: "100%", height: "100%", zIndex: 0 }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {hasCoords && markerIcon && (
                <Marker
                  position={[provider!.lat!, provider!.lng!]}
                  icon={markerIcon}
                />
              )}
            </MapContainer>
          )}

          {/* Provider info box overlay - centered vertically & horizontally */}
          {provider && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 transform z-[1000] pointer-events-none flex justify-center">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 pointer-events-auto max-w-md w-full mx-4">
                <p className="text-xs text-gray-500 mb-0.5">Provider Name</p>
                <p className="text-green-600 font-semibold mb-1">
                  {provider.name || "—"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  The Given Set Applicab
                  {givenSetApplicable ? (
                    <CheckOutlined className="text-green-600 ml-1" />
                  ) : null}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  {provider.url || provider.website_url || "—"}
                  <UserOutlined className="text-blue-500 text-xs" />
                </p>
                {functionLabel ? (
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="text-gray-500">Function: </span>
                    <span className="text-green-600">{functionLabel}</span>
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
