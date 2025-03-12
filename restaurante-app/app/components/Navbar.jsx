"use client";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          RestauranteApp
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
