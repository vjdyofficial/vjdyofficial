# ModuMarkdown
ModuMarkdown created by vjdyofficial is the modified version of Markdown Language System. which can use to convert into an HTML Paragraph. Certain HTML elements will be restricted to use in order to use the **paragraph elements**. This is used for App Inventor based projects that they create their own app.

# App Inventor Based Block Code
> [!NOTE]
> This blocks will be used to create the replacement system in the Label Component.
> 
> ![blocks](https://github.com/vjdyofficial/vjdyofficial/assets/136038916/eb15dbc8-df3e-4c48-9b41-95ebc5a0adf3)

> [!TIP]
> This procedure block will used on the label component to create a visual paragraph. Be sure that the **HTML Format** is enabled. Using this symbols: `<` and `>` are now restricted. All codes included here will convert into HTML code that is powered by RegEx (Regular Expressions). This common break line symbol: `\n` is converted into HTML code like this: **`<br>`** to stiil use the break line everytime you click enter.
> 
> ![procedures_callreturn](https://github.com/vjdyofficial/vjdyofficial/assets/136038916/c9ebb3d3-ac52-4463-8ab6-f806bf6ec153)

# Styling Codes
> [!TIP]
> Styling means, you can use either large or small text on your own AppInventor based editing or notepad app.

**Large Size Start** → `##` into **`<big>`**

**Large Size End** → `#/#` into **`</big>`**

**Small Size Start** → `#-#-` into **`<small>`**

**Small Size End** → `#/#/` into **`</small>`**

**Ordinal Text Start** → `@ordinal{` into **`<small><sup>`**

**Ordinal Text End** → `}end` into **`</small></sup>`**


# Paragraph Codes
> [!TIP]
> These are **paragraph** codes tht is used to style the text.

**Bold Text Start** → `**` into **`<b>`**

**Bold Text End** → `*/*` into **`</b>`**

**Italic Text Start** → `__` into **`<i>`**

**Italic Text End** → `_/_` into **`</i>`**

**Underlined Text Start** → `==` into **`<u>`**

**Underlined Text End** → `=/=` into **`</u>`**

**Stroked Text Start** → `--` into **`<s>`**

**Stroked Text End** → `-/-` into **`</s>`**


# Font Typeface Codes
> [!TIP]
> All codes will use **Android System Fonts** instead of Windows Fonts like full name.

## List of Font codes

<picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/06b22c6a-7201-4673-936b-3ee615c320a4"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"></picture> **Sans Serif** → `@sans-serif[` into **`<font face=sans-serif>`**

<picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/06b22c6a-7201-4673-936b-3ee615c320a4"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"></picture> **Serif** → `@serif[` into **`<font face=serif>`**

<picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/06b22c6a-7201-4673-936b-3ee615c320a4"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"></picture> **Monospace** → `@mono[` into **`<font face=sans-serif-monospace>`**

<picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/06b22c6a-7201-4673-936b-3ee615c320a4"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"></picture> **Serif Monospace** → `@mono-serif[` into **`<font face=serif-monospace>`**

<picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/308ddaf7-9204-4f8a-a7a9-2dacf43b035c"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"></picture> **Source Sans Pro** → `@sourcesans[` into **`<font face=source-sans-pro>`** on some devices running _`Android 10+`_

<picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/308ddaf7-9204-4f8a-a7a9-2dacf43b035c"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"></picture> **Source Sans Pro Semibold** → `@sourcesans=600[` into **`<font face=source-sans-pro-semi-bold>`** on some devices running _`Android 10+`_ 

<picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/308ddaf7-9204-4f8a-a7a9-2dacf43b035c"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"></picture> **Samsung Default Font (One UI Sans)** → `@samsung[` into **`<font face=sec>`** on some devices running _`Android 14+ on OneUI 6.0+`_ 

**Font End** → `]end` into **`</font>`**

> [!CAUTION]
> Monospace Font Code is no longer use in HTML Code, this was because some Samsung Devices got broke if you try to change font in Android 13+.

Some fonts with this symbol: <picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/308ddaf7-9204-4f8a-a7a9-2dacf43b035c"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/7764c7a0-8b95-4fc5-ba39-e3265ed7420b"></picture> means that is not implemented on some older Android Operating Systems.

Some fonts with this symbol: <picture><source width="24px" height="24px" media="(prefers-color-scheme: dark)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"><source width="24px" height="24px"  media="(prefers-color-scheme: light)" srcset="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/06b22c6a-7201-4673-936b-3ee615c320a4"><img width="24px" height="24px" alt="Shows the representing icons in Material Symbols." src="https://github.com/vjdyofficial/vjdyofficial/assets/136038916/3d6f31f0-4083-48f4-9f43-34be3f103bad"></picture> means that is implemented on some older Android Operating Systems.

# Conclusion
I know that this was different from Markdown, but this was good to prevent from several text glitches in the app.
> [!IMPORTANT]
> You must **download** the image of a blocks to import between Kodular and AppInventor.
