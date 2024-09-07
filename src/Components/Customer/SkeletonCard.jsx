

const SkeletonCard = () => {
    return (
      <div className="flex items-center gap-4 shadow-md rounded-lg py-2 px-2 animate-pulse">
        <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-gray-300"></div>
        <div className="flex flex-col gap-2 flex-grow">
          <div className="flex items-center justify-between">
            <div className="w-2/3 h-4 bg-gray-300 rounded-md"></div>
            <div className="w-1/4 h-4 bg-gray-300 rounded-md"></div>
          </div>
          <div className="w-full h-3 bg-gray-300 rounded-md"></div>
          <div className="w-[85%] h-3 bg-gray-300 rounded-md"></div>
          <div className="self-end w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    );
  };

export default SkeletonCard