import { Header } from "../Components/AdminComponents";
import AddCategoryForm from "../features/menu/AddCategoryForm";
import CategoryRow from "../features/menu/CategoryRow";
import { useCategoryList } from "../features/menu/hooks/useCategoryList";

/** Menu sections in the order guests see them. The station decides where each item in the category is prepared. */
const Categories = () => {
  const { categories, addCategory, renameCategory, changeStation, changeVatRate, move, removeCategory } =
    useCategoryList();

  return (
    <div>
      <Header
        title="Categories"
        description="Menu sections in the order guests see them. Bar categories send their orders to the bar, kitchen categories to the kitchen. The VAT rate applies to every item in the category."
      />
      <section className="max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        <AddCategoryForm onAdd={addCategory} />

        <ol className="mt-4" aria-label="Categories in menu order">
          {categories.map((category, index) => (
            <CategoryRow
              key={category._id}
              category={category}
              first={index === 0}
              last={index === categories.length - 1}
              onMove={(direction) => void move(category._id, direction)}
              onRename={(name) => renameCategory(category._id, name)}
              onStationChange={(station) => void changeStation(category._id, station)}
              onVatRateChange={(vatRate) => changeVatRate(category._id, vatRate)}
              onDelete={() => void removeCategory(category._id)}
            />
          ))}
        </ol>
        {categories.length === 0 && <p className="mt-6 text-center text-sm text-ink-soft">No categories yet.</p>}
      </section>
    </div>
  );
};

export default Categories;
