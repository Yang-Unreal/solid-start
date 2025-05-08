import { A } from "@solidjs/router";
import Counter from "~/components/Counter";
import { Avatar } from "~/components/Avatar";
import { Controlled } from "~/components/switch/Controlled";
import { Dynamic } from "solid-js/web";
import { createSignal, For } from "solid-js";
import ForList from "~/components/list/For";
import IndexList from "~/components/list/Index";
import PortalExample from "~/components/Portal";
import BasicErrorBoundary from "~/components/errorBoudary/BasicErrorBoundary";
import SimpleBuggy from "~/components/errorBoudary/SimpleBuggy";

const RedDiv = () => <div style="color: red">Red</div>;
const GreenDiv = () => <div style="color: green">Green</div>;
const BlueDiv = () => <div style="color: blue">Blue</div>;

const options = {
  red: RedDiv,
  green: GreenDiv,
  blue: BlueDiv,
};
type ColorOption = keyof typeof options;

export default function Home() {
  const [selected, setSelected] = createSignal<ColorOption>("red");
  const [makeItThrow, setMakeItThrow] = createSignal(false);
  const [componentKey, setComponentKey] = createSignal(0);

  const toggleErrorState = () => {
    setMakeItThrow(!makeItThrow());
  };

  const handleResetFromBoundary = () => {
    console.log("App: Resetting error state and component key.");
    setMakeItThrow(false);
    setComponentKey((prevKey) => prevKey + 1);
  };

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <Counter />
      <p class="mt-8">
        Visit{" "}
        <a
          href="https://solidjs.com"
          target="_blank"
          class="text-sky-600 hover:underline"
        >
          solidjs.com
        </a>{" "}
        to learn how to build Solid apps.
      </p>
      <p class="my-4">
        <span>Home</span>
        {" - "}
        <A href="/about" class="text-sky-600 hover:underline">
          About Page
        </A>{" "}
      </p>
      <div class="flex w-full justify-center">
        <Avatar
          name="Yang Yang"
          src="https://avatars.githubusercontent.com/u/1846056?v=4"
        />
      </div>

      <div class="flex w-full justify-center mt-5">
        <Controlled></Controlled>
      </div>
      <div>
        <select
          value={selected()}
          onInput={(e) => setSelected(e.currentTarget.value as ColorOption)}
          name="colorSelect"
        >
          <For each={Object.keys(options)}>
            {(color) => <option value={color}>{color}</option>}
          </For>
        </select>
        <Dynamic component={options[selected()]} />
      </div>
      <div>
        <ForList></ForList>
        <IndexList></IndexList>
      </div>
      <div>
        <PortalExample></PortalExample>
      </div>

      <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50 p-6 flex flex-col items-center">
        <header class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-sky-700 dark:text-sky-400">
            Simple SolidJS Error Boundary
          </h1>
        </header>

        <div class="w-full max-w-lg p-6 bg-white dark:bg-slate-800 shadow-xl rounded-lg">
          <button
            onClick={toggleErrorState}
            class="mb-6 w-full px-4 py-2 font-semibold text-white rounded-md shadow-sm transition-colors
                 focus:outline-none focus:ring-2 focus:ring-opacity-50
                 "
            classList={{
              "bg-red-500 hover:bg-red-600 focus:ring-red-500": !makeItThrow(),
              "bg-green-500 hover:bg-green-600 focus:ring-green-500":
                makeItThrow(),
            }}
          >
            {makeItThrow()
              ? "Make it Work (Reset Error Condition)"
              : "Make it Throw Error"}
          </button>

          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            The component below is wrapped in an Error Boundary. Current state:{" "}
            {makeItThrow() ? "Will throw error on render" : "Should work"}
          </p>

          <BasicErrorBoundary onReset={handleResetFromBoundary}>
            <SimpleBuggy id={componentKey()} shouldThrow={makeItThrow()} />
          </BasicErrorBoundary>
        </div>
      </div>
    </main>
  );
}
