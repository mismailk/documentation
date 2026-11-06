import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,r as i,t as a}from"./FilePreview-BJcxzX0X.js";import{n as o,t as s}from"./Button-1OrWmIjO.js";function c({start:e}){let[t,n]=(0,l.useState)(g),[i,a]=(0,l.useState)(null);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(s,{onClick:()=>a(e),children:`Open preview`}),(0,u.jsx)(r,{items:t,index:i,onIndexChange:a,onRemove:e=>n(t=>t.filter((t,n)=>n!==e)),removeLabel:e=>`Remove ${e}`,labels:m})]})}var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{l=t(),o(),i(),u=n(),{expect:d,userEvent:f,within:p}=__STORYBOOK_MODULE_TEST__,m={show:e=>`Preview ${e}`,open:`Open file`,previous:`Previous file`,next:`Next file`,close:`Close preview`,counter:(e,t)=>`${e} of ${t}`},h=`data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`,g=[{name:`logo.png`,size:18432,type:`image/png`,url:h},{name:`contract.pdf`,size:1572864,type:`application/pdf`,url:`https://example.com/contract.pdf`},{name:`notes.txt`,size:420,type:`text/plain`},{name:`banner.png`,size:52e3,type:`image/png`,url:h}],_={title:`Components/FilePreview`,component:a,tags:[`autodocs`],args:{item:g[0],labels:m},decorators:[e=>(0,u.jsx)(`div`,{className:`w-96`,children:(0,u.jsx)(e,{})})]},v={},y={args:{item:g[1]}},b={args:{item:g[2]}},x={render:()=>(0,u.jsx)(c,{start:0}),play:async({canvasElement:e})=>{await f.click(p(e).getByRole(`button`,{name:`Open preview`}));let t=p(await p(document.body).findByRole(`dialog`));await d(t.getByRole(`heading`)).toHaveTextContent(`logo.png`),await d(t.getByText(`1 of 3`)).toBeInTheDocument(),await f.click(t.getByRole(`button`,{name:`Next file`})),await d(t.getByRole(`heading`)).toHaveTextContent(`contract.pdf`)}},S={globals:{direction:`rtl`},render:()=>(0,u.jsx)(c,{start:1})},C=[`Image`,`Document`,`WithoutLink`,`Dialog`,`RightToLeft`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    item: files[1]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    item: files[2]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <DialogDemo start={0} />,
  play: async ({
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: "Open preview"
    }));
    const dialog = within(await within(document.body).findByRole("dialog"));
    await expect(dialog.getByRole("heading")).toHaveTextContent("logo.png");
    await expect(dialog.getByText("1 of 3")).toBeInTheDocument();
    await userEvent.click(dialog.getByRole("button", {
      name: "Next file"
    }));
    await expect(dialog.getByRole("heading")).toHaveTextContent("contract.pdf");
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: () => <DialogDemo start={1} />
}`,...S.parameters?.docs?.source}}}})))()}w();export{x as Dialog,y as Document,v as Image,S as RightToLeft,b as WithoutLink,C as __namedExportsOrder,_ as default};