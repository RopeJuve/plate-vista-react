
import { useNavigate } from "react-router-dom";

const Table = ({ tableNum, status }) => {
  const navigate = useNavigate();
  const colors = {
    vacant: "stroke-gray-400",
    reserved: "text-yellow-500 stroke-yellow-700",
    occupied: "text-orange-500 stroke-orange-700",
  };

  return (
    <div
      className="relative"
      onClick={() => navigate(`/bar/table/${tableNum}`)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full  ${colors[status]}`}
        viewBox="0 0 100 100"
      >
        <use href={`/tableIcon.svg#table`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-black font-semibold">{`T${tableNum}`}</span>
      </div>
    </div>
  );
};

export default Table;
