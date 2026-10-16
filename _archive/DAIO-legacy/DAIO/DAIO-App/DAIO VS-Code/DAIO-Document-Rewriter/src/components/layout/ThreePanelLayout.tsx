import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { MasterDocPanel } from "@/components/panels/MasterDocPanel";
import { RewritePanel } from "@/components/panels/RewritePanel";
import { InspectorPanel } from "@/components/panels/InspectorPanel";

export function ThreePanelLayout() {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={28} minSize={20}>
        <MasterDocPanel />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={42} minSize={25}>
        <RewritePanel />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        <InspectorPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
