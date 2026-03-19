"use client"

import UserSignin from "@/app/login/Login/UserSignin";

export default function SigninPage() {
  return (
    <div className="signin-container">
      {/* Left Panel */}
      <div className="signin-left-panel">
        <UserSignin />
      </div>
    </div>
  );
}
