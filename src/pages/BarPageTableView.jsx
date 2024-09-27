import BarPageNav from "../Components/BarComponents/BarPageNav";
import TableView from "../Components/BarComponents/TableView";

const BarPageTableView = () => {
  return (
    <div className=" bg-main-dark-bg text-gray-100 pt-6">
      <BarPageNav />
      <TableView />
    </div>
  );
};

export default BarPageTableView;
