import Nounsies from "../shared/Nounsies.jsx";

export default function Explore() {
  return (
    <div className="flex flex-col w-full gap-10">
      <h1 className="text-3xl font-bold text-black">Explore another FLEXPI</h1>

      <div className="grid grid-cols-12 gap-5">
        {Array.from({ length: 20 }).map((_, idx) => (
          <Card key={idx} />
        ))}
      </div>
    </div>
  );
}

const Card = () => {
  return (
    <div className="col-span-12 md:col-span-3 bg-white rounded-lg p-6 flex flex-col gap-2">
      <div className="relative size-14 rounded-full overflow-hidden">
        <Nounsies address={"1"} />
      </div>
      <h1 className="font-medium  text-black mt-2">
        Onchain Data with twitter analysis
      </h1>
      <p className="text-sm">@zourux</p>
    </div>
  );
};
