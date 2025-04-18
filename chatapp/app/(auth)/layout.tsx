"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 認証状態によるリダイレクト
    if (status === "authenticated" && session?.user) {
      router.push("/chat");
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status, session, router]);

  // ローディング中の表示
  if (isLoading && status !== "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <div>{children}</div>;
} 