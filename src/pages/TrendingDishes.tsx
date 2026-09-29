import Pie from "./Charts/Pie";
import Header from '../Components/AdminComponents/Header';

const TrendingDishes = () => (
  <div>
    <Header title="Trending Dishes" description="Share of orders by dish. Sample data." />
    <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
      <Pie />
    </section>
  </div>
);

export default TrendingDishes;
