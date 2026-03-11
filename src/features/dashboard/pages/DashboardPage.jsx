// Components
import TopPanel from "../components/TopPanel";
import AdminStats from "../components/AdminStats";

const DashboardPage = () => {
  return (
    <div className="p-6">
      {/* Greeting */}
      <TopPanel />

      {/* Admin stats */}
      <AdminStats />
    </div>
  );
};

export default DashboardPage;
