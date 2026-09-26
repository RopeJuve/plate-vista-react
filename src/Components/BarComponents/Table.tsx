import { useNavigate } from "react-router-dom";

const Table = ({
  tableId,
  tableNumber,
  status,
}: {
  tableId: string;
  tableNumber: number;
  status?: string;
}) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    vacant: "stroke-gray-400",
    reserved: "text-yellow-500 stroke-yellow-700",
    occupied: "text-orange-500 stroke-orange-700",
  };

  return (
    <button
      type="button"
      className="relative w-full"
      onClick={() => navigate(`/bar/table/${tableId}`)}
      aria-label={`Open table ${tableNumber}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full ${colors[status || "vacant"] || colors.vacant}`}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <use href="/tableIcon.svg#table" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-black">{`T${tableNumber}`}</span>
      </div>
    </button>
  );
};

export default Table;
