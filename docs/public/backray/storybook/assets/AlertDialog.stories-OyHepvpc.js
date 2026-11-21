import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./trash-BOw3psJ_.js";import{a as i,c as a,d as o,i as s,l as c,n as l,o as u,r as d,s as f,t as p,u as m}from"./AlertDialog-eZ62PDW-.js";import{n as h,t as g}from"./Button-1OrWmIjO.js";var _,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{n(),o(),h(),_=t(),{expect:v,screen:y,userEvent:b,waitFor:x,within:S}=__STORYBOOK_MODULE_TEST__,C={title:`Components/AlertDialog`,component:p,tags:[`autodocs`],subcomponents:{AlertDialogTrigger:m,AlertDialogContent:s,AlertDialogHeader:f,AlertDialogTitle:c,AlertDialogDescription:i,AlertDialogMedia:a,AlertDialogFooter:u,AlertDialogCancel:d,AlertDialogAction:l},render:e=>(0,_.jsxs)(p,{...e,children:[(0,_.jsx)(m,{asChild:!0,children:(0,_.jsx)(g,{variant:`destructive`,children:`Delete product`})}),(0,_.jsxs)(s,{children:[(0,_.jsxs)(f,{children:[(0,_.jsx)(c,{children:`Delete Desk lamp?`}),(0,_.jsx)(i,{children:`This permanently removes the product. It cannot be undone.`})]}),(0,_.jsxs)(u,{children:[(0,_.jsx)(d,{children:`Cancel`}),(0,_.jsx)(l,{variant:`destructive`,children:`Delete`})]})]})]}),play:async({canvasElement:e})=>{await b.click(S(e).getByRole(`button`)),await x(()=>v(y.getByRole(`alertdialog`)).toBeVisible())}},w={},T={render:e=>(0,_.jsxs)(p,{...e,children:[(0,_.jsx)(m,{asChild:!0,children:(0,_.jsx)(g,{variant:`outline`,children:`Discard changes`})}),(0,_.jsxs)(s,{size:`sm`,children:[(0,_.jsxs)(f,{children:[(0,_.jsx)(c,{children:`Discard changes?`}),(0,_.jsx)(i,{children:`Your edits will be lost.`})]}),(0,_.jsxs)(u,{children:[(0,_.jsx)(d,{children:`Keep editing`}),(0,_.jsx)(l,{children:`Discard`})]})]})]})},E={render:e=>(0,_.jsxs)(p,{...e,children:[(0,_.jsx)(m,{asChild:!0,children:(0,_.jsx)(g,{variant:`destructive`,children:`Delete 3 products`})}),(0,_.jsxs)(s,{children:[(0,_.jsxs)(f,{children:[(0,_.jsx)(a,{children:(0,_.jsx)(r,{})}),(0,_.jsx)(c,{children:`Delete 3 products?`}),(0,_.jsx)(i,{children:`This cannot be undone.`})]}),(0,_.jsxs)(u,{children:[(0,_.jsx)(d,{children:`Cancel`}),(0,_.jsx)(l,{variant:`destructive`,children:`Delete`})]})]})]})},D={globals:{direction:`rtl`},render:e=>(0,_.jsxs)(p,{...e,children:[(0,_.jsx)(m,{asChild:!0,children:(0,_.jsx)(g,{variant:`destructive`,children:`حذف المنتج`})}),(0,_.jsxs)(s,{children:[(0,_.jsxs)(f,{children:[(0,_.jsx)(c,{children:`حذف مصباح المكتب؟`}),(0,_.jsx)(i,{children:`لا يمكن التراجع عن هذا الإجراء.`})]}),(0,_.jsxs)(u,{children:[(0,_.jsx)(d,{children:`إلغاء`}),(0,_.jsx)(l,{variant:`destructive`,children:`حذف`})]})]})]})},O=[`Default`,`Small`,`WithMedia`,`RightToLeft`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Discard changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction>Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete 3 products</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete 3 products?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">حذف المنتج</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف مصباح المكتب؟</AlertDialogTitle>
          <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction variant="destructive">حذف</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
}`,...D.parameters?.docs?.source}}}})))()}k();export{w as Default,D as RightToLeft,T as Small,E as WithMedia,O as __namedExportsOrder,C as default};