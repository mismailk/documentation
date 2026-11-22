import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-Q1GcV6wX.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./dist-CxPeBc8N.js";import{r as o,t as s}from"./dist-CM1S9Oth.js";function c(e){return m.includes(e)}var l,u,d,f,p,m,h,g;function _(){return(_=t((()=>{l=e(n(),1),o(),u=r(),d=Object.defineProperty,f=(e,t)=>d(e,`name`,{value:t,configurable:!0}),p=`horizontal`,m=[`horizontal`,`vertical`],h=l.forwardRef(f(function(e,t){let{decorative:n,orientation:r=p,...i}=e,a=c(r)?r:p,o=n?{role:`none`}:{"aria-orientation":a===`vertical`?a:void 0,role:`separator`};return(0,u.jsx)(s.div,{"data-orientation":a,...o,...i,ref:t})},`Separator`)),f(c,`isValidOrientation`),g=h})))()}var v;function y(){return(y=t((()=>{v=`shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px`})))()}function b({className:e,orientation:t=`horizontal`,decorative:n=!0,...r}){return(0,x.jsx)(g,{"data-slot":`separator`,decorative:n,orientation:t,className:a(v,e),...r})}var x;function S(){return(S=t((()=>{i(),_(),y(),x=r(),b.__docgenInfo={description:``,methods:[],displayName:`Separator`,props:{orientation:{defaultValue:{value:`"horizontal"`,computed:!1},required:!1},decorative:{defaultValue:{value:`true`,computed:!1},required:!1}}}})))()}var C,w,T,E,D;function O(){return(O=t((()=>{S(),C=r(),w={title:`Components/Separator`,component:b,tags:[`autodocs`],argTypes:{orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`]}}},T={render:e=>(0,C.jsxs)(`div`,{className:`w-72`,children:[(0,C.jsx)(`p`,{className:`text-sm font-medium`,children:`Products`}),(0,C.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Manage your catalogue.`}),(0,C.jsx)(b,{...e,className:`my-4`}),(0,C.jsx)(`p`,{className:`text-sm`,children:`12 items`})]})},E={args:{orientation:`vertical`},render:e=>(0,C.jsxs)(`div`,{className:`flex h-5 items-center gap-4 text-sm`,children:[(0,C.jsx)(`span`,{children:`Products`}),(0,C.jsx)(b,{...e}),(0,C.jsx)(`span`,{children:`Orders`}),(0,C.jsx)(b,{...e}),(0,C.jsx)(`span`,{children:`Customers`})]})},D=[`Horizontal`,`Vertical`],T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-72">
      <p className="text-sm font-medium">Products</p>
      <p className="text-sm text-muted-foreground">Manage your catalogue.</p>
      <Separator {...args} className="my-4" />
      <p className="text-sm">12 items</p>
    </div>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical"
  },
  render: args => <div className="flex h-5 items-center gap-4 text-sm">
      <span>Products</span>
      <Separator {...args} />
      <span>Orders</span>
      <Separator {...args} />
      <span>Customers</span>
    </div>
}`,...E.parameters?.docs?.source}}}})))()}O();export{T as Horizontal,E as Vertical,D as __namedExportsOrder,w as default};