import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-Q1GcV6wX.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./x-DPLMntrT.js";import{n as a,t as o}from"./dist-CxPeBc8N.js";import{n as s,t as c}from"./Label-Byk2VUkB.js";import{n as l,t as u}from"./Badge-BtoKhDxC.js";var d;function f(){return(f=e((()=>{d={root:[`relative flex min-h-9 w-full min-w-0 flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 text-base shadow-xs transition-[color,box-shadow] md:text-sm dark:bg-input/30`,`focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50`,`data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/20 dark:data-[invalid=true]:ring-destructive/40`,`data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50`],chip:`max-w-full`,remove:`[&_svg:not([class*='size-'])]:size-3 -me-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none`,input:`min-w-16 flex-1 bg-transparent py-0.5 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm`,list:`absolute inset-x-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md`,option:`cursor-default rounded-sm px-2 py-1.5 text-sm outline-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground`}})))()}function p(e,t){let n=[...e],r=new Set(n.map(e=>e.toLocaleLowerCase()));for(let e of t.split(/[,\r\n]+/)){let t=e.trim();t&&!r.has(t.toLocaleLowerCase())&&(r.add(t.toLocaleLowerCase()),n.push(t))}return n}function m({value:e,onChange:t,onBlur:n,id:r,placeholder:a,disabled:s,removeLabel:c,tone:l,suggestions:f,suggestionsLabel:m,className:v,"aria-invalid":y,"aria-describedby":b}){let[x,S]=(0,h.useState)(``),[C,w]=(0,h.useState)(!1),[T,E]=(0,h.useState)(-1),D=(0,h.useRef)(null),O=(0,h.useId)(),k=(0,h.useMemo)(()=>{if(!f)return[];let t=new Set(e.map(_)),n=_(x.trim());return f.filter(e=>!t.has(_(e))&&_(e).startsWith(n))},[f,e,x]),A=C&&k.length>0,j=e=>`${O}-${e}`,M=A&&T>=0&&T<k.length?j(T):void 0;function N(){w(!1),E(-1)}(0,h.useEffect)(()=>{if(!A)return;function e(e){e.key===`Escape`&&(e.preventDefault(),e.stopPropagation(),w(!1),E(-1))}return window.addEventListener(`keydown`,e,!0),()=>window.removeEventListener(`keydown`,e,!0)},[A]);function P(n){let r=p(e,n);r.length!==e.length&&t(r),S(``),N()}function F(e){let t=e.target.value;if(t.includes(`,`)){P(t);return}S(t),w(!0),E(-1)}function I(n){if((n.key===`ArrowDown`||n.key===`ArrowUp`)&&k.length>0){n.preventDefault();let e=k.length;w(!0),E(t=>n.key===`ArrowDown`?A?(t+1)%e:0:A?t<=0?e-1:t-1:e-1)}else n.key===`Enter`?A&&M!==void 0?(n.preventDefault(),P(k[T])):x!==``&&(n.preventDefault(),P(x)):n.key===`Backspace`&&x===``&&e.length>0&&t(e.slice(0,-1))}function L(e){let t=e.clipboardData.getData(`text`);/[,\r\n]/.test(t)&&(e.preventDefault(),P(x+t))}function R(){x!==``&&P(x),N(),n?.()}function z(n){t(e.filter(e=>e!==n)),D.current?.focus()}return(0,g.jsxs)(`div`,{"data-slot":`tag-input`,"data-invalid":y||void 0,"data-disabled":s||void 0,className:o(...d.root,v),onClick:()=>D.current?.focus(),children:[e.map(e=>(0,g.jsxs)(u,{variant:l?.(e)??`secondary`,className:d.chip,children:[(0,g.jsx)(`span`,{className:`truncate`,children:e}),(0,g.jsx)(`button`,{type:`button`,disabled:s,"aria-label":c(e),className:d.remove,onClick:()=>z(e),children:(0,g.jsx)(i,{})})]},e)),(0,g.jsx)(`input`,{ref:D,id:r,type:`text`,role:f?`combobox`:void 0,"aria-expanded":f?A:void 0,"aria-controls":A?O:void 0,"aria-autocomplete":f?`list`:void 0,"aria-activedescendant":M,value:x,disabled:s,placeholder:e.length===0?a:void 0,"aria-invalid":y,"aria-describedby":b,className:d.input,onChange:F,onKeyDown:I,onPaste:L,onBlur:R}),A&&(0,g.jsx)(`ul`,{id:O,role:`listbox`,"aria-label":m,className:d.list,children:k.map((e,t)=>(0,g.jsx)(`li`,{id:j(t),role:`option`,"aria-selected":t===T,"data-active":t===T,className:d.option,onMouseDown:e=>e.preventDefault(),onClick:()=>P(e),children:e},e))})]})}var h,g,_;function v(){return(v=e((()=>{a(),r(),h=t(),l(),f(),g=n(),_=e=>e.toLocaleLowerCase(),m.__docgenInfo={description:``,methods:[],displayName:`TagInput`,props:{value:{required:!0,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:``},id:{required:!1,tsType:{name:`string`},description:"Goes on the text input, so a `<Label htmlFor>` names it."},placeholder:{required:!1,tsType:{name:`string`},description:`Shown only while there are no tags.`},disabled:{required:!1,tsType:{name:`boolean`},description:``},"aria-invalid":{required:!1,tsType:{name:`boolean`},description:``},"aria-describedby":{required:!1,tsType:{name:`string`},description:``},suggestions:{required:!1,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:`Tags to offer while typing. The input becomes an ARIA combobox. Free text is still allowed.`},suggestionsLabel:{required:!1,tsType:{name:`string`},description:"The accessible name of the suggestion list. Required whenever `suggestions` is given."},className:{required:!1,tsType:{name:`string`},description:``}}}})))()}function y({value:e,onChange:t,...n}){let[r,i]=(0,b.useState)(e);return(0,x.jsx)(m,{...n,value:r,onChange:e=>{i(e),t(e)}})}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{b=t(),s(),v(),x=n(),{expect:S,userEvent:C,within:w}=__STORYBOOK_MODULE_TEST__,T={title:`Components/TagInput`,component:m,tags:[`autodocs`],args:{value:[`lighting`,`wireless`],onChange:()=>{},placeholder:`Add a tag`,removeLabel:e=>`Remove ${e}`},render:e=>(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(c,{htmlFor:e.id,className:`sr-only`,children:`Tags`}),(0,x.jsx)(y,{...e})]}),decorators:[e=>(0,x.jsx)(`div`,{className:`w-80`,children:(0,x.jsx)(e,{})})]},E={args:{id:`tags-default`},play:async({canvasElement:e})=>{let t=w(e);await C.type(t.getByRole(`textbox`),`gift,new{Enter}`),await S(t.getByText(`gift`)).toBeInTheDocument(),await S(t.getByText(`new`)).toBeInTheDocument()}},D={render:e=>(0,x.jsxs)(`div`,{className:`grid gap-2`,children:[(0,x.jsx)(c,{htmlFor:`keywords`,children:`Keywords`}),(0,x.jsx)(y,{...e,id:`keywords`})]}),play:async({canvasElement:e})=>{let t=w(e);await C.click(t.getByRole(`button`,{name:`Remove lighting`})),await S(t.queryByText(`lighting`)).not.toBeInTheDocument(),await S(t.getByLabelText(`Keywords`)).toHaveFocus()}},O={new:`primary`,sale:`outline`,discontinued:`destructive`},k={args:{id:`tags-tones`,value:[`new`,`sale`,`discontinued`,`plain`],tone:e=>O[e]??`secondary`}},A={args:{id:`tags-empty`,value:[]}},j={args:{id:`tags-disabled`,disabled:!0},parameters:{a11y:{config:{rules:[{id:`color-contrast`,enabled:!1}]}}}},M={render:e=>(0,x.jsxs)(`div`,{className:`grid gap-2`,children:[(0,x.jsx)(c,{htmlFor:`tags-invalid`,children:`Keywords`}),(0,x.jsx)(y,{...e,id:`tags-invalid`,"aria-invalid":!0,"aria-describedby":`tags-invalid-error`}),(0,x.jsx)(`p`,{id:`tags-invalid-error`,className:`text-sm text-destructive`,children:`Add at most five keywords.`})]})},N={globals:{direction:`rtl`},render:e=>(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(c,{htmlFor:e.id,className:`sr-only`,children:`الوسوم`}),(0,x.jsx)(y,{...e})]}),args:{id:`tags-rtl`,value:[`إضاءة`,`لاسلكي`],placeholder:`أضف وسمًا`,removeLabel:e=>`إزالة ${e}`}},P={args:{id:`tags-suggest`,value:[],suggestions:[`lighting`,`wireless`,`outdoor`,`gift`,`new`],suggestionsLabel:`Suggested tags`},play:async({canvasElement:e})=>{let t=w(e);await C.type(t.getByRole(`combobox`),`w`),await C.keyboard(`{ArrowDown}{Enter}`),await S(t.getByText(`wireless`)).toBeInTheDocument(),await C.type(t.getByRole(`combobox`),`my own{Enter}`),await S(t.getByText(`my own`)).toBeInTheDocument()}},F={globals:{direction:`rtl`},render:e=>(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(c,{htmlFor:e.id,className:`sr-only`,children:`الوسوم`}),(0,x.jsx)(y,{...e})]}),args:{id:`tags-suggest-rtl`,value:[],placeholder:`أضف وسمًا`,removeLabel:e=>`إزالة ${e}`,suggestions:[`إضاءة`,`لاسلكي`,`خارجي`],suggestionsLabel:`وسوم مقترحة`}},I=[`Default`,`WithLabel`,`Tones`,`Empty`,`Disabled`,`Invalid`,`RightToLeft`,`WithSuggestions`,`SuggestionsRightToLeft`],E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    id: "tags-default"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox"), "gift,new{Enter}");
    await expect(canvas.getByText("gift")).toBeInTheDocument();
    await expect(canvas.getByText("new")).toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="keywords">Keywords</Label>
      <Controlled {...args} id="keywords" />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove lighting"
    }));
    await expect(canvas.queryByText("lighting")).not.toBeInTheDocument();
    await expect(canvas.getByLabelText("Keywords")).toHaveFocus();
  }
}`,...D.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    id: "tags-tones",
    value: ["new", "sale", "discontinued", "plain"],
    tone: tag => tones[tag] ?? "secondary"
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    id: "tags-empty",
    value: []
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    id: "tags-disabled",
    disabled: true
  },
  parameters: {
    a11y: {
      config: {
        rules: [
        // Inactive controls are exempt from WCAG 1.4.3; axe still measures the dimmed chips.
        {
          id: "color-contrast",
          enabled: false
        }]
      }
    }
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-2">
      <Label htmlFor="tags-invalid">Keywords</Label>
      <Controlled {...args} id="tags-invalid" aria-invalid aria-describedby="tags-invalid-error" />
      <p id="tags-invalid-error" className="text-sm text-destructive">
        Add at most five keywords.
      </p>
    </div>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <>
      <Label htmlFor={args.id} className="sr-only">
        الوسوم
      </Label>
      <Controlled {...args} />
    </>,
  args: {
    id: "tags-rtl",
    value: ["إضاءة", "لاسلكي"],
    placeholder: "أضف وسمًا",
    removeLabel: (tag: string) => \`إزالة \${tag}\`
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    id: "tags-suggest",
    value: [],
    suggestions: ["lighting", "wireless", "outdoor", "gift", "new"],
    suggestionsLabel: "Suggested tags"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "w");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByText("wireless")).toBeInTheDocument();
    await userEvent.type(canvas.getByRole("combobox"), "my own{Enter}");
    await expect(canvas.getByText("my own")).toBeInTheDocument();
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  globals: {
    direction: "rtl"
  },
  render: args => <>
      <Label htmlFor={args.id} className="sr-only">
        الوسوم
      </Label>
      <Controlled {...args} />
    </>,
  args: {
    id: "tags-suggest-rtl",
    value: [],
    placeholder: "أضف وسمًا",
    removeLabel: (tag: string) => \`إزالة \${tag}\`,
    suggestions: ["إضاءة", "لاسلكي", "خارجي"],
    suggestionsLabel: "وسوم مقترحة"
  }
}`,...F.parameters?.docs?.source}}}})))()}L();export{E as Default,j as Disabled,A as Empty,M as Invalid,N as RightToLeft,F as SuggestionsRightToLeft,k as Tones,D as WithLabel,P as WithSuggestions,I as __namedExportsOrder,T as default};