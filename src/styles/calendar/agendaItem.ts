import { StyleSheet, Appearance } from 'react-native';

export default function getStyleSheet() {
    return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 12,
        marginVertical: 5,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    itemHourText: {
        color: '#888',
        fontSize: 12,
        width: 58,
        flexShrink: 0,
    },
    itemDurationText: {
        color: 'grey',
        fontSize: 12,
        marginTop: 4,
    },
    itemTitleText: {
        color: '#1a1a1a',
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 2,
    },
    itemFooterText: {
        color: '#888',
        fontSize: 13,
    },
    itemButtonContainer: {
        marginLeft: 'auto',
        paddingLeft: 8,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    itemButton: {
        fontSize: 20,
        color: '#ccc',
    },
    emptyItem: {
        paddingLeft: 20,
        height: 52,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey'
    },
    emptyItemText: {
        color: 'lightgrey',
        fontSize: 14
    }
});

const darkMode = StyleSheet.create({
    ...styles
});

const lightMode = StyleSheet.create({
    ...styles
});
