import ServerList from "@/components/servers/server-list";

export default function ServersPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <ServerList />
      </div>
    </div>
  );
}
