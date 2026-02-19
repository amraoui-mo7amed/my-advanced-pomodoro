import QtQuick
import QtQuick.Effects

Item {
    id: root
    property url source: ""
    property string fallbackText: "U"
    property real borderWidth: 2
    property color borderColor: "#E1E8ED"
    property color backgroundColor: "#F8F9FA"
    property real cornerRadius: 6 // Custom radius as requested

    Rectangle {
        id: background
        anchors.fill: parent
        radius: root.cornerRadius
        color: root.backgroundColor
        border.color: root.borderColor
        border.width: root.borderWidth
        clip: true

        Image {
            id: img
            anchors.fill: parent
            anchors.margins: root.borderWidth
            source: root.source
            fillMode: Image.PreserveAspectCrop
            visible: true // Direct visibility
            smooth: true
            antialiasing: true
        }

        // MultiEffect can be problematic on some systems, using simple clipping first
        Rectangle {
            anchors.fill: img
            color: "transparent"
            border.color: root.borderColor
            border.width: root.borderWidth
            radius: root.cornerRadius
            visible: false // Hidden, just for logic reference
        }

        Text {
            anchors.centerIn: parent
            text: root.fallbackText
            font.pixelSize: parent.width * 0.4
            font.weight: Font.Bold
            color: "#ADB5BD"
            visible: root.source.toString() === ""
        }
    }
}
