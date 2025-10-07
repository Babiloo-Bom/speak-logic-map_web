import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "./AuthLayout";
import styles from "./_Auth.module.scss";
import { useUserStore } from "@/providers/RootStoreProvider";
import { observer } from "mobx-react-lite";

interface FormData {
  title: string;
  function: string;
  location: string;
  file: string;
}

interface FormErrors {
  title?: string;
  function?: string;
  location?: string;
  file?: string;
  general?: string;
}

const AddUserDetailForm: React.FC = () => {
  const router = useRouter();
  const userStore = useUserStore();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    function: "",
    location: "",
    file: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(
    null
  );
  const [existingAvatarId, setExistingAvatarId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const getAuthHeaderOrThrow = async (): Promise<string> => {
      let header = userStore.getAuthHeader();
      if (!header) {
        const ok = await userStore.refreshToken();
        if (ok) {
          header = userStore.getAuthHeader();
        }
      }
      if (!header) {
        throw new Error("No token provided");
      }
      return header;
    };

    const loadProfile = async () => {
      try {
        const doGet = async () => {
          const authHeader = await getAuthHeaderOrThrow();
          const res = await fetch("/api/user/profile", {
            method: "GET",
            headers: {
              Authorization: authHeader,
            },
          });
          return res;
        };

        let res = await doGet();
        if (res.status === 401) {
          const ok = await userStore.refreshToken();
          if (ok) res = await doGet();
        }
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          const p = data?.profile;
          if (p) {
            setFormData((prev) => ({
              ...prev,
              title: p.title || "",
              function: p.function || "",
              location: p.location || "",
            }));
            if (p.avatar_url) {
              setExistingAvatarUrl(p.avatar_url);
            }
            if (p.avatar_id) {
              setExistingAvatarId(p.avatar_id);
            }
          }
        }
      } catch {
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [userStore]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.function) {
      newErrors.function = "Function is required";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const getAuthHeaderOrThrow = async (): Promise<string> => {
        let header = userStore.getAuthHeader();
        if (!header) {
          const ok = await userStore.refreshToken();
          if (ok) header = userStore.getAuthHeader();
        }
        if (!header) throw new Error("No token provided");
        return header;
      };

      let avatar_id: number | null = null;

      if (file) {
        const stampedName = `${Date.now()}-${file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )}`;
        const publicUrl = `/uploads/${stampedName}`;

        const doUpload = async () => {
          const authHeader = await getAuthHeaderOrThrow();
          const formDataToSend = new FormData();
          formDataToSend.append("file", file);
          formDataToSend.append("url", publicUrl);
          if (existingAvatarId)
            formDataToSend.append("id", String(existingAvatarId));

          const res = await fetch("/api/file/upload", {
            method: "POST",
            headers: {
              Authorization: authHeader,
            },
            body: formDataToSend,
          });
          return res;
        };

        let uploadRes = await doUpload();
        if (uploadRes.status === 401) {
          const ok = await userStore.refreshToken();
          if (ok) uploadRes = await doUpload();
        }
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || "Upload failed");
        if (uploadJson.id) avatar_id = uploadJson.id;
      }

      const doProfileUpdate = async (avatar_id: number | null) => {
        const authHeader = await getAuthHeaderOrThrow();
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            function: formData.function,
            location: formData.location,
            avatarId: avatar_id,
          }),
        });
        return res;
      };

      let profileRes = await doProfileUpdate(avatar_id);
      if (profileRes.status === 401) {
        const ok = await userStore.refreshToken();
        if (ok) profileRes = await doProfileUpdate(avatar_id);
      }
      const profileJson = await profileRes.json();
      if (!profileRes.ok)
        throw new Error(profileJson.error || "Profile update failed");

      if (profileJson.profile) userStore.setProfile(profileJson.profile);
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const resolvedAvatarUrl = existingAvatarUrl
    ? existingAvatarUrl.startsWith("http")
      ? existingAvatarUrl
      : typeof window !== "undefined"
        ? `${window.location.origin}${existingAvatarUrl}`
        : existingAvatarUrl
    : null;

  return (
    <AuthLayout illustration="lock" title="User Profile Detail">
      <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className={styles.errorBanner}>{errors.general}</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Enter your title
          </label>
          <input
            type="title"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Title"
            className={`${styles.input} ${errors.title ? styles.error : ""}`}
            disabled={isLoading}
          />
          {errors.title && (
            <span className={styles.errorMessage}>{errors.title}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="function" className={styles.label}>
            Enter your function
          </label>
          <input
            type="function"
            id="function"
            name="function"
            value={formData.function}
            onChange={handleInputChange}
            placeholder="Function"
            className={`${styles.input} ${errors.function ? styles.error : ""}`}
            disabled={isLoading}
          />
          {errors.function && (
            <span className={styles.errorMessage}>{errors.function}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location" className={styles.label}>
            Enter your location
          </label>
          <input
            type="location"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Location"
            className={`${styles.input} ${errors.location ? styles.error : ""}`}
            disabled={isLoading}
          />
          {errors.location && (
            <span className={styles.errorMessage}>{errors.location}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image" className={styles.label}>
            Upload image
          </label>
          <div className="flex items-center gap-3">
            {resolvedAvatarUrl && !file && (
              <div className="flex items-center gap-2">
                <img
                  src={resolvedAvatarUrl}
                  alt="Current avatar"
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="text-[#3B4EA6]">Current</span>
              </div>
            )}
            <label className="px-10 py-2 border-2 border-solid border-[#3B4EA6] rounded-md text-[#3B4EA6] font-semibold cursor-pointer hover:bg-blue-50">
              Upload Image
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <div className="flex items-center gap-2">
                <span className="text-[#3B4EA6]">{file.name}</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-[#3B4EA6] hover:text-red-600"
                  aria-label="Remove file"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6h18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 11v6M14 11v6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`${styles.primaryButton} ${styles.small} mb-4`}
          disabled={isLoading}
        >
          Submit
        </button>
      </form>
    </AuthLayout>
  );
};

export default observer(AddUserDetailForm);
