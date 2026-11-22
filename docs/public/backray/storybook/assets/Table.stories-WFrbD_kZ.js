import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./dist-CxPeBc8N.js";import{n as i,t as a}from"./Checkbox-CWmrAGDd.js";import{n as o,t as s}from"./Badge-BtoKhDxC.js";var c;function l(){return(l=e((()=>{c={container:`relative w-full overflow-x-auto`,table:`w-full caption-bottom text-sm`,header:`[&_tr]:border-b`,body:`[&_tr:last-child]:border-0`,footer:`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0`,row:`border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted`,head:`h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]`,cell:`p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]`,caption:`mt-4 text-sm text-muted-foreground`}})))()}function u({className:e,...t}){return(0,_.jsx)(`div`,{"data-slot":`table-container`,className:c.container,children:(0,_.jsx)(`table`,{"data-slot":`table`,className:r(c.table,e),...t})})}function d({className:e,...t}){return(0,_.jsx)(`thead`,{"data-slot":`table-header`,className:r(c.header,e),...t})}function f({className:e,...t}){return(0,_.jsx)(`tbody`,{"data-slot":`table-body`,className:r(c.body,e),...t})}function p({className:e,...t}){return(0,_.jsx)(`tr`,{"data-slot":`table-row`,className:r(c.row,e),...t})}function m({className:e,...t}){return(0,_.jsx)(`th`,{"data-slot":`table-head`,className:r(c.head,e),...t})}function h({className:e,...t}){return(0,_.jsx)(`td`,{"data-slot":`table-cell`,className:r(c.cell,e),...t})}function g({className:e,...t}){return(0,_.jsx)(`caption`,{"data-slot":`table-caption`,className:r(c.caption,e),...t})}var _;function v(){return(v=e((()=>{n(),l(),_=t(),u.__docgenInfo={description:``,methods:[],displayName:`Table`},d.__docgenInfo={description:``,methods:[],displayName:`TableHeader`},f.__docgenInfo={description:``,methods:[],displayName:`TableBody`},p.__docgenInfo={description:``,methods:[],displayName:`TableRow`},m.__docgenInfo={description:``,methods:[],displayName:`TableHead`},h.__docgenInfo={description:``,methods:[],displayName:`TableCell`},g.__docgenInfo={description:``,methods:[],displayName:`TableCaption`}})))()}var y,b,x,S,C,w,T;function E(){return(E=e((()=>{o(),i(),v(),y=t(),b=[{name:`Desk lamp`,sku:`LGT-1001`,stock:24,status:`Active`},{name:`Office chair`,sku:`FUR-1002`,stock:3,status:`Active`},{name:`Bookshelf`,sku:`FUR-1003`,stock:0,status:`Archived`}],x={title:`Components/Table`,component:u,tags:[`autodocs`],subcomponents:{TableHeader:d,TableBody:f,TableRow:p,TableHead:m,TableCell:h,TableCaption:g}},S={render:e=>(0,y.jsx)(`div`,{className:`w-[36rem]`,children:(0,y.jsxs)(u,{...e,children:[(0,y.jsx)(g,{children:`Products in stock`}),(0,y.jsx)(d,{children:(0,y.jsxs)(p,{children:[(0,y.jsx)(m,{children:`Name`}),(0,y.jsx)(m,{children:`SKU`}),(0,y.jsx)(m,{className:`text-end`,children:`Stock`}),(0,y.jsx)(m,{children:`Status`})]})}),(0,y.jsx)(f,{children:b.map(e=>(0,y.jsxs)(p,{children:[(0,y.jsx)(h,{children:e.name}),(0,y.jsx)(h,{children:e.sku}),(0,y.jsx)(h,{className:`text-end tabular-nums`,children:e.stock}),(0,y.jsx)(h,{children:(0,y.jsx)(s,{variant:e.status===`Active`?`primary`:`outline`,children:e.status})})]},e.sku))})]})})},C={render:e=>(0,y.jsx)(`div`,{className:`w-[32rem]`,children:(0,y.jsxs)(u,{...e,children:[(0,y.jsx)(d,{children:(0,y.jsxs)(p,{children:[(0,y.jsx)(m,{children:(0,y.jsx)(a,{"aria-label":`Select all`,checked:`indeterminate`})}),(0,y.jsx)(m,{children:`Name`}),(0,y.jsx)(m,{className:`text-end`,children:`Stock`})]})}),(0,y.jsx)(f,{children:b.map((e,t)=>(0,y.jsxs)(p,{"data-state":t===0?`selected`:void 0,children:[(0,y.jsx)(h,{children:(0,y.jsx)(a,{"aria-label":`Select ${e.name}`,checked:t===0})}),(0,y.jsx)(h,{children:e.name}),(0,y.jsx)(h,{className:`text-end tabular-nums`,children:e.stock})]},e.sku))})]})})},w={globals:{direction:`rtl`},render:e=>(0,y.jsx)(`div`,{className:`w-[32rem]`,children:(0,y.jsxs)(u,{...e,children:[(0,y.jsx)(g,{children:`المنتجات المتوفرة`}),(0,y.jsx)(d,{children:(0,y.jsxs)(p,{children:[(0,y.jsx)(m,{children:`الاسم`}),(0,y.jsx)(m,{className:`text-end`,children:`المخزون`})]})}),(0,y.jsxs)(f,{children:[(0,y.jsxs)(p,{children:[(0,y.jsx)(h,{children:`مصباح مكتب`}),(0,y.jsx)(h,{className:`text-end tabular-nums`,children:`24`})]}),(0,y.jsxs)(p,{children:[(0,y.jsx)(h,{children:`كرسي مكتب`}),(0,y.jsx)(h,{className:`text-end tabular-nums`,children:`3`})]})]})]})})},T=[`Default`,`WithSelection`,`RightToLeft`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-[36rem]">
      <Table {...args}>
        <TableCaption>Products in stock</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-end">Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(p => <TableRow key={p.sku}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.sku}</TableCell>
              <TableCell className="text-end tabular-nums">{p.stock}</TableCell>
              <TableCell>
                <Badge variant={p.status === "Active" ? "primary" : "outline"}>{p.status}</Badge>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-[32rem]">
      <Table {...args}>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox aria-label="Select all" checked="indeterminate" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-end">Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p, i) => <TableRow key={p.sku} data-state={i === 0 ? "selected" : undefined}>
              <TableCell>
                <Checkbox aria-label={\`Select \${p.name}\`} checked={i === 0} />
              </TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell className="text-end tabular-nums">{p.stock}</TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <div className="w-[32rem]">
      <Table {...args}>
        <TableCaption>المنتجات المتوفرة</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead className="text-end">المخزون</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>مصباح مكتب</TableCell>
            <TableCell className="text-end tabular-nums">24</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>كرسي مكتب</TableCell>
            <TableCell className="text-end tabular-nums">3</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
}`,...w.parameters?.docs?.source}}}})))()}E();export{S as Default,w as RightToLeft,C as WithSelection,T as __namedExportsOrder,x as default};