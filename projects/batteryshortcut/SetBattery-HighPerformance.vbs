Set WshShell = CreateObject("WScript.Shell")

' Set power plan to Balanced
WshShell.Run "powercfg /s 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c", 0, True

' Show a popup message
MsgBox "High Performance Activated!", 64, "Power Plan"

' Exit the script
WScript.Quit
