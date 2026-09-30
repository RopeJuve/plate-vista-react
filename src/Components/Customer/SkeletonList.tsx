import SkeletonCard from "./SkeletonCard";

const SkeletonList = ({ itemsCount, isLoading }: { itemsCount: number; isLoading: boolean }) => {
  if (!isLoading) {
    return null;
  }
  const items = Array.from({ length: itemsCount }, (_, index) => index);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      {items.map((index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonList;
