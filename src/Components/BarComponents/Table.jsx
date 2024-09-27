import table from "../../data/tableIcon.svg";

const Table = ({ tableNum, status }) => {
  const colors = {
    free: "stroke-gray-400",
    reserved: "text-yellow-500 stroke-yellow-700",
    occupied: "text-orange-500 stroke-orange-700",
  };
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full  ${colors[status]}`}
        viewBox="0 0 100 100"
      >
        <use href={`${table}#table`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-black font-semibold">{`T${tableNum}`}</span>
      </div>
    </div>
  );
};

export default Table;
