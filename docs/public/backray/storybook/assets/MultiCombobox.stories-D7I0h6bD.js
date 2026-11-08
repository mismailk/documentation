import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./x-DPLMntrT.js";import{n as a,t as o}from"./dist-CxPeBc8N.js";import{n as s,t as c}from"./Label-Byk2VUkB.js";import{n as l,t as u}from"./Badge-BtoKhDxC.js";import{a as d,i as f,n as p,o as m,r as h,t as g}from"./useComboboxList-DEE2oHOv.js";function _({value:e,onChange:t,options:n,onQueryChange:r,loading:a,onBlur:s,id:c,placeholder:l,disabled:f,emptyLabel:m,loadingLabel:g,listLabel:_,removeLabel:b,className:x,"aria-invalid":S,"aria-describedby":C}){let[w,T]=(0,v.useState)(``),E=(0,v.useRef)(null),D=new Set(e.map(e=>e.value)),O=n.filter(e=>!D.has(e.value)),k=p({options:O,onPick:A});function A(n){t([...e,n]),T(``),r(``),k.show()}function j(n){t(e.filter(e=>e.value!==n.value)),E.current?.focus()}function M(){k.show(),r(w)}return(0,y.jsxs)(`div`,{"data-slot":`multi-combobox`,"data-invalid":S||void 0,"data-disabled":f||void 0,className:o(...d.root,x),onClick:()=>E.current?.focus(),children:[e.map(e=>(0,y.jsxs)(u,{variant:`secondary`,className:d.chip,children:[(0,y.jsx)(`span`,{className:`truncate`,children:e.label}),(0,y.jsx)(`button`,{type:`button`,disabled:f,"aria-label":b(e.label),className:d.remove,onClick:()=>j(e),children:(0,y.jsx)(i,{})})]},e.value)),(0,y.jsx)(`input`,{ref:E,id:c,type:`text`,role:`combobox`,"aria-expanded":k.open,"aria-controls":k.listVisible?k.listId:void 0,"aria-autocomplete":`list`,"aria-activedescendant":k.activeId,"aria-invalid":S,"aria-describedby":C,value:w,disabled:f,placeholder:e.length===0?l:void 0,autoComplete:`off`,className:d.input,onFocus:M,onClick:()=>{k.isOpen()||M()},onChange:e=>{T(e.target.value),k.show(),r(e.target.value)},onKeyDown:n=>{k.handleKeyDown(n)||n.key===`Backspace`&&w===``&&e.length>0&&t(e.slice(0,-1))},onBlur:()=>{T(``),k.close(),s?.()}}),k.open&&(0,y.jsx)(h,{options:O,listId:k.listId,optionId:k.optionId,active:k.active,loading:a,emptyLabel:m,loadingLabel:g,listLabel:_,onPick:A})]})}var v,y;function b(){return(b=e((()=>{a(),r(),v=t(),l(),m(),f(),g(),y=n(),_.__docgenInfo={description:``,methods:[],displayName:`MultiCombobox`,props:{options:{required:!0,tsType:{name:`Array`,elements:[{name:`ComboboxOption`}],raw:`ComboboxOption[]`},description:``},loading:{required:!1,tsType:{name:`boolean`},description:``},id:{required:!1,tsType:{name:`string`},description:``},placeholder:{required:!1,tsType:{name:`string`},description:``},disabled:{required:!1,tsType:{name:`boolean`},description:``},"aria-invalid":{required:!1,tsType:{name:`boolean`},description:``},"aria-describedby":{required:!1,tsType:{name:`string`},description:``},emptyLabel:{required:!0,tsType:{name:`string`},description:`Shown when there are no options. Required: the kit has no English.`},loadingLabel:{required:!0,tsType:{name:`string`},description:`Shown while loading and there are no options yet.`},listLabel:{required:!0,tsType:{name:`string`},description:`The accessible name of the option list.`},className:{required:!1,tsType:{name:`string`},description:``},value:{required:!0,tsType:{name:`Array`,elements:[{name:`ComboboxOption`}],raw:`ComboboxOption[]`},description:``}}}})))()}function x({value:e,onChange:t,...n}){let[r,i]=(0,S.useState)(e),[a,o]=(0,S.useState)([]),[s,c]=(0,S.useState)(!1),l=(0,S.useRef)(void 0);(0,S.useEffect)(()=>()=>clearTimeout(l.current),[]);function u(e){clearTimeout(l.current),c(!0),l.current=setTimeout(()=>{o(D.filter(t=>t.label.toLowerCase().includes(e.trim().toLowerCase()))),c(!1)},300)}return(0,C.jsx)(_,{...n,value:r,options:a,loading:s,onQueryChange:u,onChange:e=>{i(e),t(e)}})}var S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{S=t(),s(),b(),C=n(),{expect:w,userEvent:T,within:E}=__STORYBOOK_MODULE_TEST__,D=[{value:`1`,label:`Layla Hassan`},{value:`2`,label:`Omar Khalid`},{value:`3`,label:`Sara Ahmed`},{value:`4`,label:`Youssef Nader`},{value:`5`,label:`Salma Mostafa`}],O={title:`Components/MultiCombobox`,component:_,tags:[`autodocs`],args:{value:[],onChange:()=>{},options:[],onQueryChange:()=>{},placeholder:`Search people`,emptyLabel:`No results`,loadingLabel:`Loading…`,listLabel:`People`,removeLabel:e=>`Remove ${e}`},render:e=>(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(c,{htmlFor:e.id,className:`sr-only`,children:`Reviewers`}),(0,C.jsx)(x,{...e})]}),decorators:[e=>(0,C.jsx)(`div`,{className:`w-80`,children:(0,C.jsx)(e,{})})]},k={args:{id:`people-default`},play:async({canvasElement:e})=>{let t=E(e);await T.click(t.getByRole(`combobox`)),await T.click(await t.findByRole(`option`,{name:`Omar Khalid`})),await T.click(await t.findByRole(`option`,{name:`Sara Ahmed`})),await w(t.getByRole(`button`,{name:`Remove Omar Khalid`})).toBeInTheDocument(),await w(t.getByRole(`button`,{name:`Remove Sara Ahmed`})).toBeInTheDocument()}},A={render:e=>(0,C.jsxs)(`div`,{className:`grid gap-2`,children:[(0,C.jsx)(c,{htmlFor:`people`,children:`Reviewers`}),(0,C.jsx)(x,{...e,id:`people`})]})},j={args:{id:`people-values`,value:[D[0],D[2]]}},M={args:{id:`people-disabled`,value:[D[0]],disabled:!0},parameters:{a11y:{config:{rules:[{id:`color-contrast`,enabled:!1}]}}}},N={render:e=>(0,C.jsxs)(`div`,{className:`grid gap-2`,children:[(0,C.jsx)(c,{htmlFor:`people-invalid`,children:`Reviewers`}),(0,C.jsx)(x,{...e,id:`people-invalid`,"aria-invalid":!0,"aria-describedby":`people-error`}),(0,C.jsx)(`p`,{id:`people-error`,className:`text-sm text-destructive`,children:`Choose at least one reviewer.`})]})},P={globals:{direction:`rtl`},render:e=>(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(c,{htmlFor:e.id,className:`sr-only`,children:`المراجعون`}),(0,C.jsx)(x,{...e})]}),args:{id:`people-rtl`,value:[D[0]],placeholder:`ابحث عن أشخاص`,emptyLabel:`لا توجد نتائج`,loadingLabel:`جارٍ التحميل…`,listLabel:`الأشخاص`,removeLabel:e=>`إزالة ${e}`}},F=[`Default`,`WithLabel`,`WithValues`,`Disabled`,`Invalid`,`RightToLeft`],k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    id: "people-default"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(await canvas.findByRole("option", {
      name: "Omar Khalid"
    }));
    await userEvent.click(await canvas.findByRole("option", {
      name: "Sara Ahmed"
    }));
    await expect(canvas.getByRole("button", {
      name: "Remove Omar Khalid"
    })).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Remove Sara Ahmed"
    })).toBeInTheDocument();
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="people">Reviewers</Label>
      <Lazy {...args} id="people" />
    </div>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    id: "people-values",
    value: [people[0], people[2]]
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    id: "people-disabled",
    value: [people[0]],
    disabled: true
  },
  parameters: {
    a11y: {
      config: {
        rules: [
        // Inactive controls are exempt from WCAG 1.4.3; axe still measures the dimmed chips.
        {
          id: "color-contrast",
          enabled: false
        }]
      }
    }
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="people-invalid">Reviewers</Label>
      <Lazy {...args} id="people-invalid" aria-invalid aria-describedby="people-error" />
      <p id="people-error" className="text-sm text-destructive">
        Choose at least one reviewer.
      </p>
    </div>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <>
      <Label htmlFor={args.id} className="sr-only">
        المراجعون
      </Label>
      <Lazy {...args} />
    </>,
  args: {
    id: "people-rtl",
    value: [people[0]],
    placeholder: "ابحث عن أشخاص",
    emptyLabel: "لا توجد نتائج",
    loadingLabel: "جارٍ التحميل…",
    listLabel: "الأشخاص",
    removeLabel: (label: string) => \`إزالة \${label}\`
  }
}`,...P.parameters?.docs?.source}}}})))()}I();export{k as Default,M as Disabled,N as Invalid,P as RightToLeft,A as WithLabel,j as WithValues,F as __namedExportsOrder,O as default};