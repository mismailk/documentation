---
title: UI kit
order: 3
---

# UI kit

`@backray/ui` is the set of components the dashboard is built from, and the ones your extensions use, so they look and behave like the dashboard. Each component works with the keyboard and a screen reader, in light and dark, and from left to right and right to left (Arabic).

<a href="../storybook/index.html" target="_blank">Open the Storybook</a> to try every component with the theme and direction toolbars.

## Install

`@backray/ui` is a source-only package: your app compiles it, so it needs React 19 and Tailwind CSS 4. Import its stylesheet after Tailwind in your app's main stylesheet:

```css
@import "tailwindcss";
@import "@backray/ui/styles.css";
```

Then import the components by name:

```tsx
import { Button } from "@backray/ui";

<Button variant="outline">Cancel</Button>;
```

## Variants and sizes

Components with variants use the same names: `primary`, `secondary`, `ghost`, `outline` and `link`, plus `destructive` for a dangerous action. Sizes are `sm`, `md` and `lg`, with `xs` and icon sizes where they make sense.

## Light, dark and right to left

The stylesheet holds the theme's colours. The dark theme applies inside an element with the `dark` class, usually `<html class="dark">`. Right to left follows the page's `dir="rtl"`. Components that have text of their own, such as a dialog's close button or the tree's menu, take it as a prop, so you pass it in the page's language.

## Components

- [Alert dialog](alert-dialog.md): A dialog that interrupts to confirm an action, such as deleting a record.
- [Badge](badge.md): A short label for a status or a count, in the `primary`, `secondary`, `outline` or `destructive` tone.
- [Button](button.md): The action button, in the `primary`, `secondary`, `destructive`, `outline`, `ghost` and `link` variants and the `xs` to `lg` and icon sizes.
- [Card](card.md): A bordered box for a group of content, with a header, title, description, action, content and footer.
- [Checkbox](checkbox.md): A box to check or uncheck one option.
- [Combobox](combobox.md): A searchable list to pick one value from, including values loaded as you type.
- [Dialog](dialog.md): A window over the page for a short task.
- [Dropdown menu](dropdown-menu.md): A menu of actions opened from a button, with checkbox and radio items, groups and submenus.
- [File preview](file-preview.md): An image, or a card with a file's name, type and size and a link to open it.
- [File uploader](file-uploader.md): A drop zone and file picker that checks the file type, size and count before accepting a file.
- [Input](input.md): A one-line text field.
- [Label](label.md): The label of a form control.
- [Multi combobox](multi-combobox.md): A searchable list to pick several values from; the picked values show as chips.
- [Popover](popover.md): A small panel opened next to a button, for extra content or a short form.
- [Radio group](radio-group.md): A set of options where only one can be picked.
- [Select](select.md): A button that opens a list to pick one value from.
- [Separator](separator.md): A horizontal or vertical line between content.
- [Sheet](sheet.md): A panel that slides in from the side of the screen, such as the dashboard's phone menu.
- [Skeleton](skeleton.md): A grey placeholder shown while content loads.
- [Switch](switch.md): An on/off toggle.
- [Table](table.md): A data table with a header, body, footer and caption.
- [Tag input](tag-input.md): A field for a list of short tags, typed one at a time.
- [Textarea](textarea.md): A multi-line text field.
- [Toaster](toaster.md): Short messages that appear for a moment, such as "Saved".
- [Tree](tree.md): A collapsible tree of nodes.
