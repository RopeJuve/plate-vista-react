import { MdOutlineTableRestaurant } from "react-icons/md";

const TableIcon = ({ tableNum, connectionStatus }) => {
  return (
    <div className="inline-flex items-center gap-1">
      <MdOutlineTableRestaurant className="w-6 h-6" />
      <span className="text-sm">{tableNum}</span>
      <span
        className={`w-2 h-2 rounded-full animate-pulse ${
          connectionStatus === 0
            ? "bg-yellow-400"
            : connectionStatus === 1
            ? "bg-green-400"
            : "bg-red-400"
        }`}
      ></span>
    </div>
  );
};

export default TableIcon;
