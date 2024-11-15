import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Tab,
  Tabs,
  Textarea,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";

const CreatePage = () => {
  const [query, setQuery] = useState("");
  const [fields, setFields] = useState([]);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [schema, setSchema] = useState({
    query: "",
    variables: []
  });

  const handleQueryChange = (e) => {
    setSchema(prev => ({
      ...prev,
      query: e.target.value
    }));
  };

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        key: "",
        dataType: "String",
        description: "",
        isArray: false,
        isExpanded: false,
        isEnabled: true,
      },
    ]);
  };

  const handleToggleExpand = (index) => {
    const newFields = [...fields];
    newFields[index].isExpanded = !newFields[index].isExpanded;
    setFields(newFields);
  };

  const handleUpdateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
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

  const handleResetField = () => {
    setFields([]);
    setQuery("");
    setResponse(null);
  };

  const generateCleanSchema = () => {
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

    return {
      query,
      items: cleanFields,
    };
  };

  return (
    <div className="h-full px-10 py-6 grid grid-cols-2 gap-5">
      <div className="flex flex-col gap-4">
        <p className="font-semibold text-2xl">
          Generate API with prompts & Data structure
        </p>

        <Input
          className="w-full h-16"
          classNames={{
            input: "bg-white h-full",
            inputWrapper: "bg-white border h-full border-[#87E64C]",
          }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your prompt, the more detailed your prompt, the more accurate the results"
        />

        <InteractiveQueryInput
          value={schema.query}
          onChange={handleQueryChange}
          onVariableUpdate={(variables) => {
            setSchema((prev) => ({
              ...prev,
              variables,
            }));
          }}
        />

        <VariablesList
          variables={schema.variables}
          onUpdateVariable={(index, newVariable) => {
            setSchema((prev) => ({
              ...prev,
              variables: prev.variables.map((v, i) =>
                i === index ? newVariable : v
              ),
            }));
          }}
          onRemoveVariable={(index) => {
            setSchema((prev) => ({
              ...prev,
              variables: prev.variables.filter((_, i) => i !== index),
            }));
          }}
        />

        <Card className="px-4 py-3">
          <CardHeader className="justify-between">
            <h1 className="font-medium text-xl">Response Data Structure</h1>
            <div className="flex gap-2">
              <Button
                variant="bordered"
                size="sm"
                onClick={handleResetField}
                className="h-8"
              >
                Reset
              </Button>
              <Button
                variant="bordered"
                size="sm"
                onClick={handleAddField}
                className="h-8"
              >
                Add
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {fields && fields.length > 0 ? (
              <>
                {fields.map((field, index) => (
                  <div key={index} className="space-y-0">
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      {/* {field.subItems ? (
                          <button
                            onClick={() => handleToggleExpand(index)}
                            className="w-6"
                          >
                            {field.isExpanded ? (
                              // <ChevronDown className="w-4 h-4" />
                              <p>v</p>
                            ) : (
                              // <ChevronRight className="w-4 h-4" />
                              <p>{">"}</p>
                            )}
                          </button>
                        ) : (
                          <div className="w-6 text-center">T</div>
                        )} */}
                      <Switch
                        isSelected={field.isEnabled}
                        onValueChange={(checked) =>
                          handleUpdateField(index, "isEnabled", checked)
                        }
                      />
                      <Input
                        value={field.key}
                        onChange={(e) =>
                          handleUpdateField(index, "key", e.target.value)
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
                          handleUpdateField(index, "dataType", e.target.value)
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
                      <Switch
                        isSelected={field.isArray}
                        onValueChange={(checked) =>
                          handleUpdateField(index, "isArray", checked)
                        }
                      />
                      {/* <div>Array</div> */}
                      <Input
                        value={field.description}
                        onChange={(e) =>
                          handleUpdateField(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        classNames={{
                          input: "h-8",
                          base: "flex-1 min-w-[100px]",
                        }}
                        placeholder="Description"
                        size="sm"
                      />
                      {field.dataType === "object" && (
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onClick={() => handleAddSubItem(index)}
                        >
                          {/* <Plus className="h-4 w-4" /> */}+
                        </Button>
                      )}
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onClick={() => handleRemoveField(index)}
                      >
                        {/* <Trash2 color="red" className="h-4 w-4" /> */}D
                      </Button>
                    </div>

                    {field.isExpanded && field.subItems && (
                      <div className="ml-4">
                        {field.subItems.map((subItem, subIndex) => (
                          <div key={subIndex} className="w-full border-l">
                            <div className="p-3">
                              <div className="flex items-center gap-4">
                                {/* <div className="w-6 text-center">T</div> */}
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
                                  className="max-w-[200px]"
                                  placeholder="Field name"
                                  size="sm"
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
                                <Switch
                                  isSelected={subItem.isArray}
                                  onValueChange={(checked) =>
                                    handleUpdateSubItem(
                                      index,
                                      subIndex,
                                      "isArray",
                                      checked
                                    )
                                  }
                                  isDisabled={!field.isEnabled}
                                />
                                {/* <div className="text-sm">Array</div> */}
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
                                  placeholder="Description"
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
                                  {/* <Trash2 color="red" className="h-4 w-4" /> */}
                                  D
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
              onClick={() => alert("ooooooooyyyyyy")}
              isDisabled={isLoading}
            >
              Request Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="flex w-full flex-col">
        <CardBody>
          <Tabs aria-label="Options" variant="underlined">
            <Tab key="response" title="Response">
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Response</h2>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl py-[4rem]">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : response !== null ? (
                  <pre>{response}</pre>
                ) : (
                  <div className="p-4 bg-[#2e2e2e] text-[#797979] rounded-lg font-mono text-sm">
                    No response yet
                  </div>
                )}
              </div>
            </Tab>
            <Tab key="gennedSchema" title="Generated Schema">
              <pre className="p-4 rounded-lg overflow-auto text-sm text-neutral-500 bg-neutral-100">
                {JSON.stringify(generateCleanSchema(), null, 2)}
              </pre>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreatePage;

const VariableGuidePopover = () => (
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

const InteractiveQueryInput = ({ value, onChange, onVariableUpdate }) => {
  const [showVariableGuide, setShowVariableGuide] = useState(false);
  const inputRef = useRef(null);

  const highlightVariables = (text) => {
    if (!text) return [<span key="empty"></span>];

    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/\{\{[^}]+\}\}/)) {
        return (
          <span key={index} className="font-semibold text-blue-600">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleInput = (e) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;

    // Check if user just typed '{{'
    if (
      newValue.length > value.length &&
      newValue.slice(position - 2, position) === "{{"
    ) {
      setShowVariableGuide(true);
    }

    // Check if user just completed a variable
    if (
      newValue.length > value.length &&
      newValue.slice(position - 2, position) === "}}"
    ) {
      setShowVariableGuide(false);
    }

    onChange(e);
  };

  // Close guide when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowVariableGuide(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative w-full">
        <Input
          value={value}
          onChange={handleInput}
          placeholder="Enter your query with variables like {{variable_name}}"
          classNames={{
            input:
              "font-mono text-transparent selection:bg-blue-200 caret-black",
            base: "w-full",
          }}
          aria-label="Query input"
          description={
            <div className="flex items-center gap-1 text-sm mt-1">
              <span>Use</span>
              <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                {"{{variable_name}}"}
              </code>
              <span>syntax to define template variables</span>
            </div>
          }
        />

        {/* Overlay for syntax highlighting */}
        <div
          className="pointer-events-none absolute inset-0 px-3 py-2 font-mono text-foreground"
          style={{
            top: "1px",
            zIndex: 1,
          }}
        >
          {highlightVariables(value)}
        </div>
      </div>

      {/* Variable Guide Popover */}
      <Popover
        isOpen={showVariableGuide}
        onOpenChange={(open) => setShowVariableGuide(open)}
        placement="bottom-start"
      >
        <PopoverContent>
          <VariableGuidePopover />
        </PopoverContent>
      </Popover>
    </div>
  );
};


const VariablesList = (({ variables, onUpdateVariable, onRemoveVariable }) => {
  if (!variables || variables.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="text-sm font-medium mb-2">Template Variables</div>
      {variables.map((variable, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
          <div className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">
            {variable.placeholder}
          </div>
          <Input
            value={variable.name}
            onChange={(e) => onUpdateVariable(index, { ...variable, name: e.target.value })}
            placeholder="Variable name"
            className="flex-1"
            size="sm"
          />
          <Input
            value={variable.description}
            onChange={(e) => onUpdateVariable(index, { ...variable, description: e.target.value })}
            placeholder="Description (optional)"
            className="flex-1"
            size="sm"
          />
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => onRemoveVariable(index)}
            className="text-danger"
          >
            D
          </Button>
        </div>
      ))}
    </div>
  );
});