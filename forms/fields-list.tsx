import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"



type FieldInputType = {
key: string, placeholder?: string, label?: string, config?: any[]
}



let componentTheme = { input: 'bg-background' }

const FieldItem = (key: string, placeholder?: string, label?: string, config?: any[]) =>   <Field>
<FieldLabel htmlFor={key}>{key}</FieldLabel>

          <Input className="bg-background" id={key} placeholder={key} type="text" />
<div>Input Config</div>

  </Field>

let demoFields = [{ key: 'field-1', placeholder: 'F1', label: 'Domain', config: [] ]
const [fields. setFields] = useState(demoFields)

const Example = () => (
  <div className="w-full max-w-md">
    <FieldSet>
      <FieldLegend>Information</FieldLegend>
      <FieldDescription>We need your address to deliver your order.</FieldDescription>
      <FieldGroup>
      
        <div className="grid grid-cols-2 gap-4">

        {fields.map(field => <FieldItem {...field}}
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input className="bg-background" id="city" placeholder="Gateway" type="text" />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip">Comment</FieldLabel>
            <Input className="bg-background" id="zip" placeholder="dns routing comment" type="text" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  </div>
)

export default Example
