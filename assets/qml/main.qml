import QtQuick
import QtQuick.Controls
import QtQuick.Effects
import QtQuick.Layouts
import QtQuick.Dialogs
import "../widgets/AvatarImage"

Window {
    id: root
    width: 920
    height: 620
    visible: true
    title: "Antigravity Pomodoro"
    color: "#FDFDFD"

    property int workTime: 25 * 60
    property int shortBreak: 5 * 60
    property int longBreak: 15 * 60
    property int currentTime: workTime
    property bool running: false
    property string mode: "Work"

    Timer {
        id: mainTimer
        interval: 1000
        repeat: true
        running: root.running
        onTriggered: {
            if (root.currentTime > 0) {
                root.currentTime--
            } else {
                root.running = false
            }
        }
    }

    function formatTime(seconds) {
        let m = Math.floor(seconds / 60)
        let s = seconds % 60
        return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s
    }

    FileDialog {
        id: avatarDialog
        title: "Select Avatar"
        nameFilters: ["Image files (*.png *.jpg *.jpeg)"]
        onAccepted: userProfile.updateAvatar(selectedFile)
    }

    // Background Gradient
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#FFFFFF" }
            GradientStop { position: 1.0; color: "#F0F4F8" }
        }
    }

    // Sidebar (Profile & Projects Placeholder)
    Rectangle {
        id: sidebar
        width: 280
        anchors.left: parent.left
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        color: "white"
        border.color: "#F1F3F5"
        

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 24
            spacing: 15 // Controlled manually via Layout.margins
            // User Profile Section
            RowLayout {
                Layout.fillWidth: true
                spacing: 5
    
                Item {
                    Layout.alignment: Qt.AlignLeft
                    width: 62
                    height: 62

                    AvatarImage {
                        anchors.fill: parent
                        source: userProfile.avatarPath
                        fallbackText: userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : "U"
                        
                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: avatarDialog.open()
                        }
                    }
                    
                    Rectangle {
                        width: 20
                        height: 20
                        radius: 10
                        color: "#2D3436"
                        anchors.right: parent.right
                        anchors.bottom: parent.bottom
                        border.color: "white"
                        border.width: 2
                        
                        Text {
                            anchors.centerIn: parent
                            text: "✎"
                            color: "white"
                            font.pixelSize: 10
                        }
                    }
                }

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 0  // Reduced spacing between name and headline
                    
                    Rectangle {
                        Layout.fillWidth: true
                    
                        height: 28
                        color: "transparent"
                        TextInput {
                            id: nameInput
                            anchors.fill: parent
                            text: userProfile.fullName
                            font.pixelSize: 18
                            font.weight: Font.Bold
                            color: "#2D3436"
                            horizontalAlignment: Text.AlignLeft
                            onEditingFinished: {
                                userProfile.fullName = text
                            }
                            selectByMouse: true
                        }
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        height: 18
                        color: "transparent"
                        TextInput {
                            id: headlineInput
                            anchors.fill: parent
                            text: userProfile.headline
                            font.pixelSize: 12
                            color: "#636E72"
                            horizontalAlignment: Text.AlignLeft
                            onEditingFinished: {
                                userProfile.headline = text
                            }
                            selectByMouse: true
                        }
                    }
                }
            }



            // Navigation / Projects placeholder
            ColumnLayout {
                Layout.fillHeight: false
                Layout.fillWidth: true
                spacing: 8  // Reduced spacing

                Text {
                    text: "NAVIGATIONS"
                    font.pixelSize: 11
                    font.weight: Font.Bold
                    color: "#ADB5BD"
                    font.letterSpacing: 1.2
                }

                Repeater {
                    model: ["Dashboard", "Settings", "Analytics"]
                    delegate: Rectangle {
                        Layout.fillWidth: true
                        height: 44
                        radius: 8
                        color: index === 0 ? "#F8F9FA" : "transparent"
                        
                        Text {
                            anchors.left: parent.left
                            anchors.leftMargin: 16
                            anchors.verticalCenter: parent.verticalCenter
                            text: modelData
                            font.pixelSize: 14
                            font.weight: index === 0 ? Font.Bold : Font.Normal
                            color: index === 0 ? "#2D3436" : "#636E72"
                        }
                    }
                }
            }
            Item {
                Layout.fillHeight: true
            }
        }
    }

}
