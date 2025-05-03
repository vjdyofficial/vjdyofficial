Set WshShell = CreateObject("WScript.Shell")

' Set power plan to Balanced
WshShell.Run "powercfg /s 381b4222-f694-41f0-9685-ff5bb260df2e", 0, True

' Show a popup message
MsgBox "Balanced Battery Mode activated", 64, "Power Plan"

' Exit the script
WScript.Quit
