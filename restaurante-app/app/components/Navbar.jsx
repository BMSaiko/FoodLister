"use client";
import Link from "next/link";
import SearchBar from "./SearchBar";

const Navbar = () => {
  return (
    <nav className="p-4 bg-gray-900 text-white flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        RestaurantesApp
      </Link>
      <SearchBar />
      <div className="flex gap-4">
        <Link href="/lists" className="hover:underline">
          Listas
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
