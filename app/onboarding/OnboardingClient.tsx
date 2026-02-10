"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";

interface OnboardingClientProps {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export default function OnboardingClient({
  userId,
  email,
  name,
  avatarUrl,
}: OnboardingClientProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      // Remove email postfix if present (e.g., "@example.com")
      const cleanName = email.replace(/@.*/, "");

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
          name: cleanName,
          display_name: cleanName,
          avatarUrl,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to save your role. Please try again.");
      } else {
        // Redirect based on role
        if (selectedRole === "driver") {
          router.push("/driver");
        } else {
          router.push("/passenger");
        }
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome! 👋</h1>
          <p className="text-gray-600">How would you like to use Share Car?</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setSelectedRole("passenger")}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === "passenger"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧑‍🦱</div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Passenger</h3>
                <p className="text-sm text-gray-600">
                  Find rides to your destination
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole("driver")}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === "driver"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🚗</div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Driver</h3>
                <p className="text-sm text-gray-600">
                  Offer rides and earn money
                </p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedRole || loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
