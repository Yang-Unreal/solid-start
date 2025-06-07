import Counter from "~/components/Counter";
import { Avatar } from "~/components/Avatar";
import { Controlled } from "~/components/switch/Controlled";
import ForList from "~/components/list/For";
import IndexList from "~/components/list/Index";
import PortalExample from "~/components/Portal";
import AnimeTimer from "~/components/AnimeTimer";
import DynamicRender from "~/components/DynamicRender";
import { RefsExample } from "~/components/RefsExample";
import ToDo from "~/components/Todo";
import CounterPageContent from "~/components/CounterPageContent";

export default function Home() {
  return (
    <main class=" bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        <div class="card-wrapper">
          <Counter />
          <Avatar
            name="Yang Yang"
            src="https://minio.limingcn.com/bun/cloud.jpg"
            size="md"
          />
          <Controlled />
        </div>
        <div class="card-content-host">
          <DynamicRender />
        </div>
        <div class="card-content-host">
          <ForList />
        </div>
        <div class="card-content-host">
          <IndexList />
        </div>

        <div class="card-content-host">
          <PortalExample />
        </div>

        <div class="card-content-host">
          <RefsExample />
        </div>
        <div class="card-wrapper">
          <AnimeTimer />
        </div>
        <div class="card-wrapper">
          <ToDo />
        </div>
        <div class="card-wrapper">
          <CounterPageContent />
        </div>
      </div>
    </main>
  );
}
