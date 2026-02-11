"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const LABEL = {
    login: "Đăng Nhập",
    signup: "Đăng Ký",
    platform_desc: "Nền tảng xe ghép, xe tiện chuyến",
    email: "Email",
    password: "Mật Khẩu",
    password_placeholder: "Mật khẩu",
    email_placeholder: "abc@xyz.com",
    waiting: "Vui lòng chờ...",
    terms:
      "Bằng việc tiếp tục, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi",
    account_created: "Tạo tài khoản thành công!",
    check_email: "Vui lòng kiểm tra email để xác nhận tài khoản!",
    unexpected_error: "Đã xảy ra lỗi không mong muốn",
    login_failed: "Đăng nhập thất bại",
    signup_failed: "Đăng ký thất bại",
  };
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || LABEL.login_failed);
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(LABEL.unexpected_error);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || LABEL.signup_failed);
        setLoading(false);
      } else {
        setError("");
        if (data.autoLogin) {
          // Email confirmation disabled, user is logged in
          alert(LABEL.account_created);
          router.push("/");
          router.refresh();
        } else {
          // Email confirmation required
          alert(data.message || LABEL.check_email);
          setLoading(false);
        }
      }
    } catch (err) {
      setError(LABEL.unexpected_error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">
            <span className="text-2xl">🚗</span>
            <span className="align-middle ml-1">Sekar</span>
          </h1>
          <p className="text-gray-600">{LABEL.platform_desc}</p>
        </div>

        {/* Toggle between Login and Sign Up */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${
              isLogin
                ? "bg-white text-primary-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {LABEL.login}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${
              !isLogin
                ? "bg-white text-primary-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {LABEL.signup}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {LABEL.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={LABEL.email_placeholder}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {LABEL.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={LABEL.password_placeholder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? LABEL.waiting : isLogin ? LABEL.login : LABEL.signup}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{LABEL.terms}</p>
        </div>
      </div>
    </div>
  );
}
