#include <Array.au3>
#include <Constants.au3>
#include <WindowsConstants.au3>
#include <GDIPlus.au3>

Func Capture_Window($hWnd, $w, $h)
    Local $hDC_Capture = _WinAPI_GetWindowDC($hWnd)
    Local $hMemDC = _WinAPI_CreateCompatibleDC($hDC_Capture)
    Local $hHBitmap = _WinAPI_CreateCompatibleBitmap($hDC_Capture, $w, $h)
    Local $hObject1 = _WinAPI_SelectObject($hMemDC, $hHBitmap)
    DllCall("user32.dll", "int", "PrintWindow", "hwnd", $hWnd, "handle", $hMemDC, "int", 0)
    _WinAPI_DeleteDC($hMemDC)
    Local $hObject = _WinAPI_SelectObject($hMemDC, $hObject1)
    _WinAPI_ReleaseDC($hWnd, $hDC_Capture)
    Local $hBmp = _GDIPlus_BitmapCreateFromHBITMAP($hHBitmap)
    _WinAPI_DeleteObject($hHBitmap)
    Return $hBmp
EndFunc   ;==>Capture_Window

Func GetAllWindow() ;code by Authenticity - modified by UEZ
    Local $aWin = WinList(), $aWindows[1][4]
    Local $iStyle, $iEx_Style, $iCounter = 0
    Local $i, $hWnd_state, $aWinPos

    For $i = 1 To $aWin[0][0]
        $iEx_Style = BitAND(_WinAPI_GetWindowLong($aWin[$i][1], $GWL_EXSTYLE), $WS_EX_TOOLWINDOW)
        $iStyle = BitAND(WinGetState($aWin[$i][1]), 2)
        If $iEx_Style <> -1 And Not $iEx_Style And $iStyle Then
            $aWinPos = WinGetPos($aWin[$i][1])
            If $aWinPos[2] > 1 And $aWinPos[3] > 1 Then
                $aWindows[$iCounter][0] = $aWin[$i][0]
                $aWindows[$iCounter][1] = $aWin[$i][1]
                $aWindows[$iCounter][2] = $aWinPos[2]
                $aWindows[$iCounter][3] = $aWinPos[3]
                $iCounter += 1
            EndIf
            ReDim $aWindows[$iCounter + 1][4]
        EndIf
    Next
    ReDim $aWindows[$iCounter][4]
    Return $aWindows
EndFunc   ;==>GetAllWindow


_GDIPlus_Startup()
$hw = WinGetHandle("Adobe Flash Player 28", "")
$hBitmap = Capture_Window($hw, 982, 831)
_GDIPlus_ImageSaveToFile($hBitmap, ".\current.jpg")
_GDIPlus_BitmapDispose($hBitmap)

while true
   $txt = ConsoleRead()
   if $txt = "screencap" then
	  $hw = WinGetHandle("Adobe Flash Player 28", "")
	  $hBitmap = Capture_Window($hw, 982, 831)
	  _GDIPlus_ImageSaveToFile($hBitmap, ".\current.jpg")
	  _GDIPlus_BitmapDispose($hBitmap)
   ElseIf $txt <> "" then
	  ControlSend("Adobe Flash Player 28", "", 0, $txt)
   EndIf
   sleep(50)
WEnd
_GDIPlus_Shutdown()