import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./ellipsis-BF66DF-e.js";import{n as i,t as a}from"./dist-CxPeBc8N.js";import{n as o,t as s}from"./Button-1OrWmIjO.js";var c;function l(){return(l=e((()=>{c={root:`flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm`,header:`@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6`,title:`leading-none font-semibold`,description:`text-sm text-muted-foreground`,action:`col-start-2 row-span-2 row-start-1 self-start justify-self-end`,content:`px-6`,footer:`flex items-center px-6 [.border-t]:pt-6`}})))()}function u({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`card`,className:a(c.root,e),...t})}function d({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`card-header`,className:a(c.header,e),...t})}function f({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`card-title`,className:a(c.title,e),...t})}function p({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`card-description`,className:a(c.description,e),...t})}function m({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`card-action`,className:a(c.action,e),...t})}function h({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`card-content`,className:a(c.content,e),...t})}function g({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`card-footer`,className:a(c.footer,e),...t})}var _;function v(){return(v=e((()=>{i(),l(),_=t(),u.__docgenInfo={description:``,methods:[],displayName:`Card`},d.__docgenInfo={description:``,methods:[],displayName:`CardHeader`},f.__docgenInfo={description:``,methods:[],displayName:`CardTitle`},p.__docgenInfo={description:``,methods:[],displayName:`CardDescription`},m.__docgenInfo={description:``,methods:[],displayName:`CardAction`},h.__docgenInfo={description:``,methods:[],displayName:`CardContent`},g.__docgenInfo={description:``,methods:[],displayName:`CardFooter`}})))()}function y(e){return(0,b.jsxs)(u,{...e,className:`w-80`,children:[(0,b.jsxs)(d,{children:[(0,b.jsx)(f,{children:`Desk lamp`}),(0,b.jsx)(p,{children:`Updated 2 hours ago`}),(0,b.jsx)(m,{children:(0,b.jsx)(s,{variant:`ghost`,size:`icon-sm`,"aria-label":`More actions`,children:(0,b.jsx)(r,{})})})]}),(0,b.jsx)(h,{children:(0,b.jsx)(`p`,{className:`text-sm`,children:`24 units across 2 warehouses.`})}),(0,b.jsxs)(g,{className:`gap-2`,children:[(0,b.jsx)(s,{size:`sm`,children:`Edit`}),(0,b.jsx)(s,{size:`sm`,variant:`outline`,children:`Archive`})]})]})}var b,x,S,C,w,T,E;function D(){return(D=e((()=>{n(),o(),v(),b=t(),x={title:`Components/Card`,component:u,tags:[`autodocs`],subcomponents:{CardHeader:d,CardTitle:f,CardDescription:p,CardAction:m,CardContent:h,CardFooter:g}},S={render:e=>(0,b.jsx)(y,{...e})},C={render:e=>(0,b.jsxs)(u,{...e,className:`w-56 gap-2 py-4`,children:[(0,b.jsx)(d,{className:`px-4`,children:(0,b.jsx)(p,{children:`Products`})}),(0,b.jsx)(h,{className:`px-4`,children:(0,b.jsx)(`p`,{className:`text-2xl font-semibold tabular-nums`,children:`128`})})]})},w={globals:{theme:`dark`},render:e=>(0,b.jsx)(y,{...e})},T={globals:{direction:`rtl`},render:e=>(0,b.jsxs)(u,{...e,className:`w-80`,children:[(0,b.jsxs)(d,{children:[(0,b.jsx)(f,{children:`مصباح مكتب`}),(0,b.jsx)(p,{children:`تم التحديث قبل ساعتين`}),(0,b.jsx)(m,{children:(0,b.jsx)(s,{variant:`ghost`,size:`icon-sm`,"aria-label":`إجراءات أخرى`,children:(0,b.jsx)(r,{})})})]}),(0,b.jsx)(h,{children:(0,b.jsx)(`p`,{className:`text-sm`,children:`24 وحدة في مستودعين.`})})]})},E=[`Default`,`Stat`,`Dark`,`RightToLeft`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => <ProductCard {...args} />
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => <Card {...args} className="w-56 gap-2 py-4">
      <CardHeader className="px-4">
        <CardDescription>Products</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-2xl font-semibold tabular-nums">128</p>
      </CardContent>
    </Card>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  globals: {
    theme: "dark"
  },
  render: args => <ProductCard {...args} />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>مصباح مكتب</CardTitle>
        <CardDescription>تم التحديث قبل ساعتين</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="إجراءات أخرى">
            <Ellipsis />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">24 وحدة في مستودعين.</p>
      </CardContent>
    </Card>
}`,...T.parameters?.docs?.source}}}})))()}D();export{w as Dark,S as Default,T as RightToLeft,C as Stat,E as __namedExportsOrder,x as default};