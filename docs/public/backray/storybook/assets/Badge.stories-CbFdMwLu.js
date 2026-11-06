import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./createLucideIcon-D10cjYCo.js";import{n as i,t as a}from"./Badge-BtoKhDxC.js";var o,s;function c(){return(c=e((()=>{n(),o={name:`badge-check`,size:24,node:[[`path`,{d:`M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z`,key:`3c2336`}],[`path`,{d:`m16 9-5.5 5.5L8 12`,key:`xofnsj`}]],aliases:[`verified`]},o.node,s=r(o)})))()}var l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{c(),i(),l=t(),u=[`primary`,`secondary`,`destructive`,`warning`,`outline`,`ghost`,`link`],d={title:`Components/Badge`,component:a,tags:[`autodocs`],args:{children:`Badge`},argTypes:{variant:{control:`select`,options:[...u]},asChild:{control:!1}}},f={},p={render:e=>(0,l.jsx)(`div`,{className:`flex flex-wrap items-center gap-2`,children:u.map(t=>(0,l.jsx)(a,{...e,variant:t,children:t},t))})},m={render:e=>(0,l.jsx)(a,{...e,variant:`warning`,children:`2 warnings`})},h={render:e=>(0,l.jsxs)(a,{...e,variant:`secondary`,children:[(0,l.jsx)(s,{}),`Verified`]})},g={render:e=>(0,l.jsx)(a,{...e,asChild:!0,variant:`outline`,children:(0,l.jsx)(`a`,{href:`#products`,children:`Products`})})},_={globals:{theme:`dark`},render:p.render},v={globals:{direction:`rtl`},render:e=>(0,l.jsxs)(a,{...e,variant:`secondary`,children:[(0,l.jsx)(s,{}),`موثّق`]})},y=[`Primary`,`Variants`,`Warning`,`WithIcon`,`AsLink`,`Dark`,`RightToLeft`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex flex-wrap items-center gap-2">
      {variants.map(variant => <Badge key={variant} {...args} variant={variant}>
          {variant}
        </Badge>)}
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => <Badge {...args} variant="warning">
      2 warnings
    </Badge>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => <Badge {...args} variant="secondary">
      <BadgeCheck />
      Verified
    </Badge>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => <Badge {...args} asChild variant="outline">
      <a href="#products">Products</a>
    </Badge>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  globals: {
    theme: "dark"
  },
  render: Variants.render
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <Badge {...args} variant="secondary">
      <BadgeCheck />
      موثّق
    </Badge>
}`,...v.parameters?.docs?.source}}}})))()}b();export{g as AsLink,_ as Dark,f as Primary,v as RightToLeft,p as Variants,m as Warning,h as WithIcon,y as __namedExportsOrder,d as default};