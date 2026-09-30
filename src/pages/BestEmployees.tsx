import Bar from "./Charts/Bar";
import Header from '../Components/AdminComponents/Header';

const BestEmployees = () => (
  <div>
    <Header title="Best Employees" description="Orders handled per day. Sample data." />
    <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
      <Bar />
    </section>
  </div>
);

export default BestEmployees;
