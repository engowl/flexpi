import { Button, Switch } from "@nextui-org/react";
import { useUser } from "../../providers/UserProvider.jsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { BiSolidCopy } from "react-icons/bi";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Library() {
  const { libraries } = useUser();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full gap-10">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Your API Library</h1>
        <Button
          onClick={() => navigate("/create")}
          color="primary"
          className="text-black rounded-md"
        >
          Create API
        </Button>
      </div>

      <div className="min-w-[500px]">
        <Table aria-label="Documents Table" shadow="none">
          <TableHeader>
            <TableColumn className="font-medium text-black">
              API Name
            </TableColumn>
            <TableColumn className="font-medium text-black">
              Endpoint URL
            </TableColumn>
            <TableColumn className="font-medium text-black">
              Usage Count
            </TableColumn>
            <TableColumn className="font-medium text-black">
              Plugins
            </TableColumn>
            <TableColumn className="font-medium text-black ">
              Date Created
            </TableColumn>
            <TableColumn className="font-medium text-black ">
              Last Call
            </TableColumn>
            <TableColumn className="font-medium text-black ">
              Status
            </TableColumn>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((library, idx) => (
              <TableRow key={idx}>
                <TableCell>Name</TableCell>
                <TableCell>
                  <div className="bg-[#F2F2F2] px-4 py-2 rounded-xl w-44 overflow-hidden flex flex-row items-center gap-4">
                    <p className="truncate">
                      {"curl-flexpi.<APIKEY>100.dmedmkemfnkwnfefee"}
                    </p>

                    <button
                      onClick={() => {
                        toast.success("Copied to clipboard", {
                          id: "copy",
                          duration: 1000,
                          position: "bottom-center",
                        });
                        navigator.clipboard.writeText("text");
                      }}
                    >
                      <BiSolidCopy className="text-[#767676] size-[16px]" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>1000</TableCell>
                <TableCell>Pyth, X API, blockscout</TableCell>
                <TableCell>Nov 16, 2024</TableCell>
                <TableCell>17:00:00 | Nov 16, 2024</TableCell>
                <TableCell>
                  <Actions />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const Actions = () => {
  return (
    <div className="flex flex-row gap-5 items-center">
      <Switch defaultSelected aria-label="Automatic updates" color="primary" />
      <button className="p-1.5 rounded-md bg-[#F6F6F6]">
        <IoClose className="text-black" size={16} />
      </button>
    </div>
  );
};
