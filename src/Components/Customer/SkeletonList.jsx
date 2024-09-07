import SkeletonCard from "./SkeletonCard";
import SkeletonCategoryCustomer from "./SkeletonCategoryCustomer";

const SkeletonList = ({ itemsCount, isLoading, variant='card' }) => {
  const items = Array.from({ length: itemsCount }, (_, index) => index);

  return (
    <>
    {variant === "category" ? (
        <div  className={isLoading ? "px-6 mt-4 flex items-center gap-3 overflow-x-scroll no-scrollbar scroll-smooth" : "hidden"}>
            {isLoading ? items.map( index => <SkeletonCategoryCustomer key={index} />): null}
        </div>
    ): ( <div
        className={
          isLoading
            ? "px-6 mt-7 grid grid-flow-row auto-rows-max grid-cols-card gap-3"
            : "hidden"
        }
      >
        {isLoading ? items.map((index) => <SkeletonCard key={index} />) : null}
      </div>)}
     
    </>
  );
};
export default SkeletonList;
