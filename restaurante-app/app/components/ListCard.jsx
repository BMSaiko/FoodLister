"use client";
import Link from "next/link";

const ListCard = ({ list }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <h3 className="mt-2 font-bold">{list.name}</h3>
      <p className="text-sm text-gray-600">{list.description}</p>
      <Link href={`/lists/${list.id}`} className="text-blue-500 hover:underline mt-2 block">
        Ver lista
      </Link>
    </div>
  );
};

export default ListCard;
