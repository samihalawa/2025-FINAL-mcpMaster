import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard";
import Servers from "./pages/servers";
import Synchronization from "./pages/synchronization";
import Settings from "./pages/settings";
import Help from "./pages/help";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/servers" component={Servers} />
        <Route path="/sync" component={Synchronization} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
