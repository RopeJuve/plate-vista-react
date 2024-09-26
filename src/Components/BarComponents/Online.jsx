const Online = ({ status }) => {
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-gray-500 rounded-lg">
      <span
        className={`w-2 h-2 rounded-full animate-pulse ${
          status === 0
            ? "bg-yellow-400"
            : status === 1
            ? "bg-green-400"
            : "bg-red-400"
        }`}
      ></span>
      <h1 className="text-sm font-semibold">
        {status === 0 ? "Connecting" : status === 1 ? "Online" : "Offline"}
      </h1>
    </div>
  );
};

export default Online;
