"use client";
import useLists from "../../hooks/useLists";
import ListCard from "../../components/ListCard";

const ListsPage = ({ search }) => {
  const lists = useLists(search);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Listas de Restaurantes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
};

export default ListsPage;
