import Stacked from "../Components/AdminComponents/Charts/Stacked";
import Header from "../Components/AdminComponents/Header";

const TotalOrders = () => (
  <div>
    <Header title="Total Orders" description="Orders by category across the week. Sample data until the statistics API reports categories." />
    <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
      <Stacked />
    </section>
  </div>
);

export default TotalOrders;
