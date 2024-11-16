"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Switch,
  Card,
  CardBody,
  Select,
  SelectItem,
  CardFooter,
  CardHeader,
  Tabs,
  Tab,
  Checkbox,
  Tooltip,
  Spinner,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@nextui-org/react";
import { Plus, Trash2, WandSparkles } from "lucide-react";
import JsonView from "@uiw/react-json-view";
import { monokaiTheme } from "@uiw/react-json-view/monokai";
import PluginList from "../components/shared/PluginList";
import { flexpiAPI } from "../api/flexpi";
import toast from "react-hot-toast";
import { useUser } from "../providers/UserProvider";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { BiSolidCopy } from "react-icons/bi";

export default function CreatePage() {
  const [queryParts, setQueryParts] = useState([]);
  const [fields, setFields] = useState([]);
  const [variables, setVariables] = useState([]);
  const [generatedSchema, setGeneratedSchema] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const { apiStats } = useUser();
  const [apiName, setApiName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  // Tab
  const [selectedTab, setSelectedTab] = useState("gennedSchema");

  const query = useMemo(() => queryParts.join(""), [queryParts]);

  const [searchParams] = useSearchParams();
  const libraryId = searchParams.get("id");

  const [isTemplate, setIsTemplate] = useState(false);

  const { data: libraryTemplate } = useSWR(
    libraryId ? `/api/${libraryId}` : null,
    async (url) => {
      const { data } = await flexpiAPI.get(url);
      return data.data;
    }
  );

  useEffect(() => {
    if (libraryTemplate) {
      // Set query
      handleQueryChange({
        target: {
          value: libraryTemplate.query,
        },
      });
      // Set variables
      setVariables(libraryTemplate.schema.variables);

      // Enable all items
      const enableItems = (items) => {
        return items.map((item) => {
          item.isEnabled = true;
          if (item.subItems) {
            item.subItems = enableItems(item.subItems);
          }
          return item;
        });
      };

      const enabledItems = enableItems(libraryTemplate.schema.items);

      // Set data structure
      setFields(enabledItems);
      setIsTemplate(true);
    }
  }, [libraryTemplate]);

  const generateSchema = (currentFields, currentVariables, currentQuery) => {
    const cleanQuery = currentQuery;

    const cleanFields = (fields) => {
      return fields
        .filter((field) => field.isEnabled)
        .map((field) => {
          const cleanField = {
            key: field.key,
            dataType: field.dataType.toLowerCase(),
            description: field.description,
            ...(field.isArray && { isArray: true }),
          };
          if (field.subItems && field.subItems.length > 0) {
            cleanField.subItems = cleanFields(field.subItems);
          }
          return cleanField;
        });
    };

    const schema = {
      query: cleanQuery,
      items: cleanFields(currentFields),
      variables: currentVariables.map((v) => ({
        key: v.key,
        value: v.value,
        description: v.description,
      })),
    };

    setGeneratedSchema(JSON.stringify(schema, null, 2));
  };

  const detectVariables = (text) => {
    const regex = /{{([^}]+)}}/g;
    const matches = text.match(regex) || [];
    const newVariables = matches.map((match) => {
      const key = match.slice(2, -2);
      const existingVariable = variables.find((v) => v.key === key);
      return (
        existingVariable || {
          key,
          name: "",
          description: "",
          value: "",
        }
      );
    });

    setVariables(newVariables);
    generateSchema(fields, newVariables, text);
  };

  useEffect(() => {
    detectVariables(query);
  }, [query, fields]);

  const highlightedQuery = useMemo(() => {
    return queryParts.map((part, index) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        return (
          <span key={index} className="text-blue-500 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  }, [queryParts]);

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    const parts = newQuery.split(/(\{\{[^}]+\}\})/g);
    setQueryParts(parts);
  };

  const addField = () => {
    const newFields = [
      ...fields,
      {
        key: "",
        dataType: "String",
        description: "",
        isArray: false,
        isEnabled: true,
        subItems: [],
      },
    ];
    setFields(newFields);
    generateSchema(newFields, variables, query);
  };

  const resetSchema = () => {
    setFields([]);
    setVariables([]);
    setQueryParts([""]);
    setGeneratedSchema("");
  };

  // Updated updateField function to handle nested paths
  const updateField = (path, key, value) => {
    const newFields = [...fields];

    const updateFieldAtPath = (fieldsArray, path) => {
      const [currentIndex, ...restPath] = path;
      if (restPath.length === 0) {
        fieldsArray[currentIndex] = {
          ...fieldsArray[currentIndex],
          [key]: value,
          // Reset subItems if changing from Object to another type
          subItems:
            key === "dataType" && value !== "Object"
              ? []
              : fieldsArray[currentIndex].subItems,
        };
      } else {
        fieldsArray[currentIndex].subItems = [
          ...fieldsArray[currentIndex].subItems,
        ];
        updateFieldAtPath(fieldsArray[currentIndex].subItems, restPath);
      }
    };

    updateFieldAtPath(newFields, path);
    setFields(newFields);
    generateSchema(newFields, variables, query);
  };

  // Updated removeField function to handle nested paths
  const removeField = (path) => {
    const newFields = [...fields];

    const removeFieldAtPath = (fieldsArray, path) => {
      const [currentIndex, ...restPath] = path;
      if (restPath.length === 0) {
        fieldsArray.splice(currentIndex, 1);
      } else {
        removeFieldAtPath(fieldsArray[currentIndex].subItems, restPath);
      }
    };

    removeFieldAtPath(newFields, path);
    setFields(newFields);
    generateSchema(newFields, variables, query);
  };

  // Updated handleAddSubItem function to handle nested paths
  const handleAddSubItem = (path) => {
    const newFields = [...fields];

    const addSubItemAtPath = (fieldsArray, path) => {
      const [currentIndex, ...restPath] = path;
      if (restPath.length === 0) {
        if (!fieldsArray[currentIndex].subItems) {
          fieldsArray[currentIndex].subItems = [];
        }
        fieldsArray[currentIndex].subItems.push({
          key: "",
          dataType: "String",
          description: "",
          isArray: false,
          isEnabled: true,
          subItems: [],
        });
      } else {
        fieldsArray[currentIndex].subItems = [
          ...fieldsArray[currentIndex].subItems,
        ];
        addSubItemAtPath(fieldsArray[currentIndex].subItems, restPath);
      }
    };

    addSubItemAtPath(newFields, path);
    setFields(newFields);
    generateSchema(newFields, variables, query);
  };

  const updateVariable = (index, variable) => {
    const newVariables = variables.map((v, i) => {
      if (i === index) {
        return { ...v, ...variable };
      }
      return v;
    });
    setVariables(newVariables);
    generateSchema(fields, newVariables, query);
  };

  const removeVariable = (index) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
    const newQueryParts = queryParts.filter(
      (part) => !part.includes(variables[index].key)
    );
    setQueryParts(newQueryParts);
    generateSchema(fields, newVariables, newQueryParts.join(""));
  };

  const handleRequestData = async () => {
    try {
      setIsLoading(true);

      // Set tab to response
      setSelectedTab("response");

      // Real API call
      // const res = await flexpiAPI.post(
      //   "/api/call",
      //   {
      //     schema: { ...JSON.parse(generatedSchema) },
      //     libraryId: libraryId ?? null,
      //   },
      //   {
      //     headers: {
      //       "Flex-api-key": apiStats.apiKey,
      //     },
      //   }
      // );

      // Dummy API call for testing
      const res = await flexpiAPI.post(
        "/api/call/dummy",
        {
          schema: { ...JSON.parse(generatedSchema) },
          libraryId: libraryId ?? null,
        },
        {
          headers: {
            "Flex-api-key": apiStats.apiKey,
          },
        }
      );

      setResponse(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveData = async () => {
    try {
      setSaveLoading(true);
      const rBody = {
        name: apiName,
        schema: { ...JSON.parse(generatedSchema) },
      };

      const res = await flexpiAPI.post("/api/save", rBody);

      toast.success(res.data.message);
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save data");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleApiNameChange = (e) => {
    setApiName(e.target.value);
  };

  const [endpointPreview, setEndpointPreview] = useState("");

  const ensVariable = useMemo(
    () => variables.find((variable) => variable.key.trim() === "ens"),
    [variables]
  );

  console.log({ variables, ensVariable });

  const handleGenerateEndpointPreview = () => {
    return `http://localhost:5700/api/${libraryId}/call${
      ensVariable ? "?ens=" + (ensVariable.value || "empty") : ""
    }`;
  };

  return (
    <div className="bg-background pt-32 pb-20 px-5 md:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-neuton tracking-tight">
              Generate API Using Simple Prompts and Data Structure
            </h1>
          </div>

          <div className="flex gap-4 mb-4 items-center overflow-hidden w-full">
            <PluginList />
          </div>

          <div className="space-y-6 mt-8">
            <div className="space-y-2">
              <Tooltip placement="bottom-start" content={<GuideTooltip />}>
                <div className="relative">
                  <div
                    className="absolute inset-0 px-4 py-4 z-20 pointer-events-none font-mono text-sm"
                    aria-hidden="true"
                  >
                    {highlightedQuery}
                  </div>
                  <Textarea
                    value={query}
                    onChange={handleQueryChange}
                    classNames={{
                      input: "bg-transparent font-mono text-sm px-1 py-2",
                      inputWrapper:
                        "bg-white data-[hover=true]:bg-white group-data-[focus=true]:bg-white shadow-none border-[1px] border-primary",
                    }}
                    style={{ color: "transparent", caretColor: "black" }}
                    placeholder="Use {{variable_name}} syntax to define template variables"
                  />
                </div>
              </Tooltip>
            </div>

            <Card className="px-4 py-3" shadow="none">
              <CardHeader className="border-b">
                <h1 className="font-neuton text-xl">Variables</h1>
              </CardHeader>
              <div className="flex mt-3 text-sm font-medium gap-4 mx-4">
                <div className="w-full">Key</div>
                <div className="w-full">Value</div>
                <div className="w-full">Description (optional)</div>
              </div>
              <CardBody>
                {variables.length > 0 ? (
                  variables.map((variable, index) => (
                    <div key={index} className="flex mb-4 flex-col">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-sm px-3 py-2 text-center text-blue-500 bg-blue-200 rounded-xl">
                          {`{{ ${variable.key} }}`}
                        </div>
                        <Input
                          value={variable.value}
                          onChange={(e) =>
                            updateVariable(index, { value: e.target.value })
                          }
                          placeholder="Value"
                          size="sm"
                        />
                        <div className="flex">
                          <Input
                            value={variable.description}
                            onChange={(e) =>
                              updateVariable(index, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Description (optional)"
                            size="sm"
                          />
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onClick={() => removeVariable(index)}
                          >
                            <Trash2 color="red" className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-20 text-center text-sm text-black opacity-60">
                    No variables added yet
                  </div>
                )}
              </CardBody>
            </Card>

            {isTemplate && (
              <Card className="px-4 py-3" shadow="none">
                <CardHeader className="border-b">
                  <h1 className="font-neuton text-xl">Endpoint Preview</h1>
                </CardHeader>

                <CardBody>
                  <div className="px-4 py-3 rounded-lg bg-default-100 relative">
                    {handleGenerateEndpointPreview()}

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          handleGenerateEndpointPreview()
                        );
                        toast.success("Endpoint preview is copied");
                      }}
                      className="absolute top-4 right-4"
                    >
                      <BiSolidCopy className="text-[#767676] size-[16px]" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            )}

            <Card className="px-4 py-3" shadow="none">
              <CardHeader className="justify-between border-b">
                <h1 className="font-neuton text-xl">Response Data Structure</h1>
                <div className="flex gap-2">
                  <Button
                    variant="solid"
                    size="sm"
                    onClick={resetSchema}
                    className="font-medium"
                  >
                    RESET
                  </Button>
                  <Button
                    variant="solid"
                    color="primary"
                    size="sm"
                    onClick={addField}
                    className="bg-[#E6FFD6] text-[#2F7004] font-medium"
                  >
                    ADD
                  </Button>
                </div>
              </CardHeader>
              <div className="flex text-sm font-medium py-4 text-black/70">
                <div className="w-16 ml-6">Enable</div>
                <div className="w-32 ml-2">Field Name</div>
                <div className="w-24 ml-4">Data Type</div>
                <div className="w-10 ml-3">Array</div>
                <div className="w-80 ml-4">Description</div>
              </div>
              <CardBody>
                {fields.length > 0 ? (
                  fields.map((field, index) => (
                    <RecursiveInput
                      key={index}
                      path={[index]}
                      field={field}
                      updateField={updateField}
                      handleAddSubItem={handleAddSubItem}
                      removeField={removeField}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-center text-sm text-black opacity-60">
                    No fields added yet
                  </div>
                )}
              </CardBody>
              <CardFooter className="justify-end">
                <Button
                  color="primary"
                  onClick={handleRequestData}
                  className="bg-[#B6FA89] text-[#1F4D00] font-medium"
                  isDisabled={!fields.length > 0}
                  isLoading={isLoading}
                >
                  <WandSparkles size={18} />
                  Request Data
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="flex w-full flex-col relative">
          <div className="absolute top-1 right-1">
            <Button size="sm" onPress={onOpen}>
              SAVE
            </Button>
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              placement="top-center"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Save your API
                    </ModalHeader>
                    <ModalBody>
                      <Input
                        autoFocus
                        label="Name"
                        placeholder="Your API name"
                        variant="bordered"
                        value={apiName}
                        onChange={handleApiNameChange}
                      />
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="flat" onPress={onClose}>
                        Close
                      </Button>
                      <Button
                        color="primary"
                        onClick={handleSaveData}
                        isLoading={saveLoading}
                      >
                        Submit
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
          <Tabs
            aria-label="Options"
            variant="underlined"
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
          >
            <Tab key="gennedSchema" title="Generated Schema">
              <Card shadow="none">
                <CardBody>
                  <pre className="font-mono text-xs whitespace-pre-wrap py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl">
                    {generatedSchema || "No schema generated yet"}
                  </pre>
                </CardBody>
              </Card>
            </Tab>
            <Tab key="response" title="Response">
              <Card shadow="none">
                <CardBody>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl py-[4rem]">
                      <Spinner size="lg" color="primary" />
                    </div>
                  ) : response !== null ? (
                    <JsonView
                      value={response.data}
                      theme={monokaiTheme}
                      collapsed={false}
                      collapseStringsAfterLength={100}
                      displayDataTypes={false}
                      enableClipboard={true}
                      indentWidth={4}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-20 bg-[#2e2e2e] text-[#797979] rounded-lg font-mono text-sm">
                      No response yet
                    </div>
                  )}

                  {response && !isLoading && (
                    <div className="opacity-60 text-sm mt-1 text-right">
                      Finished in {(response.duration / 1000).toFixed(2)}{" "}
                      seconds
                    </div>
                  )}
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function RecursiveInput({
  path,
  field,
  updateField,
  handleAddSubItem,
  removeField,
}) {
  return (
    <div className="space-y-2 ml-4">
      <div className="flex items-center gap-4 p-3 rounded-lg">
        <Switch
          isSelected={field.isEnabled}
          onValueChange={(checked) => updateField(path, "isEnabled", checked)}
        />
        <Input
          value={field.key}
          onChange={(e) => updateField(path, "key", e.target.value)}
          placeholder="Field Name"
          size="sm"
          classNames={{
            input: "h-8",
            base: "w-32",
          }}
        />
        <Select
          selectedKeys={[field.dataType]}
          onSelectionChange={(selected) =>
            updateField(path, "dataType", selected.currentKey)
          }
          size="sm"
          className="w-24"
          aria-label="data-type"
          isDisabled={field.subItems && field.subItems.length > 0}
        >
          <SelectItem key="string">String</SelectItem>
          <SelectItem key="number">Number</SelectItem>
          <SelectItem key="boolean">Boolean</SelectItem>
          <SelectItem key="object">Object</SelectItem>
        </Select>
        <Checkbox
          isSelected={field.isArray}
          onValueChange={(checked) => updateField(path, "isArray", checked)}
          size="lg"
          classNames={{
            icon: "text-[#2F7004]",
          }}
        />
        <Input
          value={field.description}
          onChange={(e) => updateField(path, "description", e.target.value)}
          classNames={{
            input: "h-8",
            base: "flex-1 min-w-[100px]",
          }}
          placeholder="Description"
          size="sm"
        />
        {field.dataType === "Object" && (
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => handleAddSubItem(path)}
            className="bg-[#E6FFD6] text-[#2F7004]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onClick={() => removeField(path)}
        >
          <Trash2 color="red" className="h-4 w-4" />
        </Button>
      </div>

      {field.subItems &&
        field.subItems.length > 0 &&
        field.subItems.map((item, subIndex) => (
          <RecursiveInput
            key={subIndex}
            path={[...path, subIndex]}
            field={item}
            updateField={updateField}
            handleAddSubItem={handleAddSubItem}
            removeField={removeField}
          />
        ))}
    </div>
  );
}

const GuideTooltip = () => {
  return (
    <div className="p-4 max-w-xs">
      <h4 className="font-semibold mb-2">Template Variables</h4>
      <p className="text-sm text-gray-600 mb-3">
        Use {"{{variable_name}}"} to create dynamic variables in your query.
      </p>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Example:</span>
          <br />
          Get data for token {"{{token_id}}"}
        </div>
        <div className="text-xs text-gray-500">
          • Variable names should be descriptive
          <br />
          • Use snake_case for multiple words
          <br />• Variables can be used multiple times
        </div>
      </div>
    </div>
  );
};
