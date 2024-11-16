import { Button, Modal, ModalContent } from "@nextui-org/react";
import { useAtom } from "jotai";
import { isGetStartedDialogOpenAtom } from "../../store/dialog-store.js";
import { useState } from "react";
import toast from "react-hot-toast";
import { flexpiAPI } from "../../api/flexpi.js";
import { useEmitEvent } from "../../hook/use-event.jsx";
import useSound from "use-sound";
import confetti from "canvas-confetti";

export default function GetStartedDialog() {
  const [isOpen, setOpen] = useAtom(isGetStartedDialogOpenAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [play] = useSound("/assets/audio/air-horn.mp3");
  const emitEvent = useEmitEvent("create-api-key-dialog");

  const handleClick = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#9c57ff", "#ff6699", "#ff7b44", "#ffdd88"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  async function createApiKey() {
    setIsLoading(true);

    try {
      const { data } = await flexpiAPI.post("/api/create-key");
      const apiKey = data.data.apiKey;
      console.log({ apiKey });

      toast.success("API Key created successfully!");
      emitEvent({
        message: "Api key created",
      });
      setOpen(false);
      play();
      handleClick();
    } catch (error) {
      console.log("failed create api key: ", error);
      toast.error("Failed create api key");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      hideCloseButton
      placement="center"
      size="lg"
      backdrop="blur"
    >
      <ModalContent className="flex flex-col rounded-3xl bg-white p-6">
        <div className="flex flex-col gap-5 w-full items-center justify-center">
          <img src="/assets/flexpi-logo.png" className="w-32 md:w-40" />

          <h1 className="text-xl font-neuton text-[#191919]">
            Redefining APIs, Simplifying Data
          </h1>

          <p className="text-xs text-[#848484] text-center">
            Experience a smarter way to access data. FlexPI seamlessly combines
            blockchain and real-world insights, transforming how you create and
            use APIs
          </p>

          <div className="flex flex-col gap-5 w-full mt-5">
            {FEATURES.map((feature, index) => (
              <Feature key={index} {...feature} />
            ))}
          </div>
        </div>

        <Button
          isLoading={isLoading}
          onClick={createApiKey}
          className="text-[#1F4D00] font-medium mt-10"
          color="primary"
        >
          Create FLEXPI
        </Button>
      </ModalContent>
    </Modal>
  );
}

function Feature({ ic, title, caption }) {
  return (
    <div className="flex flex-row gap-5">
      <img src={ic} className="size-16" />
      <div className="flex flex-col gap-2">
        <h1 className="text-black font-medium">{title}</h1>
        <p className="text-[#848484] text-xs">{caption}</p>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    ic: "/assets/ic-ai.png",
    title: "Describe Your Data Needs to our AI",
    caption:
      "Enter your prompt, and our AI will fetch the right data from sources like Pyth, Blockscout, The Graph, CowSwap, and more",
  },
  {
    ic: "/assets/ic-structure.png",
    title: "Define the data structure",
    caption:
      "From Pyth, Blockscout, the Graph, Cow Swap to X , access data from the best source",
  },
  {
    ic: "/assets/ic-api.png",
    title: "Get Your API Endpoint",
    caption:
      "A single, powerful endpoint to provide precisely the data you need, ready for seamless integration into your application",
  },
];
