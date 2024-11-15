import { Button, Modal, ModalContent } from "@nextui-org/react";
import { useAtom } from "jotai";
import { isGetStartedDialogOpenAtom } from "../../store/dialog-store.js";

export default function GetStartedDialog() {
  const [isOpen, setOpen] = useAtom(isGetStartedDialogOpenAtom);

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

          <h1 className="text-xl font-medium text-[#191919]">
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

        <Button className="text-[#1F4D00] font-medium mt-10" color="primary">
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
