import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./createLucideIcon-D10cjYCo.js";import{n as i,t as a}from"./ellipsis-BF66DF-e.js";import{n as o,t as s}from"./trash-BOw3psJ_.js";import{a as c,c as l,d as u,f as d,i as f,l as p,m,n as h,o as g,p as _,r as v,s as y,t as b,u as x}from"./DropdownMenu-CHowhJwL.js";import{n as S,t as C}from"./Button-1OrWmIjO.js";var w,T;function E(){return(E=e((()=>{n(),w={name:`pencil`,size:24,node:[[`path`,{d:`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`,key:`1a8usu`}],[`path`,{d:`m15 5 4 4`,key:`1mk7zo`}]]},w.node,T=r(w)})))()}var D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{i(),E(),o(),S(),m(),D=t(),{expect:O,screen:k,userEvent:A,waitFor:j,within:M}=__STORYBOOK_MODULE_TEST__,N={title:`Components/DropdownMenu`,component:b,tags:[`autodocs`],subcomponents:{DropdownMenuTrigger:_,DropdownMenuContent:v,DropdownMenuItem:f,DropdownMenuSeparator:l},render:e=>(0,D.jsxs)(b,{...e,children:[(0,D.jsx)(_,{asChild:!0,children:(0,D.jsx)(C,{variant:`ghost`,size:`icon`,"aria-label":`Actions for Desk lamp`,children:(0,D.jsx)(a,{})})}),(0,D.jsxs)(v,{align:`end`,children:[(0,D.jsxs)(f,{children:[(0,D.jsx)(T,{}),`Edit`,(0,D.jsx)(p,{children:`⌘E`})]}),(0,D.jsxs)(f,{variant:`destructive`,children:[(0,D.jsx)(s,{}),`Delete`]})]})]}),play:async({canvasElement:e})=>{await A.click(M(e).getByRole(`button`)),await j(()=>O(k.getByRole(`menu`)).toBeVisible())}},P={},F={render:e=>(0,D.jsxs)(b,{...e,children:[(0,D.jsx)(_,{asChild:!0,children:(0,D.jsx)(C,{variant:`outline`,children:`Columns`})}),(0,D.jsxs)(v,{className:`w-48`,children:[(0,D.jsx)(c,{children:`Show columns`}),(0,D.jsx)(l,{}),(0,D.jsx)(h,{checked:!0,children:`Name`}),(0,D.jsx)(h,{checked:!0,children:`Price`}),(0,D.jsx)(h,{checked:!1,children:`Stock`})]})]})},I={render:e=>(0,D.jsxs)(b,{...e,children:[(0,D.jsx)(_,{asChild:!0,children:(0,D.jsx)(C,{variant:`outline`,children:`Theme`})}),(0,D.jsx)(v,{children:(0,D.jsxs)(g,{value:`system`,children:[(0,D.jsx)(y,{value:`light`,children:`Light`}),(0,D.jsx)(y,{value:`dark`,children:`Dark`}),(0,D.jsx)(y,{value:`system`,children:`System`})]})})]})},L={render:e=>(0,D.jsxs)(b,{...e,children:[(0,D.jsx)(_,{asChild:!0,children:(0,D.jsx)(C,{variant:`outline`,children:`More`})}),(0,D.jsxs)(v,{children:[(0,D.jsx)(f,{children:`Duplicate`}),(0,D.jsxs)(x,{children:[(0,D.jsx)(d,{children:`Move to`}),(0,D.jsxs)(u,{children:[(0,D.jsx)(f,{children:`Warehouse A`}),(0,D.jsx)(f,{children:`Warehouse B`})]})]})]})]})},R={globals:{direction:`rtl`},render:e=>(0,D.jsxs)(b,{...e,dir:`rtl`,children:[(0,D.jsx)(_,{asChild:!0,children:(0,D.jsx)(C,{variant:`ghost`,size:`icon`,"aria-label":`إجراءات مصباح المكتب`,children:(0,D.jsx)(a,{})})}),(0,D.jsxs)(v,{align:`end`,children:[(0,D.jsxs)(f,{children:[(0,D.jsx)(T,{}),`تعديل`]}),(0,D.jsxs)(f,{variant:`destructive`,children:[(0,D.jsx)(s,{}),`حذف`]})]})]})},z=[`Default`,`WithCheckboxes`,`WithRadioGroup`,`WithSubmenu`,`RightToLeft`],P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Columns</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Show columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Name</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Price</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>Stock</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Theme</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value="system">
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">More</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Warehouse A</DropdownMenuItem>
            <DropdownMenuItem>Warehouse B</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <DropdownMenu {...args} dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="إجراءات مصباح المكتب">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Pencil />
          تعديل
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <Trash2 />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...R.parameters?.docs?.source}}}})))()}B();export{P as Default,R as RightToLeft,F as WithCheckboxes,I as WithRadioGroup,L as WithSubmenu,z as __namedExportsOrder,N as default};