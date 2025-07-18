import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import VideoCreator from "@/pages/video-creator";
import ThumbnailStudio from "@/pages/thumbnail-studio";
import ContentOptimizer from "@/pages/content-optimizer";
import UploadManager from "@/pages/upload-manager";
import Scheduler from "@/pages/scheduler";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/video-creator" component={VideoCreator} />
        <Route path="/thumbnail-studio" component={ThumbnailStudio} />
        <Route path="/content-optimizer" component={ContentOptimizer} />
        <Route path="/upload-manager" component={UploadManager} />
        <Route path="/scheduler" component={Scheduler} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
