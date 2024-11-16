import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from "../../providers/UserProvider.jsx";
import { BiSolidCopy } from "react-icons/bi";
import { Progress } from "@nextui-org/react";
import toast from "react-hot-toast";

export default function ApiKey() {
  const { apiStats } = useUser();
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleApiKeyVisibility = () => {
    setShowApiKey((prev) => !prev);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiStats.apiKey);
    toast.success("Copied to clipboard", {
      id: "copy",
      duration: 1000,
      position: "bottom-center",
    });
  };

  return (
    <div className="flex flex-col w-full gap-10">
      <h1 className="text-3xl font-bold text-black">Your API Stats</h1>

      <div className="flex flex-col gap-5 items-start bg-white rounded-xl p-6 w-full">
        <div className="flex flex-col gap-2 text-sm">
          <h1 className="font-medium">API Key</h1>
          <h1 className="text-sm text-neutral-600">
            The key is used to authenticate your requests to the library API
          </h1>
        </div>
        <div className="flex flex-row gap-5 bg-primary/10 px-4 py-2 rounded-lg">
          <p className="flex-1 font-mono text-sm text-primary-700 font-semibold">
            flex-
            {showApiKey
              ? apiStats.apiKey.replace("flex-", "")
              : "*".repeat(apiStats.apiKey.length - 5)}
          </p>
          <div className="flex flex-row gap-3 items-center">
            <button
              className="text-primary-700"
              onClick={toggleApiKeyVisibility}
              aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
            >
              {showApiKey ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            <button
              className="text-primary-700"
              onClick={copyToClipboard}
              aria-label="Copy API Key"
            >
              <BiSolidCopy size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full text-sm ">
          <h1 className="font-medium">API Limit</h1>
          <Progress
            color="primary"
            value={apiStats.apiKeyCurrentUsage}
            maxValue={apiStats.apiKeyMaxLimit}
            className="w-full"
          />
          <h1>
            {apiStats.apiKeyCurrentUsage} / {apiStats.apiKeyMaxLimit} Request
          </h1>
        </div>
      </div>
    </div>
  );
}
