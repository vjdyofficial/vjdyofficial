# Moon Phase SVG on Kustom Apps
Kustom apps 3.74 and later version now supports SVG Vectors so you will not be able to use font just for the icons.
To use the SVG icon, let's setup your global variables in Kustom Editor.

Be sure to create the **CoreGUI** and **SVG** folder in Kustom so you will have to separate the global variable from other variables you use.

> [!IMPORTANT]
> To copy all of these codes, download the TXT file through my GitHub Release Tag called **kustomcodes**. just type in the address bar: `github.com/vjdyofficial/vjdyofficial/releases/tags` and append the word `kustomcodes`.

> [!NOTE]
> Open TXT file in Text Editor app on your device.

# Getting started
Create **moonc** as Global Text Object and copy this from the KCODE file:

## Represent the waning cresent moon type shape.
This is the beginning of the _if_ condition.

`$if(ai(mphasec)="WANING_CRESENT",
"M50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C36.1929 0 25 22.3858 25 50C25 77.6142 36.1929 100 50 100Z",`

## Represent the third quarter moon type shape.
append to the previous code.

`if(ai(mphasec)="THIRD_QUARTER",
"M50 100C36.7392 100 24.0215 94.7322 14.6447 85.3553C5.26784 75.9785 -3.68891e-07 63.2608 0 50C3.68891e-07 36.7392 5.
26784 24.0215 14.6447 14.6447C24.0215 5.26784 36.7392 -1.58134e-07 50 0L50 50L50 100Z",`

## Represent the waning gibbous moon type shape.
append to the previous code.

`if(ai(mphasec)="WANING_GIBBOUS",
"M50 100C63.8071 100 75 77.6142 75 50C75 22.3858 63.8071 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100Z",`

## Represent the full moon type shape.
append to the previous code.

`if(ai(mphasec)="FULL",
"M 50 0 A 1 1 0 0 0 50 2 A 1 1 0 0 0 50 0 Z",`

## Represent the waxing gibbous moon type shape.
append to the previous code.

`if(ai(mphasec)="WAXING_GIBBOUS",
"M50 100C36.1929 100 25 77.6142 25 50C25 22.3858 36.1929 0 50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 
100Z",`

## Represent the first quarter moon type shape.
append to the previous code.

`if(ai(mphasec)="FIRST_QUARTER",
"M50 0C63.2608 1.58134e-07 75.9785 5.26784 85.3553 14.6447C94.7322 24.0215 100 36.7392 100 50C100 63.2608 94.7322 75.9785 
85.3553 85.3553C75.9785 94.7322 63.2608 100 50 100L50 50L50 0Z",`

## Represent the waxing cresent moon type shape.
append to the previous code.

`if(ai(mphasec)="WAXING_CRESENT",
"M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C63.8071 0 75 22.3858 75 50C75 77.6142 63.8071 100 50 
100Z",`

## Represent the new moon type shape.
append to the previous code.

`""`

## End part of the code.
append to the previous code.

`)))))))$`
