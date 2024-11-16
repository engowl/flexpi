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
} from "@nextui-org/react";
import { Plus, Trash2, WandSparkles } from "lucide-react";
import JsonView from "@uiw/react-json-view";
import { monokaiTheme } from "@uiw/react-json-view/monokai";
import Marquee from "react-fast-marquee";
import PluginList from "../components/shared/PluginList";
import axios from "axios";
import { flexpiAPI } from "../api/flexpi";
import toast from "react-hot-toast";
import { useUser } from "../providers/UserProvider";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";

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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Tab
  const [selectedTab, setSelectedTab] = useState("gennedSchema");

  const query = useMemo(() => queryParts.join(""), [queryParts]);

  const [searchParams] = useSearchParams();
  const libraryId = searchParams.get("id");

  const [isTemplate, setIsTemplate] = useState(false);

  const { data: libraryTemplate, isLoading: isLibraryTemplateLoading } = useSWR(
    libraryId ? `/api/${libraryId}` : null,
    async (url) => {
      const { data } = await flexpiAPI.get(url);
      return data.data;
    }
  );

  console.log({
    libraryId,
    libraryTemplate,
  });

  useEffect(() => {
    if (libraryTemplate) {
      // set query
      handleQueryChange({
        target: {
          value: libraryTemplate.query,
        },
      });
      // set variable
      setVariables(libraryTemplate.schema.variables);

      // Set all items to isEnabled
      libraryTemplate.schema.items.forEach((item) => {
        item.isEnabled = true;
        if (item.subItems) {
          item.subItems.forEach((subItem) => {
            subItem.isEnabled = true;
          });
        }
      });

      // Set all items isExpanded to true 
      libraryTemplate.schema.items.forEach((item) => {
        item.isExpanded = true;
      })

      // set data structure
      setFields(libraryTemplate.schema.items);

      setIsTemplate(true);
    } else {
      setIsTemplate(false);
    }
  }, [libraryTemplate]);

  const generateSchema = (currentFields, currentVariables, currentQuery) => {
    // const cleanQuery = currentQuery.replace(/{{([^}]+)}}/g, (_, key) => {
    //   const variable = currentVariables.find((v) => v.key === key);
    //   return variable ? variable.value || key : key;
    // });

    // Return the query with {{variable}} still in place
    const cleanQuery = currentQuery;

    const cleanFields = fields
      .filter((field) => field.isEnabled)
      .map((field) => {
        const cleanField = {
          key: field.key,
          dataType: field.dataType.toLowerCase(),
          description: field.description,
          ...(field.isArray && { isArray: true }),
        };
        if (field.subItems) {
          cleanField.subItems = field.subItems
            .filter((subItem) => subItem.isEnabled)
            .map((subItem) => ({
              key: subItem.key,
              dataType: subItem.dataType.toLowerCase(),
              description: subItem.description,
              ...(subItem.isArray && { isArray: true }),
            }));
        }
        return cleanField;
      });

    const schema = {
      query: cleanQuery,
      items: cleanFields,
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
        isExpanded: false,
        isEnabled: true,
      },
    ];
    setFields(newFields);
    generateSchema(newFields, variables, query);
  };

  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    generateSchema(newFields, variables, query);
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
    generateSchema(newFields, variables, query);
  };

  const updateVariable = (index, variable) => {
    console.log({ variable });
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

  const resetSchema = () => {
    setFields([]);
    setVariables([]);
    setQueryParts([""]);
    setGeneratedSchema("");
  };

  const handleAddSubItem = (index) => {
    const newFields = [...fields];
    newFields[index].isExpanded = true;
    if (!newFields[index].subItems) {
      newFields[index].subItems = [];
    }
    newFields[index].subItems.push({
      key: "",
      dataType: "String",
      description: "",
      isArray: false,
      isEnabled: true,
    });
    setFields(newFields);
  };

  const handleUpdateSubItem = (fieldIndex, subItemIndex, key, value) => {
    const newFields = [...fields];
    newFields[fieldIndex].subItems[subItemIndex][key] = value;
    setFields(newFields);
  };

  const handleRemoveSubItem = (fieldIndex, subItemIndex) => {
    const newFields = [...fields];
    newFields[fieldIndex].subItems = newFields[fieldIndex].subItems.filter(
      (_, i) => i !== subItemIndex
    );
    setFields(newFields);
  };

  const handleRequestData = async () => {
    try {
      setIsLoading(true);

      // Set tab to response
      setSelectedTab("response");

      console.log(generatedSchema);
      // Real
      const res = await flexpiAPI.post("/api/call",
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

      // Dummy
      // const res = await flexpiAPI.post(
      //   "/api/call/dummy",
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

      setResponse(res.data);

      console.log(res.data);
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
      console.log(rBody);

      const res = await flexpiAPI.post("/api/save", rBody);

      toast.success(res.data.message);
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
  // On variable change
  const handleGenerateEndpointPreview = () => {
    const endpoint = `http://localhost:3700/api/${libraryId}`;

    // Add the params based on the variables
    console.log({ variables });

    //   variables example:
    //   {
    //     "variables": [
    //         {
    //             "key": "ens",
    //             "name": "",
    //             "description": "",
    //             "value": "eeessssss"
    //         }
    //     ]
    // }

    // On the case above, the params will be ?ens=eeessssss

    const params = variables
      .map((variable) => `${variable.key}=${variable.value}`)
      .join("&");


    const finalEndpoint = `${endpoint}?${params}`;
    setEndpointPreview(finalEndpoint);
  };

  useEffect(() => {
    handleGenerateEndpointPreview();
  }, [variables]);


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
            {/* <p className="text-sm font-semibold text-black/50 w-24">Data Source</p>
          <div className="w-full bg-white rounded-md border h-12 flex items-center overflow-hidden">
            <MarqueeComponent />
          </div> */}
            <PluginList />
          </div>

          <div className="space-y-6 mt-8">
            <div className="space-y-2">
              <Tooltip placement="bottom-start" content={<GuideTooltip />}>
                <div className="relative">
                  <div
                    className="absolute inset-0 px-3 py-2 z-20 pointer-events-none font-mono text-lg"
                    aria-hidden="true"
                  >
                    {highlightedQuery}
                  </div>
                  <Input
                    value={query}
                    onChange={handleQueryChange}
                    classNames={{
                      input: "bg-transparent font-mono text-lg",
                      inputWrapper: "bg-default-100 border border-[#87E64C]",
                    }}
                    style={{ color: "transparent", caretColor: "black" }}
                    placeholder="Use {{variable_name}} syntax to define template variables"
                  />
                </div>
              </Tooltip>
            </div>

            <Card className="px-4 py-3">
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
                  <>
                    {variables.map((variable, index) => (
                      <div key={index} className="flex mb-4 flex-col">
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-sm px-3 py-2 w- text-center text-blue-500 bg-blue-200 rounded-xl">
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
                    ))}
                  </>
                ) : (
                  <div className="text-center text-sm text-black opacity-60 py-4">
                    No variables added yet
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="px-4 py-3">
              <CardHeader className="border-b">
                <h1 className="font-neuton text-xl">
                  Endpoint Preview
                </h1>
              </CardHeader>
              <CardBody>
                {endpointPreview ? 
                  <>
                    {endpointPreview}
                  </>
                  :
                  ""
                }
              </CardBody>
            </Card>

            <Card className="px-4 py-3">
              <CardHeader className="justify-between border-b">
                <h1 className="font-neuton text-xl">Response Data Structure</h1>
                <div className="flex gap-2">
                  <Button variant="solid" size="sm" onClick={resetSchema}>
                    RESET
                  </Button>
                  <Button
                    variant="solid"
                    color="primary"
                    size="sm"
                    onClick={addField}
                    className="bg-[#E6FFD6] text-[#2F7004]"
                  >
                    ADD
                  </Button>
                </div>
              </CardHeader>
              <div className="flex text-sm font-medium pt-4 text-black/70">
                <div className="w-16 ml-6">Enable</div>
                <div className="w-32 ml-2">Field Name</div>
                <div className="w-24 ml-4">Data Type</div>
                <div className="w-10 ml-3">Array</div>
                <div className="w-80 ml-4">Description</div>
              </div>
              <CardBody>
                {fields && fields.length > 0 ? (
                  <>
                    {fields.map((field, index) => (
                      <div key={index} className="space-y-0">
                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          <Switch
                            isSelected={field.isEnabled}
                            onValueChange={(checked) =>
                              updateField(index, "isEnabled", checked)
                            }
                          />
                          <Input
                            value={field.key}
                            onChange={(e) =>
                              updateField(index, "key", e.target.value)
                            }
                            placeholder="Field Name"
                            size="sm"
                            classNames={{
                              input: "h-8",
                              base: "w-32",
                            }}
                          />
                          <Select
                            selectedKeys={[field.dataType]}
                            defaultSelectedKeys={["string"]}
                            onChange={(e) =>
                              updateField(index, "dataType", e.target.value)
                            }
                            size="sm"
                            className="w-24"
                            label=""
                            aria-label="Data Type"
                            isDisabled={
                              field.subItems && field.subItems?.length > 0
                            }
                          >
                            <SelectItem key="string" value="string">
                              String
                            </SelectItem>
                            <SelectItem key="number" value="number">
                              Number
                            </SelectItem>
                            <SelectItem key="boolean" value="boolean">
                              Boolean
                            </SelectItem>
                            <SelectItem key="object" value="object">
                              Object
                            </SelectItem>
                          </Select>
                          <Checkbox
                            isSelected={field.isArray}
                            onValueChange={(checked) =>
                              updateField(index, "isArray", checked)
                            }
                            size="lg"
                            classNames={{
                              icon: "text-[#2F7004]",
                            }}
                          />
                          <Input
                            value={field.description}
                            onChange={(e) =>
                              updateField(index, "description", e.target.value)
                            }
                            classNames={{
                              input: "h-8",
                              base: "flex-1 min-w-[100px]",
                            }}
                            placeholder="Description (optional)"
                            size="sm"
                          />
                          {field.dataType === "object" && (
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onClick={() => handleAddSubItem(index)}
                              className="bg-[#E6FFD6] text-[#2F7004]"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onClick={() => removeField(index)}
                          >
                            <Trash2 color="red" className="h-4 w-4" />
                          </Button>
                        </div>

                        {field.isExpanded && field.subItems && (
                          <div className="ml-4">
                            {field.subItems.map((subItem, subIndex) => (
                              <div key={subIndex} className="w-full border-l">
                                <div className="p-3">
                                  <div className="flex items-center gap-4">
                                    <Switch
                                      isSelected={subItem.isEnabled}
                                      onValueChange={(checked) =>
                                        handleUpdateSubItem(
                                          index,
                                          subIndex,
                                          "isEnabled",
                                          checked
                                        )
                                      }
                                      isDisabled={!field.isEnabled}
                                    />
                                    <Input
                                      value={subItem.key}
                                      onChange={(e) =>
                                        handleUpdateSubItem(
                                          index,
                                          subIndex,
                                          "key",
                                          e.target.value
                                        )
                                      }
                                      isDisabled={!field.isEnabled}
                                      // className="max-w-[200px]"
                                      placeholder="Field name"
                                      size="sm"
                                      classNames={{
                                        input: "h-8",
                                        base: "w-32",
                                      }}
                                    />
                                    <Select
                                      selectedKeys={[subItem.dataType]}
                                      defaultSelectedKeys={["string"]}
                                      onChange={(e) =>
                                        handleUpdateSubItem(
                                          index,
                                          subIndex,
                                          "dataType",
                                          e.target.value
                                        )
                                      }
                                      isDisabled={!field.isEnabled}
                                      size="sm"
                                      className="w-24"
                                    >
                                      <SelectItem key="string" value="string">
                                        String
                                      </SelectItem>
                                      <SelectItem key="number" value="number">
                                        Number
                                      </SelectItem>
                                      <SelectItem key="boolean" value="boolean">
                                        Boolean
                                      </SelectItem>
                                    </Select>
                                    <Checkbox
                                      isSelected={subItem.isArray}
                                      onValueChange={(checked) =>
                                        handleUpdateSubItem(
                                          index,
                                          subIndex,
                                          "isArray",
                                          checked
                                        )
                                      }
                                      size="lg"
                                      classNames={{
                                        icon: "text-[#2F7004]",
                                      }}
                                      isDisabled={!field.isEnabled}
                                    />
                                    <Input
                                      value={subItem.description}
                                      onChange={(e) =>
                                        handleUpdateSubItem(
                                          index,
                                          subIndex,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="flex-1"
                                      placeholder="Description (optional)"
                                      size="sm"
                                      isDisabled={!field.isEnabled}
                                    />
                                    <Button
                                      isIconOnly
                                      variant="light"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveSubItem(index, subIndex)
                                      }
                                    >
                                      <Trash2 color="red" className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center text-sm text-black opacity-60 py-4">
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
                        onChange={(e) => handleApiNameChange(e)}
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
            <Tab
              key="gennedSchema"
              title="Generated Schema"
              className="font-neuton text-xl"
            >
              <Card>
                <CardBody>
                  <pre className="font-mono text-xs whitespace-pre-wrap py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl">
                    {generatedSchema || "No schema generated yet"}
                  </pre>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="response"
              title="Response"
              className="font-neuton text-xl"
            >
              <Card>
                <CardBody>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl py-[4rem]">
                      {import.meta.env.VITE_MEME_LOADING === "true" ? (
                        <div className="flex flex-col items-center">
                          <video autoPlay loop className="w-1/2 rounded-xl">
                            <source
                              src="/assets/video/meme_loading.mp4"
                              type="video/mp4"
                            />
                          </video>
                          <div className="text-center font-semibold mt-4 animate-pulse text-2xl">
                            Our AI working in the background be like...
                          </div>
                        </div>
                      ) : (
                        <Spinner size="lg" color="primary" />
                      )}
                    </div>
                  ) : response !== null ? (
                    <JsonView
                      value={response.data}
                      style={monokaiTheme}
                      collapsed={false}
                      shortenTextAfterLength={1000}
                      className="py-4 px-4 rounded-xl"
                      displayDataTypes={false}
                      enableClipboard
                      indentWidth={24}
                    />
                  ) : (
                    <div className="p-4 bg-[#2e2e2e] text-[#797979] rounded-lg font-mono text-sm">
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
