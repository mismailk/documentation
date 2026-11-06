import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Label-Byk2VUkB.js";import{n as a,t as o}from"./Combobox-L3agf4Aw.js";function s({value:e,onChange:t,...n}){let[r,i]=(0,c.useState)(e),[a,s]=(0,c.useState)([]),[u,d]=(0,c.useState)(!1),f=(0,c.useRef)(void 0);(0,c.useEffect)(()=>()=>clearTimeout(f.current),[]);function m(e){clearTimeout(f.current),d(!0),f.current=setTimeout(()=>{s(p.filter(t=>t.label.toLowerCase().includes(e.trim().toLowerCase()))),d(!1)},300)}return(0,l.jsx)(o,{...n,value:r,options:a,loading:u,onQueryChange:m,onChange:e=>{i(e),t(e)}})}var c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{c=t(),a(),r(),l=n(),{expect:u,userEvent:d,within:f}=__STORYBOOK_MODULE_TEST__,p=[{value:`1`,label:`Layla Hassan`},{value:`2`,label:`Omar Khalid`},{value:`3`,label:`Sara Ahmed`},{value:`4`,label:`Youssef Nader`},{value:`5`,label:`Salma Mostafa`}],m={title:`Components/Combobox`,component:o,tags:[`autodocs`],args:{value:void 0,onChange:()=>{},options:[],onQueryChange:()=>{},placeholder:`Search people`,emptyLabel:`No results`,loadingLabel:`Loading…`,listLabel:`People`,clearLabel:`Clear`},render:e=>(0,l.jsx)(s,{...e}),decorators:[e=>(0,l.jsx)(`div`,{className:`w-72`,children:(0,l.jsx)(e,{})})]},h={args:{id:`person-default`},play:async({canvasElement:e})=>{let t=f(e);await d.click(t.getByRole(`combobox`)),await d.type(t.getByRole(`combobox`),`sa`);let n=await t.findByRole(`option`,{name:`Sara Ahmed`});await d.click(n),await u(t.getByRole(`combobox`)).toHaveValue(`Sara Ahmed`)}},g={render:e=>(0,l.jsxs)(`div`,{className:`grid gap-2`,children:[(0,l.jsx)(i,{htmlFor:`person`,children:`Assignee`}),(0,l.jsx)(s,{...e,id:`person`})]})},_={args:{id:`person-value`,value:p[0]}},v={args:{id:`person-disabled`,value:p[0],disabled:!0}},y={render:e=>(0,l.jsxs)(`div`,{className:`grid gap-2`,children:[(0,l.jsx)(i,{htmlFor:`person-invalid`,children:`Assignee`}),(0,l.jsx)(s,{...e,id:`person-invalid`,"aria-invalid":!0,"aria-describedby":`person-error`}),(0,l.jsx)(`p`,{id:`person-error`,className:`text-sm text-destructive`,children:`Choose an assignee.`})]})},b={globals:{direction:`rtl`},args:{id:`person-rtl`,placeholder:`ابحث عن شخص`,emptyLabel:`لا توجد نتائج`,loadingLabel:`جارٍ التحميل…`,listLabel:`الأشخاص`,clearLabel:`مسح`}},x=[`Default`,`WithLabel`,`WithValue`,`Disabled`,`Invalid`,`RightToLeft`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    id: "person-default"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.type(canvas.getByRole("combobox"), "sa");
    const option = await canvas.findByRole("option", {
      name: "Sara Ahmed"
    });
    await userEvent.click(option);
    await expect(canvas.getByRole("combobox")).toHaveValue("Sara Ahmed");
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="person">Assignee</Label>
      <Lazy {...args} id="person" />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    id: "person-value",
    value: people[0]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    id: "person-disabled",
    value: people[0],
    disabled: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="person-invalid">Assignee</Label>
      <Lazy {...args} id="person-invalid" aria-invalid aria-describedby="person-error" />
      <p id="person-error" className="text-sm text-destructive">
        Choose an assignee.
      </p>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  args: {
    id: "person-rtl",
    placeholder: "ابحث عن شخص",
    emptyLabel: "لا توجد نتائج",
    loadingLabel: "جارٍ التحميل…",
    listLabel: "الأشخاص",
    clearLabel: "مسح"
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{h as Default,v as Disabled,y as Invalid,b as RightToLeft,g as WithLabel,_ as WithValue,x as __namedExportsOrder,m as default};