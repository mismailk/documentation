import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./createLucideIcon-D10cjYCo.js";import{n as i,t as a}from"./x-DPLMntrT.js";import{n as o,t as s}from"./Button-1OrWmIjO.js";var c,l;function u(){return(u=e((()=>{n(),c={name:`arrow-right`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]},c.node,l=r(c)})))()}var d,f;function p(){return(p=e((()=>{n(),d={name:`plus`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`M12 5v14`,key:`s699le`}]]},d.node,f=r(d)})))()}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{u(),p(),i(),o(),m=t(),{expect:h,fn:g,userEvent:_,within:v}=__STORYBOOK_MODULE_TEST__,y={title:`Components/Button`,component:s,tags:[`autodocs`],args:{children:`Button`,onClick:g()},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`destructive`,`outline`,`ghost`,`link`]},size:{control:`select`,options:[`md`,`xs`,`sm`,`lg`,`icon`,`icon-xs`,`icon-sm`,`icon-lg`]},asChild:{control:!1}}},b={play:async({args:e,canvasElement:t})=>{await _.click(v(t).getByRole(`button`)),await h(e.onClick).toHaveBeenCalledOnce()}},x={args:{variant:`secondary`}},S={args:{variant:`destructive`,children:`Delete`}},C={args:{variant:`outline`,children:`Cancel`}},w={args:{variant:`ghost`}},T={args:{variant:`link`}},E={render:e=>(0,m.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,m.jsx)(s,{...e,size:`xs`,children:`Extra small`}),(0,m.jsx)(s,{...e,size:`sm`,children:`Small`}),(0,m.jsx)(s,{...e,size:`md`,children:`Medium`}),(0,m.jsx)(s,{...e,size:`lg`,children:`Large`})]})},D={render:e=>(0,m.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,m.jsxs)(s,{...e,children:[(0,m.jsx)(f,{}),`Add product`]}),(0,m.jsxs)(s,{...e,variant:`outline`,children:[`Next`,(0,m.jsx)(l,{className:`rtl:rotate-180`})]})]})},O={render:e=>(0,m.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,m.jsx)(s,{...e,size:`icon-xs`,variant:`ghost`,"aria-label":`Close`,children:(0,m.jsx)(a,{})}),(0,m.jsx)(s,{...e,size:`icon-sm`,variant:`ghost`,"aria-label":`Close`,children:(0,m.jsx)(a,{})}),(0,m.jsx)(s,{...e,size:`icon`,variant:`ghost`,"aria-label":`Close`,children:(0,m.jsx)(a,{})}),(0,m.jsx)(s,{...e,size:`icon-lg`,variant:`ghost`,"aria-label":`Close`,children:(0,m.jsx)(a,{})})]})},k={render:e=>(0,m.jsx)(s,{...e,asChild:!0,variant:`outline`,children:(0,m.jsx)(`a`,{href:`#products`,children:`Go to products`})})},A={args:{disabled:!0},play:async({canvasElement:e})=>{await h(v(e).getByRole(`button`)).toBeDisabled()}},j={globals:{theme:`dark`},render:e=>(0,m.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,m.jsx)(s,{...e,children:`Primary`}),(0,m.jsx)(s,{...e,variant:`secondary`,children:`Secondary`}),(0,m.jsx)(s,{...e,variant:`destructive`,children:`Delete`}),(0,m.jsx)(s,{...e,variant:`outline`,children:`Cancel`})]})},M={globals:{direction:`rtl`},render:e=>(0,m.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,m.jsxs)(s,{...e,children:[(0,m.jsx)(f,{}),`إضافة منتج`]}),(0,m.jsxs)(s,{...e,variant:`outline`,children:[`التالي`,(0,m.jsx)(l,{className:`rtl:rotate-180`})]})]})},N=[`Primary`,`Secondary`,`Destructive`,`Outline`,`Ghost`,`Link`,`Sizes`,`WithIcon`,`IconOnly`,`AsLink`,`Disabled`,`Dark`,`RightToLeft`],b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "secondary"
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive",
    children: "Delete"
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    children: "Cancel"
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "ghost"
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "link"
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-wrap items-center gap-2">
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-wrap items-center gap-2">
      <Button {...args}>
        <Plus />
        Add product
      </Button>
      <Button {...args} variant="outline">
        Next
        <ArrowRight className="rtl:rotate-180" />
      </Button>
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-wrap items-center gap-2">
      <Button {...args} size="icon-xs" variant="ghost" aria-label="Close">
        <X />
      </Button>
      <Button {...args} size="icon-sm" variant="ghost" aria-label="Close">
        <X />
      </Button>
      <Button {...args} size="icon" variant="ghost" aria-label="Close">
        <X />
      </Button>
      <Button {...args} size="icon-lg" variant="ghost" aria-label="Close">
        <X />
      </Button>
    </div>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => <Button {...args} asChild variant="outline">
      <a href="#products">Go to products</a>
    </Button>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  globals: {
    theme: "dark"
  },
  render: args => <div className="flex flex-wrap items-center gap-2">
      <Button {...args}>Primary</Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="destructive">
        Delete
      </Button>
      <Button {...args} variant="outline">
        Cancel
      </Button>
    </div>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <div className="flex flex-wrap items-center gap-2">
      <Button {...args}>
        <Plus />
        إضافة منتج
      </Button>
      <Button {...args} variant="outline">
        التالي
        <ArrowRight className="rtl:rotate-180" />
      </Button>
    </div>
}`,...M.parameters?.docs?.source}}}})))()}P();export{k as AsLink,j as Dark,S as Destructive,A as Disabled,w as Ghost,O as IconOnly,T as Link,C as Outline,b as Primary,M as RightToLeft,x as Secondary,E as Sizes,D as WithIcon,N as __namedExportsOrder,y as default};