import Nounsies from "../shared/Nounsies.jsx";
import { flexpiAPI } from "../../api/flexpi.js";
import useSWR from "swr";
import { Spinner } from "@nextui-org/react";
import { shortenAddress } from "../../utils/style.js";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Explore() {
  const { data, mutate, isLoading } = useSWR("/api/explore", async (url) => {
    const { data } = await flexpiAPI.get(url);
    return data.data;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      mutate();
    }, 8000);

    return () => clearInterval(interval);
  }, [mutate]);

  return (
    <div className="flex flex-col w-full gap-10">
      <h1 className="text-3xl font-neuton text-black">
        Explore another FLEXPI
      </h1>

      {isLoading ? (
        <Spinner color="primary" size="xl" className={"h-80"} />
      ) : data.length > 0 ? (
        <div className="grid grid-cols-12 gap-5">
          {data.map((lib, idx) => (
            <Card key={idx} lib={lib} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <p className="text-sm font-medium">No Data Found</p>
        </div>
      )}
    </div>
  );
}

const Card = ({ lib }) => {
  return (
    <Link
      to={`/create?id=${lib.id}`}
      className="col-span-12 md:col-span-3 bg-white rounded-lg p-6 flex flex-col gap-2"
    >
      <div className="relative size-14 rounded-full overflow-hidden">
        <Nounsies address={lib.user.wallet.address} />
      </div>
      <h1 className="font-medium  text-black mt-2">{lib.description}</h1>
      <p className="text-sm mt-auto">
        {shortenAddress(lib.user.wallet.address)}
      </p>
    </Link>
  );
};
