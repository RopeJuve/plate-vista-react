import Table from "./Table";

const TableList = () => {
  return (
    <div className="p-10 grid gap-20 grid-flow-row auto-rows-max grid-cols-table border-t-1 border-t-gray-500 md:h-screen">
      <Table tableNum={1} status="free" />
      <Table tableNum={2} status="reserved" />
      <Table tableNum={3} status="occupied" />
      <Table tableNum={4} status="free" />
      <Table tableNum={5} status="free" />
    </div>
  );
};

export default TableList;
