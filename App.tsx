import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

type ButtonStyles = {
  [key: string]: {
    [key: string]: Array<import('react-native').ViewStyle>;
  };
};

export default function App() {
  const [currentEquation, setCurrentEquation] = useState<string>('');
  const [answerValue, setAnswerValue] = useState<string>('');

  const calculateResult = () => {
    try {
      const result = evaluateExpression(currentEquation);
      setAnswerValue(result.toString());
    } catch (error) {
      setAnswerValue('Error');
    }
  };

  const evaluateExpression = (expression: string): string => {
    const tokens = tokenize(expression);
    const postfix = infixToPostfix(tokens);
    return evaluatePostfix(postfix).toString();
  };

  const tokenize = (expression: string): string[] => {
    const regex = /(?<!\d)-?\d+(?:\.\d+)?|[+\-x/÷]/g;
    return expression.match(regex) || [];
  };

  const infixToPostfix = (tokens: string[]): string[] => {
    const precedence: { [key: string]: number } = { '+': 1, '-': 1, 'x': 2, '÷': 2 };
    const output: string[] = [];
    const stack: string[] = [];

    for (const token of tokens) {
      if (!isNaN(parseFloat(token))) {
        output.push(token);
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          output.push(stack.pop()!);
        }
        stack.pop(); // Discard '('
      } else {
        while (
          stack.length > 0 &&
          precedence[token] <= precedence[stack[stack.length - 1]]
        ) {
          output.push(stack.pop()!);
        }
        stack.push(token);
      }
    }

    while (stack.length > 0) {
      output.push(stack.pop()!);
    }

    return output;
  };

  const evaluatePostfix = (postfix: string[]): number => {
    const stack: number[] = [];

    for (let token of postfix) {
      if (token.includes('%') && !isNaN(parseFloat(token))) {
        token = (parseFloat(token) / 100).toString();
      }
      if (!isNaN(parseFloat(token))) {
        stack.push(parseFloat(token));
      } else {
        const operand2 = stack.pop()!;
        const operand1 = stack.pop()!;
        switch (token) {
          case '+':
            stack.push(operand1 + operand2);
            break;
          case '-':
            stack.push(operand1 - operand2);
            break;
          case 'x':
            stack.push(operand1 * operand2);
            break;
          case '÷':
            if (operand2 === 0) throw new Error('Division by zero');
            stack.push(operand1 / operand2);
            break;
          default:
            throw new Error('Invalid operator');
        }
      }
    }

    if (stack.length !== 1) throw new Error('Invalid expression');
    return stack.pop()!;
  };

  const toggleSign = () => {
    if (currentEquation) {
      // Regular expression to match numbers (with optional decimal points)
      const numberRegex = /-?\d+(\.\d+)?/g;
      let lastIndex = -1;
      let lastMatch = null;

      // Iterate through matches to find the last one
      let match;
      while ((match = numberRegex.exec(currentEquation)) !== null) {
        lastIndex = match.index;
        lastMatch = match[0];
      }

      // If a number is found, toggle its sign
      if (lastMatch !== null) {
        const updatedEquation =
          currentEquation.substring(0, lastIndex) +
          (lastMatch.startsWith('-') ? lastMatch.substring(1) : '-' + lastMatch) +
          currentEquation.substring(lastIndex + lastMatch.length);
        setCurrentEquation(updatedEquation);
      }
    }
  };

  const buttonPressed = (label: string) => {
    if (label === '=') {
      // calculateResult();
      if (answerValue !== '') {
        setCurrentEquation(answerValue);
        setAnswerValue('');
      }
    } else if (label === 'C') {
      setCurrentEquation('');
      setAnswerValue('');
    } else if (label === '.') {
      if (currentEquation === '' || /[+\-x/()]$/.test(currentEquation)) {
        setCurrentEquation(currentEquation + '0.');
      } else if (!/\.\d*$/.test(currentEquation)) {
        setCurrentEquation(currentEquation + '.');
      }
    } else if (label === '+/-') {
      toggleSign();
    } else {

      const operators = ['+', '-', 'x', '÷','%'];

      // Check if the current equation is '0'. replace with number
      if (currentEquation === '0' && !operators.includes(label)) {
        setCurrentEquation(label);
        return;
      }
      // Check if there are operators before the zero
      const lastIndex = currentEquation.length - 1;
      const lastChar = currentEquation[currentEquation.length - 1];

      if (lastChar === '0' && operators.includes(currentEquation[lastIndex - 1])&& !operators.includes(label)) {
        setCurrentEquation(currentEquation.slice(0, lastIndex) + label);
        return;
      }

      setCurrentEquation(currentEquation + label);
    }
  };

  useEffect(() => {

    const isNegativeNumber = /^-[^+\-x÷]+$/.test(currentEquation);
    const hasOperator = /[+\-x÷]/.test(currentEquation);
    const endsWithOperator = /[+\-x÷]$/.test(currentEquation);

    if (isNegativeNumber) {
      setAnswerValue('');
      return;
    }
    if (!hasOperator || endsWithOperator) {
      setAnswerValue('');
      return;
    }

    // If it's a valid equation, calculate the result
    try {
      calculateResult();
    } catch (error) {
      setAnswerValue('Error');
    }
  }, [currentEquation]);

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
    view3: ['4', '5', '6', '-'],
    view4: ['1', '2', '3', '+'],
    view5: ['0', '.', '=']
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{currentEquation}</Text>
      </View>
      <View style={styles.displayContainer}>
        <Text style={styles.greyedText}>{answerValue}</Text>
      </View>
      {Object.keys(buttons).map((viewKey, index) => (
        <View key={index} style={styles.row}>
          {buttons[viewKey].map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, ...buttonStyles[viewKey][label]]}
              onPress={() => buttonPressed(label)}
            >
              <Text
                style={[
                  styles.buttonText,
                  buttonStyles[viewKey][label].includes(styles.button) &&
                    label === '0'
                    ? styles.buttonTextZero
                    : styles.buttonTextWhite,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </SafeAreaView>
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
    marginBottom: 32,
    marginRight: 20
  },
  displayText: {
    fontSize: 45,
    color: '#fff',
  },
  greyedText: {
    fontSize: 32,
    color: '#fff',
    opacity: 0.7,
    marginHorizontal: 8,
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
    borderRadius: 40,
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
    fontSize: 24,
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
