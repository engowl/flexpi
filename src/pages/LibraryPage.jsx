import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";

const DUMMY_DATA = [
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: false,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: false,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
  {
    apiName: "Onchain Data with twitter analysis",
    endpointUrl: "curl-flexpi.<APIKEY>300",
    usageCount: 1000,
    plugins: ["Pyth", "X API", "Blockscout"],
    createdAt: "2024161020900",
    lastCall: "2024161020900",
    status: true,
  },
];

const LibraryPage = () => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h1>Your API Library</h1>
        <Button>Create API</Button>
      </CardHeader>
      <CardBody>
        <Table>
          <TableHeader>
            <TableColumn>API Name</TableColumn>
            <TableColumn>Endpoint URL</TableColumn>
            <TableColumn>Usage Count</TableColumn>
            <TableColumn>Plugins</TableColumn>
            <TableColumn>Date Created</TableColumn>
            <TableColumn>Last Call</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No library found"}>
            {DUMMY_DATA.map((item, index) => (
              <TableRow key={index}>
                <TableCell key={index}>{item.apiName}</TableCell>
                <TableCell key={index}>{item.endpointUrl}</TableCell>
                <TableCell key={index}>{item.usageCount}</TableCell>
                <TableCell key={index}>{item.plugins.toString()}</TableCell>
                <TableCell key={index}>{item.createdAt}</TableCell>
                <TableCell key={index}>{item.lastCall}</TableCell>
                <TableCell key={index}>{item.status ? "cihuy": "asep"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default LibraryPage;
