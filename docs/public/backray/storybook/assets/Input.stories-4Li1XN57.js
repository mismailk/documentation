import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Label-Byk2VUkB.js";import{n as i,t as a}from"./Input-BSMpyYL7.js";var o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{i(),n(),o=t(),{expect:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Components/Input`,component:a,tags:[`autodocs`],args:{placeholder:`Product name`},argTypes:{type:{control:`select`,options:[`text`,`email`,`number`,`date`,`password`,`search`]}},decorators:[e=>(0,o.jsx)(`div`,{className:`w-72`,children:(0,o.jsx)(e,{})})]},d={args:{"aria-label":`Product name`}},f={render:e=>(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`product-name`,children:`Name`}),(0,o.jsx)(a,{...e,id:`product-name`})]}),play:async({canvasElement:e})=>{let t=l(e).getByLabelText(`Name`);await c.type(t,`Desk lamp`),await s(t).toHaveValue(`Desk lamp`)}},p={args:{"aria-label":`Product name`,disabled:!0}},m={render:e=>(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`price`,children:`Price`}),(0,o.jsx)(a,{...e,id:`price`,type:`number`,defaultValue:`-5`,"aria-invalid":`true`,"aria-describedby":`price-error`}),(0,o.jsx)(`p`,{id:`price-error`,className:`text-sm text-destructive`,children:`Price must be positive.`})]})},h={globals:{direction:`rtl`},render:e=>(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`name-ar`,children:`الاسم`}),(0,o.jsx)(a,{...e,id:`name-ar`,placeholder:`اسم المنتج`})]})},g=[`Default`,`WithLabel`,`Disabled`,`Invalid`,`RightToLeft`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    "aria-label": "Product name"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="product-name">Name</Label>
      <Input {...args} id="product-name" />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const input = within(canvasElement).getByLabelText("Name");
    await userEvent.type(input, "Desk lamp");
    await expect(input).toHaveValue("Desk lamp");
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    "aria-label": "Product name",
    disabled: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="price">Price</Label>
      <Input {...args} id="price" type="number" defaultValue="-5" aria-invalid="true" aria-describedby="price-error" />
      <p id="price-error" className="text-sm text-destructive">
        Price must be positive.
      </p>
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <div className="grid gap-2">
      <Label htmlFor="name-ar">الاسم</Label>
      <Input {...args} id="name-ar" placeholder="اسم المنتج" />
    </div>
}`,...h.parameters?.docs?.source}}}})))()}_();export{d as Default,p as Disabled,m as Invalid,h as RightToLeft,f as WithLabel,g as __namedExportsOrder,u as default};