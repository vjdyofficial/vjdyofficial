# ModuMarkdown
ModuMarkdown created by vjdyofficial is the modified version of Markdown Language System. which can use to convert into an HTML Paragraph. Certain HTML elements will be restricted to use in order to use the **paragraph elements**. This is used for App Inventor based projects that they create their own app.

# App Inventor Based Block Code
![blocks](https://github.com/vjdyofficial/vjdyofficial/assets/136038916/eb15dbc8-df3e-4c48-9b41-95ebc5a0adf3)

This blocks will be used to create the replacement system in the Label Component.

![procedures_callreturn](https://github.com/vjdyofficial/vjdyofficial/assets/136038916/c9ebb3d3-ac52-4463-8ab6-f806bf6ec153)

This procedure block will used on the label component to create a visual paragraph. Bes ure that the **HTML Format** is enabled. Using this symbols: `<` and `>` are now restricted. All codes included here will convert into HTML code that is powered by RegEx (Regular Expressions). This common break line symbol: `\n` is converted into HTML code like this: **`<br>`** to stiil use the break line everytime you click enter.

Styling Codes

**Large Size Start** → `##` into **`<big>`**

**Large Size End** → `#/#` into **`</big>`**

**Small Size Start** → `#-#-` into **`<small>`**

**Small Size End** → `#/#/` into **`</small>`**

**Ordinal Text Start** → `@ordinal{` into **`<small><sup>`**

**Ordinal Text End** → `}end` into **`</small></sup>`**



# Paragraph Codes

**Bold Text Start** → `**` into **`<b>`**

**Bold Text End** → `*/*` into **`</b>`**

**Italic Text Start** → `__` into **`<i>`**

**Italic Text End** → `_/_` into **`</i>`**

**Underlined Text Start** → `==` into **`<u>`**

**Underlined Text End** → `=/=` into **`</u>`**

**Stroked Text Start** → `--` into **`<s>`**

**Stroked Text End** → `-/-` into **`</s>`**



# Font Typeface Codes

All codes will use **Android System Fonts** instead of Windows Fonts like full name.

**Sans Serif** → `@sans-serif[` into **`<font face=sans-serif>`**

**Serif** → `@serif[` into **`<font face=serif>`**

**Monospace** → `@mono[` into **`<font face=sans-serif-monospace>`**

**Serif Monospace** → `@mono-serif[` into **`<font face=serif-monospace>`**

**Source Sans Pro** → `@sourcesans[` into **`<font face=source-sans-pro>`** on some devices running _`Android 10+`_ 

**Source Sans Pro Semibold** → `@sourcesans=600[` into **`<font face=source-sans-pro-semi-bold>`** on some devices running _`Android 10+`_ 

**Samsung Default Font (One UI Sans)** → `@samsung[` into **`<font face=sec>`** on some devices running _`Android 14+ on OneUI 6.0+`_ 

**Font End** → `]end` into **`</font>`**
