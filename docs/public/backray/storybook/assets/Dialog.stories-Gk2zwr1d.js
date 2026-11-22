import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Label-Byk2VUkB.js";import{n as i,t as a}from"./Button-1OrWmIjO.js";import{a as o,c as s,i as c,l,n as u,o as d,r as f,s as p,t as m}from"./Dialog-D9hqDHfl.js";import{n as h,t as g}from"./Input-BSMpyYL7.js";var _,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{i(),l(),h(),n(),_=t(),{expect:v,screen:y,userEvent:b,waitFor:x,within:S}=__STORYBOOK_MODULE_TEST__,C={title:`Components/Dialog`,component:m,tags:[`autodocs`],subcomponents:{DialogTrigger:s,DialogContent:f,DialogHeader:d,DialogTitle:p,DialogDescription:c,DialogFooter:o,DialogClose:u},render:e=>(0,_.jsxs)(m,{...e,children:[(0,_.jsx)(s,{asChild:!0,children:(0,_.jsx)(a,{children:`Edit product`})}),(0,_.jsxs)(f,{children:[(0,_.jsxs)(d,{children:[(0,_.jsx)(p,{children:`Edit product`}),(0,_.jsx)(c,{children:`Change the details and save.`})]}),(0,_.jsxs)(`div`,{className:`grid gap-2`,children:[(0,_.jsx)(r,{htmlFor:`dialog-name`,children:`Name`}),(0,_.jsx)(g,{id:`dialog-name`,defaultValue:`Desk lamp`})]}),(0,_.jsxs)(o,{children:[(0,_.jsx)(u,{asChild:!0,children:(0,_.jsx)(a,{variant:`outline`,children:`Cancel`})}),(0,_.jsx)(a,{children:`Save`})]})]})]}),play:async({canvasElement:e})=>{await b.click(S(e).getByRole(`button`)),await x(()=>v(y.getByRole(`dialog`)).toBeVisible())}},w={},T={render:e=>(0,_.jsxs)(m,{...e,children:[(0,_.jsx)(s,{asChild:!0,children:(0,_.jsx)(a,{variant:`outline`,children:`Show details`})}),(0,_.jsxs)(f,{showCloseButton:!1,children:[(0,_.jsxs)(d,{children:[(0,_.jsx)(p,{children:`Stock details`}),(0,_.jsx)(c,{children:`24 units across 2 warehouses.`})]}),(0,_.jsx)(o,{showCloseButton:!0})]})]})},E={globals:{direction:`rtl`},render:e=>(0,_.jsxs)(m,{...e,children:[(0,_.jsx)(s,{asChild:!0,children:(0,_.jsx)(a,{children:`تعديل المنتج`})}),(0,_.jsxs)(f,{closeLabel:`إغلاق`,children:[(0,_.jsxs)(d,{children:[(0,_.jsx)(p,{children:`تعديل المنتج`}),(0,_.jsx)(c,{children:`غيّر التفاصيل ثم احفظ.`})]}),(0,_.jsx)(o,{showCloseButton:!0,closeLabel:`إغلاق`})]})]})},D=[`Default`,`FooterClose`,`RightToLeft`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Show details</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Stock details</DialogTitle>
          <DialogDescription>24 units across 2 warehouses.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>تعديل المنتج</Button>
      </DialogTrigger>
      <DialogContent closeLabel="إغلاق">
        <DialogHeader>
          <DialogTitle>تعديل المنتج</DialogTitle>
          <DialogDescription>غيّر التفاصيل ثم احفظ.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton closeLabel="إغلاق" />
      </DialogContent>
    </Dialog>
}`,...E.parameters?.docs?.source}}}})))()}O();export{w as Default,T as FooterClose,E as RightToLeft,D as __namedExportsOrder,C as default};