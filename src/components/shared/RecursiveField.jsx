import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { Plus, Trash2 } from "lucide-react";
import { createNewField } from "../utils/createNewField";

const RecursiveField = ({
  fields,
  updateField,
  handleAddSubItem,
  handleRemoveSubItem,
  isParentEnabled = true,
  removeField,
}) => {
  if (!fields) {
    return (
      <div className="text-center text-sm text-black opacity-60 py-4">
        No fields added yet
      </div>
    );
  }

  return (
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
              onChange={(e) => updateField(index, "key", e.target.value)}
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
              onChange={(e) => updateField(index, "dataType", e.target.value)}
              size="sm"
              className="w-24"
              label=""
              aria-label="Data Type"
              isDisabled={field.subItems && field.subItems.length > 0}
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
              placeholder="Description"
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

          {field.subItems && (
            <div className="ml-4">
              <RecursiveField
                fields={field.subItems}
                updateField={(subIndex, key, value) =>
                  updateField(index, "subItems", [
                    ...field.subItems.slice(0, subIndex),
                    { ...field.subItems[subIndex], [key]: value },
                    ...field.subItems.slice(subIndex + 1),
                  ])
                }
                handleAddSubItem={(subIndex) =>
                  handleAddSubItem(index, subIndex)
                }
                handleRemoveSubItem={(subIndex) => {
                  const newSubItems = [
                    ...field.subItems.slice(0, subIndex),
                    ...field.subItems.slice(subIndex + 1),
                  ];
                  updateField(index, "subItems", newSubItems);
                }}
                removeField={(subIndex) => handleRemoveSubItem(index, subIndex)}
                isParentEnabled={field.isEnabled}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default RecursiveField;
