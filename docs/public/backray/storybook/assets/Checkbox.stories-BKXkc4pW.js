import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Checkbox-CWmrAGDd.js";import{n as i,t as a}from"./Label-Byk2VUkB.js";var o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{n(),i(),o=t(),{expect:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Components/Checkbox`,component:r,tags:[`autodocs`],render:e=>(0,o.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,o.jsx)(r,{...e,id:`terms`}),(0,o.jsx)(a,{htmlFor:`terms`,children:`Accept terms`})]})},d={play:async({canvasElement:e})=>{let t=l(e).getByRole(`checkbox`,{name:`Accept terms`});await c.click(t),await s(t).toHaveAttribute(`aria-checked`,`true`)}},f={args:{defaultChecked:!0}},p={args:{disabled:!0}},m={args:{"aria-invalid":!0}},h={globals:{direction:`rtl`},render:e=>(0,o.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,o.jsx)(r,{...e,id:`terms-ar`}),(0,o.jsx)(a,{htmlFor:`terms-ar`,children:`أوافق على الشروط`})]})},g=[`Default`,`Checked`,`Disabled`,`Invalid`,`RightToLeft`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "Accept terms"
    });
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    "aria-invalid": true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <div className="flex items-center gap-2">
      <Checkbox {...args} id="terms-ar" />
      <Label htmlFor="terms-ar">أوافق على الشروط</Label>
    </div>
}`,...h.parameters?.docs?.source}}}})))()}_();export{f as Checked,d as Default,p as Disabled,m as Invalid,h as RightToLeft,g as __namedExportsOrder,u as default};