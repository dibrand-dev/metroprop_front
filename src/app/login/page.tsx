"use client"

import UserSignin from "@/app/login/Login/UserSignin";
import Image from "next/image";
import { Suspense } from "react";

export default function SigninPage() {
  return (
    <div className="signin-container">
      {/* Left Panel */}
      <div className="signin-left-panel">
        <Suspense fallback={null}>
          <UserSignin />
        </Suspense>
      </div>
      <div className="signin-right-panel">
        <Image
          src="/images/Inicio-sesion.png"
          alt="Hero"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}
