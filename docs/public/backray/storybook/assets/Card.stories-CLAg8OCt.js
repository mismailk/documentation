import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./ellipsis-BF66DF-e.js";import{n as i,t as a}from"./dist-CxPeBc8N.js";import{r as o,t as s}from"./dist-B7205YNF.js";import{n as c,t as l}from"./Button-1OrWmIjO.js";var u;function d(){return(d=e((()=>{u={root:`flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm`,header:`@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6`,title:`leading-none font-semibold`,description:`text-sm text-muted-foreground`,action:`col-start-2 row-span-2 row-start-1 self-start justify-self-end`,content:`px-6`,footer:`flex items-center px-6 [.border-t]:pt-6`}})))()}function f({className:e,...t}){return(0,y.jsx)(`div`,{"data-slot":`card`,className:a(u.root,e),...t})}function p({className:e,...t}){return(0,y.jsx)(`div`,{"data-slot":`card-header`,className:a(u.header,e),...t})}function m({className:e,asChild:t=!1,...n}){let r=t?s:`div`;return(0,y.jsx)(r,{"data-slot":`card-title`,className:a(u.title,e),...n})}function h({className:e,...t}){return(0,y.jsx)(`div`,{"data-slot":`card-description`,className:a(u.description,e),...t})}function g({className:e,...t}){return(0,y.jsx)(`div`,{"data-slot":`card-action`,className:a(u.action,e),...t})}function _({className:e,...t}){return(0,y.jsx)(`div`,{"data-slot":`card-content`,className:a(u.content,e),...t})}function v({className:e,...t}){return(0,y.jsx)(`div`,{"data-slot":`card-footer`,className:a(u.footer,e),...t})}var y;function b(){return(b=e((()=>{i(),o(),d(),y=t(),f.__docgenInfo={description:``,methods:[],displayName:`Card`},p.__docgenInfo={description:``,methods:[],displayName:`CardHeader`},m.__docgenInfo={description:``,methods:[],displayName:`CardTitle`,props:{asChild:{required:!1,tsType:{name:`boolean`},description:"Render the child element (e.g. a heading) with the title's styling instead of a `<div>`.",defaultValue:{value:`false`,computed:!1}}}},h.__docgenInfo={description:``,methods:[],displayName:`CardDescription`},g.__docgenInfo={description:``,methods:[],displayName:`CardAction`},_.__docgenInfo={description:``,methods:[],displayName:`CardContent`},v.__docgenInfo={description:``,methods:[],displayName:`CardFooter`}})))()}function x(e){return(0,S.jsxs)(f,{...e,className:`w-80`,children:[(0,S.jsxs)(p,{children:[(0,S.jsx)(m,{asChild:!0,children:(0,S.jsx)(`h3`,{children:`Desk lamp`})}),(0,S.jsx)(h,{children:`Updated 2 hours ago`}),(0,S.jsx)(g,{children:(0,S.jsx)(l,{variant:`ghost`,size:`icon-sm`,"aria-label":`More actions`,children:(0,S.jsx)(r,{})})})]}),(0,S.jsx)(_,{children:(0,S.jsx)(`p`,{className:`text-sm`,children:`24 units across 2 warehouses.`})}),(0,S.jsxs)(v,{className:`gap-2`,children:[(0,S.jsx)(l,{size:`sm`,children:`Edit`}),(0,S.jsx)(l,{size:`sm`,variant:`outline`,children:`Archive`})]})]})}var S,C,w,T,E,D,O;function k(){return(k=e((()=>{n(),c(),b(),S=t(),C={title:`Components/Card`,component:f,tags:[`autodocs`],subcomponents:{CardHeader:p,CardTitle:m,CardDescription:h,CardAction:g,CardContent:_,CardFooter:v},parameters:{docs:{description:{component:"A card's parts. Pass `asChild` to `CardTitle` to render a heading with the title's style instead of a `<div>`: `<CardTitle asChild><h3>Desk lamp</h3></CardTitle>`."}}}},w={render:e=>(0,S.jsx)(x,{...e})},T={render:e=>(0,S.jsxs)(f,{...e,className:`w-56 gap-2 py-4`,children:[(0,S.jsx)(p,{className:`px-4`,children:(0,S.jsx)(h,{children:`Products`})}),(0,S.jsx)(_,{className:`px-4`,children:(0,S.jsx)(`p`,{className:`text-2xl font-semibold tabular-nums`,children:`128`})})]})},E={globals:{theme:`dark`},render:e=>(0,S.jsx)(x,{...e})},D={globals:{direction:`rtl`},render:e=>(0,S.jsxs)(f,{...e,className:`w-80`,children:[(0,S.jsxs)(p,{children:[(0,S.jsx)(m,{children:`مصباح مكتب`}),(0,S.jsx)(h,{children:`تم التحديث قبل ساعتين`}),(0,S.jsx)(g,{children:(0,S.jsx)(l,{variant:`ghost`,size:`icon-sm`,"aria-label":`إجراءات أخرى`,children:(0,S.jsx)(r,{})})})]}),(0,S.jsx)(_,{children:(0,S.jsx)(`p`,{className:`text-sm`,children:`24 وحدة في مستودعين.`})})]})},O=[`Default`,`Stat`,`Dark`,`RightToLeft`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => <ProductCard {...args} />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => <Card {...args} className="w-56 gap-2 py-4">
      <CardHeader className="px-4">
        <CardDescription>Products</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-2xl font-semibold tabular-nums">128</p>
      </CardContent>
    </Card>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  globals: {
    theme: "dark"
  },
  render: args => <ProductCard {...args} />
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}}})))()}k();export{E as Dark,w as Default,D as RightToLeft,T as Stat,O as __namedExportsOrder,C as default};