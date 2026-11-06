import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./createLucideIcon-D10cjYCo.js";import{c as a,i as o,l as s,n as c,o as l,r as u,s as d}from"./FilePreview-BJcxzX0X.js";import{n as f,t as p}from"./x-DPLMntrT.js";import{n as m,t as h}from"./dist-CxPeBc8N.js";import{n as g,t as _}from"./Label-Byk2VUkB.js";import{n as v,t as y}from"./Button-1OrWmIjO.js";var b,x;function S(){return(S=e((()=>{r(),b={name:`loader-circle`,size:24,node:[[`path`,{d:`M21 12a9 9 0 1 1-6.219-8.56`,key:`13zald`}]],aliases:[`loader-2`]},b.node,x=i(b)})))()}var C,w;function T(){return(T=e((()=>{r(),C={name:`upload`,size:24,node:[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]},C.node,w=i(C)})))()}var E;function D(){return(D=e((()=>{E={root:`grid gap-3`,drop:[`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-transparent px-4 py-6 text-center text-sm text-muted-foreground outline-none transition-colors`,`hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`,`data-[dragging=true]:border-primary data-[dragging=true]:bg-accent data-[dragging=true]:text-accent-foreground`,`data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40`,`disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5`],input:`sr-only`,rows:`grid gap-2`,row:`flex items-center gap-3 rounded-md border p-2 data-[status=error]:border-destructive`,thumb:`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-5`,image:`size-full object-cover`,spinner:`animate-spin`,meta:`grid min-w-0 flex-1 gap-0.5`,name:`truncate text-sm font-medium`,thumbButton:`flex size-full cursor-pointer items-center justify-center rounded-md outline-none`,nameButton:`cursor-pointer truncate rounded-sm text-start text-sm font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50`,size:`text-xs text-muted-foreground`,status:`text-xs text-muted-foreground`,error:`text-xs text-destructive`}})))()}function O({value:e,onFilesSelected:t,onRemove:n,onReject:r,multiple:i=!1,accept:s,maxSize:u,maxFiles:f,disabled:m=!1,readOnly:g=!1,id:_,onBlur:v,labels:b,className:S,"aria-invalid":C,"aria-describedby":T}){let[D,O]=(0,k.useState)(!1),[j,M]=(0,k.useState)(null),N=(0,k.useRef)(null),P=m||g;function F(n){if(P||!n||n.length===0)return;let{accepted:a,rejected:o}=d(Array.from(n),{accept:s,maxSize:u,maxFiles:f,multiple:i,existing:e.length});o.length>0&&r?.(o),a.length>0&&t(a)}function I(e){F(e.target.files),e.target.value=``}function L(e){e.preventDefault(),P||O(!0)}function R(e){e.currentTarget.contains(e.relatedTarget)||O(!1)}function z(e){e.preventDefault(),O(!1),F(e.dataTransfer?.files)}return(0,A.jsxs)(`div`,{"data-slot":`file-uploader`,className:h(E.root,S),children:[!g&&(0,A.jsxs)(`div`,{onDragOver:L,onDragLeave:R,onDrop:z,children:[(0,A.jsxs)(`button`,{type:`button`,id:_,className:h(...E.drop),"data-dragging":D,"data-invalid":C?`true`:void 0,"aria-invalid":C,disabled:m,"aria-describedby":T,onClick:()=>N.current?.click(),onBlur:v,children:[(0,A.jsx)(w,{"aria-hidden":`true`}),(0,A.jsx)(`span`,{children:D?b.dropHere:b.drop})]}),(0,A.jsx)(`input`,{ref:N,type:`file`,className:E.input,tabIndex:-1,"aria-hidden":`true`,multiple:i,accept:s,disabled:m,onChange:I})]}),e.length>0&&(0,A.jsx)(`ul`,{className:E.rows,children:e.map((e,t)=>{let r=o(e.size),i=b.preview!==void 0&&l(e.url),s=e.type.startsWith(`image/`)&&l(e.url)?(0,A.jsx)(`img`,{src:e.url,alt:``,className:E.image}):e.status===`uploading`?(0,A.jsx)(x,{className:E.spinner,"aria-hidden":`true`}):(0,A.jsx)(a,{"aria-hidden":`true`});return(0,A.jsxs)(`li`,{className:E.row,"data-status":e.status,children:[(0,A.jsx)(`div`,{className:E.thumb,children:i?(0,A.jsx)(`button`,{type:`button`,tabIndex:-1,"aria-hidden":`true`,className:E.thumbButton,onClick:()=>M(t),children:s}):s}),(0,A.jsxs)(`div`,{className:E.meta,children:[i&&b.preview?(0,A.jsx)(`button`,{type:`button`,className:E.nameButton,"aria-label":b.preview.show(e.name),onClick:()=>M(t),children:e.name}):(0,A.jsx)(`p`,{className:E.name,children:e.name}),r&&(0,A.jsx)(`p`,{className:E.size,children:r}),e.status===`uploading`&&(0,A.jsx)(`p`,{role:`status`,className:E.status,children:b.uploading}),e.status===`error`&&e.error&&(0,A.jsx)(`p`,{role:`alert`,className:E.error,children:e.error})]}),!P&&(0,A.jsx)(y,{type:`button`,variant:`ghost`,size:`icon-sm`,"aria-label":b.remove(e.name),onClick:()=>n(t),children:(0,A.jsx)(p,{})})]},t)})}),b.preview&&(0,A.jsx)(c,{items:e,index:j,onIndexChange:M,onRemove:P?void 0:n,removeLabel:b.remove,labels:b.preview})]})}var k,A;function j(){return(j=e((()=>{m(),s(),S(),T(),f(),k=t(),v(),u(),D(),A=n(),O.__docgenInfo={description:``,methods:[],displayName:`FileUploader`,props:{value:{required:!0,tsType:{name:`Array`,elements:[{name:`FileItem`}],raw:`FileItem[]`},description:`The files to list.`},multiple:{required:!1,tsType:{name:`boolean`},description:`Several files (they are added) or one (picking replaces it). Default false.`,defaultValue:{value:`false`,computed:!1}},accept:{required:!1,tsType:{name:`string`},description:"The `<input accept>` syntax: `image/*`, `.pdf,application/pdf`. Checked again on drop."},maxSize:{required:!1,tsType:{name:`number`},description:`Bytes per file.`},maxFiles:{required:!1,tsType:{name:`number`},description:"Most files in total, counting those already in `value`. Ignored in single mode."},disabled:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},readOnly:{required:!1,tsType:{name:`boolean`},description:`Lists the files with no drop area and no remove buttons.`,defaultValue:{value:`false`,computed:!1}},id:{required:!1,tsType:{name:`string`},description:"Goes on the drop area's button, so a `<Label htmlFor>` names it."},"aria-invalid":{required:!1,tsType:{name:`boolean`},description:``},"aria-describedby":{required:!1,tsType:{name:`string`},description:``},labels:{required:!0,tsType:{name:`FileUploaderLabels`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})))()}function M({value:e,multiple:t,onFilesSelected:n,onRemove:r,...i}){let[a,o]=(0,P.useState)(e),s=(0,P.useRef)([]);(0,P.useEffect)(()=>()=>s.current.forEach(e=>window.clearTimeout(e)),[]);function c(e){n(e);let r=e.map(e=>({name:e.name,size:e.size,type:e.type,status:`uploading`}));o(e=>t?[...e,...r]:r),e.forEach(e=>{s.current.push(window.setTimeout(()=>{o(t=>t.map(t=>t.name!==e.name||t.status!==`uploading`?t:e.name.startsWith(`bad-`)?{...t,status:`error`,error:`Upload failed. Try again.`}:{...t,status:`done`,url:URL.createObjectURL(e)}))},600))})}return(0,F.jsx)(O,{...i,multiple:t,value:a,onFilesSelected:c,onRemove:e=>{r(e),o(t=>t.filter((t,n)=>n!==e))}})}function N({accept:e,maxSize:t}){let[n,r]=(0,P.useState)([]);return(0,F.jsxs)(`div`,{className:`grid gap-2`,children:[(0,F.jsx)(M,{value:[],labels:z,multiple:!0,accept:e,maxSize:t,onFilesSelected:()=>{},onRemove:()=>{},onReject:r}),n.length>0&&(0,F.jsx)(`ul`,{className:`grid gap-1 text-sm text-destructive`,children:n.map((e,t)=>(0,F.jsx)(`li`,{children:`${e.file.name} ${G[e.reason]}`},`${e.file.name}-${t}`))})]})}var P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{P=t(),j(),g(),F=n(),{expect:I,userEvent:L,within:R}=__STORYBOOK_MODULE_TEST__,z={drop:`Drag files here, or click to browse`,dropHere:`Drop the files to add them`,uploading:`Uploading…`,remove:e=>`Remove ${e}`,preview:{show:e=>`Preview ${e}`,open:`Open file`,previous:`Previous file`,next:`Next file`,close:`Close preview`,counter:(e,t)=>`${e} of ${t}`}},B={title:`Components/FileUploader`,component:O,tags:[`autodocs`],args:{value:[],labels:z,onFilesSelected:()=>{},onRemove:()=>{}},render:e=>(0,F.jsx)(M,{...e}),decorators:[e=>(0,F.jsx)(`div`,{className:`w-96`,children:(0,F.jsx)(e,{})})]},V=e=>e.querySelector(`input[type="file"]`),H={args:{id:`single`},play:async({canvasElement:e})=>{let t=R(e);await L.upload(V(e),new File([`hello`],`notes.txt`,{type:`text/plain`})),await I(t.getByText(`notes.txt`)).toBeInTheDocument(),await I(await t.findByRole(`button`,{name:`Remove notes.txt`})).toBeInTheDocument()}},U={args:{id:`multiple`,multiple:!0,maxFiles:4},play:async({canvasElement:e})=>{let t=R(e);await L.upload(V(e),[new File([`a`],`a.txt`,{type:`text/plain`}),new File([`b`],`b.txt`,{type:`text/plain`})]),await I(t.getByText(`a.txt`)).toBeInTheDocument(),await I(t.getByText(`b.txt`)).toBeInTheDocument()}},W={args:{id:`images`,multiple:!0,accept:`image/*`,maxSize:2097152}},G={type:`is not an accepted type`,size:`is too large`,count:`is one file too many`},K={render:()=>(0,F.jsx)(N,{accept:`image/*`,maxSize:2097152}),play:async({canvasElement:e})=>{let t=R(e);await L.upload(V(e),[new File([`notes`],`notes.txt`,{type:`text/plain`}),new File([new Uint8Array(3145728)],`big.png`,{type:`image/png`})],{applyAccept:!1}),await I(t.getByText(`notes.txt is not an accepted type`)).toBeInTheDocument(),await I(t.getByText(`big.png is too large`)).toBeInTheDocument()}},q={args:{id:`with-files`,multiple:!0,value:[{name:`logo.png`,size:18432,type:`image/png`,url:`data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`,status:`done`},{name:`contract.pdf`,size:1572864,type:`application/pdf`,url:`https://example.com/contract.pdf`,status:`done`},{name:`report.xlsx`,size:3145728,type:`application/octet-stream`,status:`uploading`},{name:`broken.zip`,size:9e5,type:`application/zip`,status:`error`,error:`Upload failed. Try again.`}]},play:async({canvasElement:e})=>{let t=R(e);await L.click(t.getByRole(`button`,{name:`Preview contract.pdf`}));let n=R(await R(document.body).findByRole(`dialog`));await I(n.getByRole(`link`,{name:`Open file`})).toBeInTheDocument(),await L.click(n.getByRole(`button`,{name:`Remove contract.pdf`})),await I(t.queryByText(`contract.pdf`)).not.toBeInTheDocument()}},J={render:e=>(0,F.jsxs)(`div`,{className:`grid gap-2`,children:[(0,F.jsx)(_,{htmlFor:`invalid`,children:`Attachment`}),(0,F.jsx)(M,{...e,id:`invalid`,"aria-invalid":!0,"aria-describedby":`invalid-error`}),(0,F.jsx)(`p`,{id:`invalid-error`,className:`text-sm text-destructive`,children:`This field is required`})]})},Y={args:{id:`disabled`,disabled:!0,value:[{name:`logo.png`,size:18432,type:`image/png`,status:`done`}]}},X={args:{readOnly:!0,value:[{name:`logo.png`,size:18432,type:`image/png`,status:`done`},{name:`contract.pdf`,size:1572864,type:`application/pdf`,status:`done`}]}},Z={globals:{direction:`rtl`},args:{id:`rtl`,multiple:!0,labels:{drop:`اسحب الملفات إلى هنا أو انقر للتصفح`,dropHere:`أفلت الملفات لإضافتها`,uploading:`جارٍ الرفع…`,remove:e=>`إزالة ${e}`,preview:{show:e=>`معاينة ${e}`,open:`فتح الملف`,previous:`الملف السابق`,next:`الملف التالي`,close:`إغلاق المعاينة`,counter:(e,t)=>`${e} من ${t}`}},value:[{name:`عقد.pdf`,size:1572864,type:`application/pdf`,status:`done`}]}},Q=[`Single`,`Multiple`,`ImagesOnly`,`Rejected`,`WithFiles`,`Invalid`,`Disabled`,`ReadOnly`,`RightToLeft`],H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    id: "single"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(input(canvasElement), new File(["hello"], "notes.txt", {
      type: "text/plain"
    }));
    await expect(canvas.getByText("notes.txt")).toBeInTheDocument();
    await expect(await canvas.findByRole("button", {
      name: "Remove notes.txt"
    })).toBeInTheDocument();
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    id: "multiple",
    multiple: true,
    maxFiles: 4
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(input(canvasElement), [new File(["a"], "a.txt", {
      type: "text/plain"
    }), new File(["b"], "b.txt", {
      type: "text/plain"
    })]);
    await expect(canvas.getByText("a.txt")).toBeInTheDocument();
    await expect(canvas.getByText("b.txt")).toBeInTheDocument();
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    id: "images",
    multiple: true,
    accept: "image/*",
    maxSize: 2 * 1024 * 1024
  }
}`,...W.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <RejectionDemo accept="image/*" maxSize={2 * 1024 * 1024} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(input(canvasElement), [new File(["notes"], "notes.txt", {
      type: "text/plain"
    }), new File([new Uint8Array(3 * 1024 * 1024)], "big.png", {
      type: "image/png"
    })],
    // The input's \`accept\` would hide the text file from the browser; the drop path and \`onReject\` are what is shown here.
    {
      applyAccept: false
    });
    await expect(canvas.getByText("notes.txt is not an accepted type")).toBeInTheDocument();
    await expect(canvas.getByText("big.png is too large")).toBeInTheDocument();
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    id: "with-files",
    multiple: true,
    value: [{
      name: "logo.png",
      size: 18_432,
      type: "image/png",
      url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      status: "done"
    }, {
      name: "contract.pdf",
      size: 1_572_864,
      type: "application/pdf",
      url: "https://example.com/contract.pdf",
      status: "done"
    }, {
      name: "report.xlsx",
      size: 3_145_728,
      type: "application/octet-stream",
      status: "uploading"
    }, {
      name: "broken.zip",
      size: 900_000,
      type: "application/zip",
      status: "error",
      error: "Upload failed. Try again."
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Preview contract.pdf"
    }));
    const dialog = within(await within(document.body).findByRole("dialog"));
    await expect(dialog.getByRole("link", {
      name: "Open file"
    })).toBeInTheDocument();
    await userEvent.click(dialog.getByRole("button", {
      name: "Remove contract.pdf"
    }));
    await expect(canvas.queryByText("contract.pdf")).not.toBeInTheDocument();
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="invalid">Attachment</Label>
      <Demo {...args} id="invalid" aria-invalid aria-describedby="invalid-error" />
      <p id="invalid-error" className="text-sm text-destructive">
        This field is required
      </p>
    </div>
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    id: "disabled",
    disabled: true,
    value: [{
      name: "logo.png",
      size: 18_432,
      type: "image/png",
      status: "done"
    }]
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    readOnly: true,
    value: [{
      name: "logo.png",
      size: 18_432,
      type: "image/png",
      status: "done"
    }, {
      name: "contract.pdf",
      size: 1_572_864,
      type: "application/pdf",
      status: "done"
    }]
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  args: {
    id: "rtl",
    multiple: true,
    labels: {
      drop: "اسحب الملفات إلى هنا أو انقر للتصفح",
      dropHere: "أفلت الملفات لإضافتها",
      uploading: "جارٍ الرفع…",
      remove: (name: string) => \`إزالة \${name}\`,
      preview: {
        show: (name: string) => \`معاينة \${name}\`,
        open: "فتح الملف",
        previous: "الملف السابق",
        next: "الملف التالي",
        close: "إغلاق المعاينة",
        counter: (position: number, total: number) => \`\${position} من \${total}\`
      }
    },
    value: [{
      name: "عقد.pdf",
      size: 1_572_864,
      type: "application/pdf",
      status: "done"
    }]
  }
}`,...Z.parameters?.docs?.source}}}})))()}$();export{Y as Disabled,W as ImagesOnly,J as Invalid,U as Multiple,X as ReadOnly,K as Rejected,Z as RightToLeft,H as Single,q as WithFiles,Q as __namedExportsOrder,B as default};