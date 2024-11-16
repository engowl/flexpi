import { Button, Spinner, Switch } from "@nextui-org/react";
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
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function Library() {
  const { library, isLibaryLoading } = useUser();
  const navigate = useNavigate();

  console.log({ library });

  return (
    <div className="flex flex-col w-full gap-10">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-3xl font-neuton text-black">Your API Library</h1>
        <Button
          onClick={() => navigate("/create")}
          color="primary"
          className="text-black rounded-md"
        >
          Create API
        </Button>
      </div>

      {isLibaryLoading ? (
        <Spinner
          color="primary"
          size="xl"
          className={"h-80 bg-white rounded-xl"}
        />
      ) : library.length > 0 ? (
        <div className="min-w-[500px]">
          <Table aria-label="Documents Table" shadow="none">
            <TableHeader>
              <TableColumn className="font-medium text-black">Name</TableColumn>
              <TableColumn className="font-medium text-black">
                Endpoint URL
              </TableColumn>
              <TableColumn className="font-medium text-black">
                Usage Count
              </TableColumn>
              {/* <TableColumn className="font-medium text-black">
                Plugins
              </TableColumn> */}
              <TableColumn className="font-medium text-black ">
                Date Created
              </TableColumn>
              <TableColumn className="font-medium text-black ">
                Last Call
              </TableColumn>
              <TableColumn className="font-medium text-black ">
                Action
              </TableColumn>
            </TableHeader>
            <TableBody>
              {library.map((library, idx) => (
                <TableRow key={idx}>
                  <TableCell>{library.name}</TableCell>
                  <TableCell>
                    <div className="bg-[#F2F2F2] px-4 py-2 rounded-xl w-44 overflow-hidden flex flex-row items-center gap-4">
                      <p className="truncate">{library.endpointURL}</p>

                      <button
                        onClick={() => {
                          toast.success("Copied to clipboard", {
                            id: "copy",
                            duration: 1000,
                            position: "bottom-center",
                          });
                          navigator.clipboard.writeText(
                            library.endpointURL || ""
                          );
                        }}
                      >
                        <BiSolidCopy className="text-[#767676] size-[16px]" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>{library.usageCount}</TableCell>
                  {/* <TableCell>Pyth, X API, blockscout</TableCell> */}
                  <TableCell>
                    {dayjs(library.createdAt).format("MMM D, YYYY")}
                  </TableCell>
                  <TableCell>
                    {library.lastCallDate
                      ? dayjs(library.lastCallDate).format(
                          "HH:mm:ss | MMM D, YYYY"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Actions id={library.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-80 bg-white rounded-xl">
          <p className="text-sm font-medium">No Data Found</p>
        </div>
      )}
    </div>
  );
}

const Actions = ({ id }) => {
  return (
    <div className="flex flex-row gap-5 items-center">
      {/* <Switch defaultSelected aria-label="Automatic updates" color="primary" />
      <button className="p-1.5 rounded-md bg-[#F6F6F6]">
        <IoClose className="text-black" size={16} />
      </button> */}
      <Link
        to={`/create?id=${id}`}
        className="px-3 py-2 rounded-lg bg-primary text-black"
      >
        Try
      </Link>
    </div>
  );
};
