import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity} from 'react-native';

type ButtonStyles = {
  [key: string]: {
    [key: string]: Array<import('react-native').ViewStyle>;
  };
};

export default function App() {
  
  const buttonStyles: ButtonStyles = {
    view1: {
      'C': [styles.buttonRow1],
      '+/-': [styles.buttonRow1],
      '%': [styles.buttonRow1],
      '÷': [styles.button, styles.buttonBlue],
    },
    view2: {
      '7': [styles.button],
      '8': [styles.button],
      '9': [styles.button],
      'x': [styles.button, styles.buttonBlue],
    },
    view3: {
      '4': [styles.button],
      '5': [styles.button],
      '6': [styles.button],
      '-': [styles.button, styles.buttonBlue],
    },
    view4: {
      '1': [styles.button],
      '2': [styles.button],
      '3': [styles.button],
      '+': [styles.button, styles.buttonBlue],
    },
    view5: {
      '0': [styles.button, styles.buttonZero],
      '.': [styles.button],
      '=': [styles.button, styles.buttonBlue],
    }
  };

  const buttons: { [key: string]: Array<string> } = {
    view1: ['C', '+/-', '%', '÷'],
    view2: ['7', '8', '9', 'x'],
    view3: ['4','5','6','-'],
    view4: ['1','2','3','+'],
    view5: ['0','.','=']
  };

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>0</Text>
      </View>
      {Object.keys(buttons).map((viewKey, index) => (
          <View key={index} style={styles.row}>
            {buttons[viewKey].map((label, index) => (
              <TouchableOpacity key={index} style={[styles.button, ...buttonStyles[viewKey][label]]}>
                <Text style={[styles.buttonText, buttonStyles[viewKey][label].includes(styles.button) && label === '0' ? styles.buttonTextZero : styles.buttonTextWhite]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  displayText: {
    fontSize: 64,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#454545',
    marginHorizontal: 8,
    height: 80,
    borderRadius: 100,
  },
  buttonRow1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A9A9A9',
    marginHorizontal: 8,
    height: 80,
    borderRadius: 40,
  },
  buttonBlue: {
    backgroundColor: '#2B65EC',
  },
  buttonText: {
    fontSize: 32,
    color: '#000',
  },
  buttonTextSecondary: {
    color: '#888',
  },
  buttonTextWhite: {
    color: '#fff',
  },
  buttonZero: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  buttonTextZero: {
    textAlign: 'left',
    color: '#fff',
    paddingLeft: 40,
  },
});
