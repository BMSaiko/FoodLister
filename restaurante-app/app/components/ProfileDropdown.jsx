"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useLists";
import Link from "next/link";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {user ? (
        <>
          <img
            src={user.avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && (
            <div className="absolute right-0 bg-white text-black shadow-lg mt-2 p-2 rounded">
              <Link href="/profile" className="block px-4 py-2">👤 Profile</Link>
              <button onClick={logout} className="block px-4 py-2">🚪 Logout</button>
            </div>
          )}
        </>
      ) : (
        <Link href="/auth/login" className="text-white">🔑 Login</Link>
      )}
    </div>
  );
};

export default ProfileDropdown;
