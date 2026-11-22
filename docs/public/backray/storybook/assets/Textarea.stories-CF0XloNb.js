import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./dist-CxPeBc8N.js";import{n as i,t as a}from"./Label-Byk2VUkB.js";var o;function s(){return(s=e((()=>{o=[`min-h-16 w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30`,`focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`,`aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40`]})))()}function c({className:e,...t}){return(0,l.jsx)(`textarea`,{"data-slot":`textarea`,className:r(...o,e),...t})}var l;function u(){return(u=e((()=>{n(),s(),l=t(),c.__docgenInfo={description:``,methods:[],displayName:`Textarea`}})))()}var d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{i(),u(),d=t(),{expect:f,userEvent:p,within:m}=__STORYBOOK_MODULE_TEST__,h={title:`Components/Textarea`,component:c,tags:[`autodocs`],args:{placeholder:`Product description`},decorators:[e=>(0,d.jsx)(`div`,{className:`w-72`,children:(0,d.jsx)(e,{})})]},g={args:{"aria-label":`Product description`}},_={render:e=>(0,d.jsxs)(`div`,{className:`grid gap-2`,children:[(0,d.jsx)(a,{htmlFor:`description`,children:`Description`}),(0,d.jsx)(c,{...e,id:`description`})]}),play:async({canvasElement:e})=>{let t=m(e).getByLabelText(`Description`);await p.type(t,`Warm light`),await f(t).toHaveValue(`Warm light`)}},v={args:{"aria-label":`Product description`,disabled:!0}},y={render:e=>(0,d.jsxs)(`div`,{className:`grid gap-2`,children:[(0,d.jsx)(a,{htmlFor:`notes`,children:`Notes`}),(0,d.jsx)(c,{...e,id:`notes`,defaultValue:`x`,"aria-invalid":`true`,"aria-describedby":`notes-error`}),(0,d.jsx)(`p`,{id:`notes-error`,className:`text-sm text-destructive`,children:`Notes must be at least 10 characters.`})]})},b={globals:{direction:`rtl`},render:e=>(0,d.jsxs)(`div`,{className:`grid gap-2`,children:[(0,d.jsx)(a,{htmlFor:`description-ar`,children:`الوصف`}),(0,d.jsx)(c,{...e,id:`description-ar`,placeholder:`وصف المنتج`})]})},x=[`Default`,`WithLabel`,`Disabled`,`Invalid`,`RightToLeft`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    "aria-label": "Product description"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="description">Description</Label>
      <Textarea {...args} id="description" />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const textarea = within(canvasElement).getByLabelText("Description");
    await userEvent.type(textarea, "Warm light");
    await expect(textarea).toHaveValue("Warm light");
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    "aria-label": "Product description",
    disabled: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea {...args} id="notes" defaultValue="x" aria-invalid="true" aria-describedby="notes-error" />
      <p id="notes-error" className="text-sm text-destructive">
        Notes must be at least 10 characters.
      </p>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <div className="grid gap-2">
      <Label htmlFor="description-ar">الوصف</Label>
      <Textarea {...args} id="description-ar" placeholder="وصف المنتج" />
    </div>
}`,...b.parameters?.docs?.source}}}})))()}S();export{g as Default,v as Disabled,y as Invalid,b as RightToLeft,_ as WithLabel,x as __namedExportsOrder,h as default};