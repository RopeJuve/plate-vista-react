import { useNavigate } from "react-router-dom";

const Table = ({ tableNum, status }) => {
  const navigate = useNavigate();
  const colors = {
    vacant: "stroke-gray-400",
    reserved: "text-yellow-500 stroke-yellow-700",
    occupied: "text-orange-500 stroke-orange-700",
  };

  return (
    <button
      type="button"
      className="relative w-full"
      onClick={() => navigate(`/bar/table/${tableNum}`)}
      aria-label={`Open table ${tableNum}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full ${colors[status]}`}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <use href={`/tableIcon.svg#table`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-black font-semibold">{`T${tableNum}`}</span>
      </div>
    </button>
  );
};

export default Table;
