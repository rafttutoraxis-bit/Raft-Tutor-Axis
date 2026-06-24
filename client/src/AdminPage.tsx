import AdminPanel from "./components/AdminPanel";

export default function AdminPage() {
  return (
    <AdminPanel
      lang="en"
      onForceRefresh={() => {}}
      mode="admin"
    />
  );
}
