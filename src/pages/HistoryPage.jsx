import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { flexpiAPI } from "../api/flexpi";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { EyeIcon } from "lucide-react";
import JsonView from "@uiw/react-json-view";
import { monokaiTheme } from "@uiw/react-json-view/monokai";

// Function to calculate relative time manually
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(timestamp)) / 1000); // Difference in seconds

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const HistoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Track the selected item for the modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await flexpiAPI.get("/api/history");
      setData(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item); // Set the selected item
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedItem(null); // Clear the selected item
  };

  return (
    <div className="mt-28 mx-auto items-center flex flex-col">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <h1 className="text-2xl w-full text-center">History</h1>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <Table aria-label="History">
              <TableHeader>
                <TableColumn>Query</TableColumn>
                <TableColumn>Time</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No history found"}>
                {data.length > 0 &&
                  data.map((item, index) => {
                    const query = item.schema?.query || "Unknown Query";
                    const createdAt =
                      item.createdAt || item.response?.createdAt;

                    return (
                      <TableRow key={item.id || index}>
                        <TableCell>{query || ""}</TableCell>
                        <TableCell className="items-center flex justify-between">
                          {createdAt
                            ? getRelativeTime(createdAt)
                            : "Unknown Time"}
                          <Button
                            variant="light"
                            className="w-fit"
                            onClick={() => handleOpenModal(item)}
                          >
                            <EyeIcon size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal for displaying item details */}
      {selectedItem && (
        <Modal isOpen={isModalOpen} onOpenChange={handleCloseModal}>
          <ModalContent>
            <>
              <ModalHeader className="flex flex-col gap-1">
                Query Details
              </ModalHeader>
              <ModalBody>
                <p>Schema</p>
                <pre className="font-mono text-xs whitespace-pre-wrap py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl">
                  {JSON.stringify(selectedItem.schema, null, 2)}
                </pre>
                <p>Response</p>
                <JsonView
                  value={selectedItem.response}
                  theme={monokaiTheme}
                  collapsed={false}
                  shortenTextAfterLength={1000}
                  className="py-4 px-4 rounded-xl border"
                  displayDataTypes={false}
                  enableClipboard
                  indentWidth={4}
                />
              </ModalBody>
              <ModalFooter>
                <Button auto onClick={handleCloseModal}>
                  Close
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default HistoryPage;
