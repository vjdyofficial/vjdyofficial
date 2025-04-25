local GuiService = game:GetService("GuiService")
waitingTime = 0.75

local function updateUI()
	task.wait(1)
	local topbar = script.Parent
	local frameButton = topbar:WaitForChild("frameButton")
	
	frameButton.toggling.buttonsize.Value = Buttonvalue
	frameButton.toggling.buttonsizePad.Value = ButtonvaluePad

	frameButton.UICorner.CornerRadius = CornerValue

	topbar.UIPadding.PaddingRight = UDim.new(0, Padding)
	frameButton.UICorner.CornerRadius = CornerValue

	topbar.Size = UDim2.new(1,0,0,topbarHeight)
	topbar.date.icon.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	topbar.time.icon.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	topbar.servertime.icon.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	
	topbar.icon.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	
	topbar.time.label.ic.UIPadding.PaddingLeft = PadLeft
	topbar.time.label.ic.UIPadding.PaddingRight = PadRight
	topbar.servertime.label.ic.UIPadding.PaddingLeft = PadLeft
	topbar.servertime.label.ic.UIPadding.PaddingRight = PadRight
	topbar.date.label.ic.UIPadding.PaddingLeft = PadLeft
	topbar.date.label.ic.UIPadding.PaddingRight = PadRight
	topbar.servertime.label.ic.UIPadding.PaddingLeft = PadLeft
	topbar.servertime.label.ic.UIPadding.PaddingRight = PadRight

	topbar.date.UICorner.CornerRadius = CornerValue
	topbar.time.UICorner.CornerRadius = CornerValue
	topbar.servertime.UICorner.CornerRadius = CornerValue

	frameButton.toggle.Size = UDim2.new(0,Buttonvalue-2,0,Buttonvalue-2)
	frameButton.toggle.UICorner.CornerRadius = CornerValue

	frameButton.turnFog.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	frameButton.turnLMC.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)

	frameButton.lmcSettings.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	frameButton.lmcSettings.UICorner.CornerRadius = CornerValue
	
	frameButton.turnMusic.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	frameButton.turnSound.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)

	local userGUI = game.Players.LocalPlayer.PlayerGui:WaitForChild("user")
	local musicWindow = userGUI:WaitForChild("jukebox")
	local colorWindow = userGUI:WaitForChild("colorSetting")
	
	musicWindow.UIPadding.PaddingTop = WindowPadTop
	colorWindow.UIPadding.PaddingTop = WindowPadTop
	
	script.Parent.UIPadding.PaddingBottom = paddingUI
	
	if not frameButton.prevenFromUpdate.Value then
		frameButton.Size = UDim2.new(0,Buttonvalue,0,Buttonvalue)
	end

	if waitingTime == 2 then
		waitingTime = 3
	elseif waitingTime == 1 then
		waitingTime = 2
	elseif waitingTime == 0.75 then
		waitingTime = 1
	end
end

while true do
	task.wait(waitingTime)
	topbarHeight = GuiService.TopbarInset.Height
	
	if topbarHeight >= 58 then
		Buttonvalue = 44
		ButtonvaluePad = -1
		Padding = 16
		CornerValue = UDim.new(1,0)
		
		PadLeft = UDim.new(0,4)
		PadRight = UDim.new(0,14)	
		WindowPadTop = UDim.new(0,64)
		
		paddingUI = UDim.new(0,2)
		updateUI()
	else
		Buttonvalue = 32
		ButtonvaluePad = 11
		Padding = 60
		CornerValue = UDim.new(0,8)
		
		PadLeft = UDim.new(0,4)
		PadRight = UDim.new(0,8)
		WindowPadTop = UDim.new(0,44)
		
		paddingUI = UDim.new(0,0)
		updateUI()
	end
end