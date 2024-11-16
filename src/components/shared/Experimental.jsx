import { useState } from "react";
import { flexpiAPI } from "../../api/flexpi.js";
import toast from "react-hot-toast";
import { Button } from "@nextui-org/react";
import { useUser } from "../../providers/UserProvider.jsx";

export default function Experimental() {
  const [isLoading, setIsLoading] = useState(false);
  const { apiStats } = useUser();

  async function createApiKey() {
    setIsLoading(true);

    try {
      const { data } = await flexpiAPI.get("/experimental/test", {
        headers: {
          "Flex-api-key": apiStats.apiKey,
        },
      });

      console.log({ data });

      toast.success("API Key test successfully!");
    } catch (error) {
      console.log("failed create api key: ", error);
      toast.error("Failed create api key");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full bg-primary/20 rounded-xl p-6">
      <h1 className="font-bold text-2xl">Experimental</h1>

      <Button
        onClick={createApiKey}
        isLoading={isLoading}
        color="primary"
        className="text-black"
      >
        Test API Key
      </Button>
    </div>
  );
}
