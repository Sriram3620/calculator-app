// Author: Barnabas Tan
// Code was written by Author

import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import {FontAwesome6} from '@expo/vector-icons';
import {StatusBar} from 'expo-status-bar';
import {ButtonStyles} from './types';

const buttons: {[key: string]: string[]} = {
  view1: ['C', '+/-', '%', '÷'],
  view2: ['7', '8', '9', 'x'],
  view3: ['4', '5', '6', '-'],
  view4: ['1', '2', '3', '+'],
  view5: ['0', '.', '='],
};

export default function App() {
  const [currentEquation, setCurrentEquation] = useState('');
  const [answerValue, setAnswerValue] = useState('');
  const scrollRef = useRef<ScrollView>(null);

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
      // If there's a calculated answer, replace current equation with the answer and clear answer value
      if (answerValue !== '') {
        setCurrentEquation(answerValue);
        setAnswerValue('');
      }
    } else if (label === 'C') {
      // Reset current equation and clear answer value
      setCurrentEquation('');
      setAnswerValue('');
    } else if (label === '.') {
      // Add decimal point to current equation based on certain conditions
      if (currentEquation === '' || /[+\-x/()]$/.test(currentEquation)) {
        // If current equation is empty or ends with an operator, append "0." (start new decimal)
        setCurrentEquation(currentEquation + '0.');
      } else if (!/\.\d*$/.test(currentEquation)) {
        // If there's no decimal already, append a decimal point
        setCurrentEquation(currentEquation + '.');
      }
    } else if (label === '+/-') {
      // Toggle the sign of the last number in the current equation
      toggleSign();
    } else {
      const operators = ['+', '-', 'x', '÷', '%'];

      // Check if the current equation is '0'. Replace with number
      if (currentEquation === '0' && !operators.includes(label)) {
        // If current equation is '0' and label is not an operator, replace '0' with the label
        setCurrentEquation(label);
        return;
      }

      // Check if there's a '0' preceded by an operator
      const lastIndex = currentEquation.length - 1;
      const lastChar = currentEquation[currentEquation.length - 1];

      if (
        lastChar === '0' &&
        operators.includes(currentEquation[lastIndex - 1]) &&
        !operators.includes(label)
      ) {
        // If there's a '0' preceded by an operator and the label is not an operator, replace '0' with the label
        setCurrentEquation(currentEquation.slice(0, lastIndex) + label);
        return;
      }

      // Otherwise, append the label to the current equation
      setCurrentEquation(currentEquation + label);
    }
  };

  useEffect(() => {
    const calculateResult = () => {
      try {
        // Attempt to evaluate the current equation and calculate the result
        const result = evaluateExpression(currentEquation);
        // Set the answer value to the result of the evaluation as a string
        setAnswerValue(result.toString());
      } catch (error) {
        console.log(error);
        // If an error occurs during evaluation (e.g., division by zero), set the answer value to "Error"
        setAnswerValue('Error');
      }
    };

    const evaluateExpression = (expression: string) => {
      const tokens = tokenize(expression);
      const postfix = infixToPostfix(tokens);
      return evaluatePostfix(postfix).toString();
    };

    const tokenize = (expression: string) => {
      // Regular expression to tokenize a mathematical expression:
      // (?<!\d)    - Negative lookbehind assertion ensuring the match is not preceded by a digit.
      //              Prevents matching hyphens that are part of negative numbers as an arithmetic operator.
      // -?\d+      - Matches an optional minus sign followed by one or more digits (integer part).
      // (?:\.\d+)? - Non-capturing group for an optional decimal part (. followed by one or more digits).
      // %?         - Matches an optional percent sign (%).
      // [+\-x/÷]   - Matches any of the arithmetic operators: +, -, x, /, ÷.
      const regex = /(?<!\d)-?\d+(?:\.\d+)?%?|[+\-x/÷]/g;

      // Use regex to tokenize the expression and return an array of tokens
      return expression.match(regex) || [];
    };

    const infixToPostfix = (tokens: string[]) => {
      // Operator precedence dictionary
      const precedence: {[key: string]: number} = {
        '+': 1,
        '-': 1,
        x: 2,
        '÷': 2,
      };

      // Output array for postfix expression
      const output: string[] = [];
      // Stack for operators
      const stack: string[] = [];

      // Iterate through each token in the input tokens array
      for (const token of tokens) {
        // If the token is a number, add it directly to the output
        if (!isNaN(parseFloat(token))) {
          output.push(token);
        } else {
          // If the token is an operator
          // Pop operators from the stack to the output until the stack is empty or the top of the stack has lower precedence than the current token
          while (stack.length > 0 && precedence[token] <= precedence[stack[stack.length - 1]]) {
            output.push(stack.pop()!);
          }
          // Push the current token onto the stack
          stack.push(token);
        }
      }

      // Pop all remaining operators from the stack to the output
      while (stack.length > 0) {
        output.push(stack.pop()!);
      }

      // Return the postfix expression in the form of an array of tokens
      return output;
    };

    const evaluatePostfix = (postfix: string[]) => {
      const stack: number[] = []; // Stack to hold operands during evaluation

      for (let token of postfix) {
        // Handle percentage calculation if token includes "%"
        if (token.includes('%') && !isNaN(parseFloat(token))) {
          token = (parseFloat(token) / 100).toString(); // Convert percentage to decimal
        }

        if (!isNaN(parseFloat(token))) {
          // If token is a number, push it to the stack as a float
          stack.push(parseFloat(token));
        } else {
          // If token is an operator
          const operand2 = stack.pop()!; // Pop the top operand (second operand in postfix evaluation)
          const operand1 = stack.pop()!; // Pop the next operand (first operand in postfix evaluation)

          let result: number;

          switch (token) {
            case '+':
              result = operand1 + operand2;
              break;
            case '-':
              result = operand1 - operand2;
              break;
            case 'x':
              result = operand1 * operand2;
              break;
            case '÷':
              if (operand2 === 0) throw new Error('Division by zero');
              result = operand1 / operand2;
              break;
            default:
              throw new Error('Invalid operator');
          }

          // Convert result to string with up to 12 decimal places to avoid floating-point arithmetic issues
          const resultString = result.toFixed(12);

          // Parse the string back to number and push it to stack. Number() removes excess trailing zeros.
          stack.push(Number(resultString));
        }
      }

      // After evaluating all tokens, there should be exactly one value left in the stack, which is the result
      if (stack.length !== 1) throw new Error('Invalid expression');

      return stack.pop()!; // Return the final result from the stack
    };
    const checkEquationValidity = (equation: string) => {
      const isNegativeNumber = /^-[^+\-x÷]+$/.test(equation);
      const hasOperator = /[+\-x÷]/.test(equation);
      const endsWithOperator = /[+\-x÷]$/.test(equation);

      // hide answer text if the equation only contains a negative number
      if (isNegativeNumber) {
        setAnswerValue('');
        return false;
      }
      // if equation contains only numbers or ends with an operator
      if (!hasOperator || endsWithOperator) {
        setAnswerValue('');
        return false;
      }

      return true;
    };

    try {
      // If it's a valid equation, calculate the result
      if (!checkEquationValidity(currentEquation)) return;
      calculateResult();
    } catch (error) {
      console.log(error);
      setAnswerValue('Error');
    }
  }, [currentEquation]);

  const handleDelPress = () => {
    // Get the remaining equation by removing the last character from currentEquation
    const remainingEquation: string = currentEquation.slice(0, -1);

    setCurrentEquation(remainingEquation);
  };

  const buttonStyles: ButtonStyles = {
    view1: {
      C: [styles.buttonRow1],
      '+/-': [styles.buttonRow1],
      '%': [styles.buttonRow1],
      '÷': [styles.button, styles.buttonBlue],
    },
    view2: {
      '7': [styles.button],
      '8': [styles.button],
      '9': [styles.button],
      x: [styles.button, styles.buttonBlue],
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
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <ScrollView
        ref={scrollRef}
        style={styles.scrollViewContent}
        onContentSizeChange={() => {
          if (scrollRef.current) {
            scrollRef.current.scrollToEnd();
          }
        }}>
        <View style={styles.displayEqnContainer}>
          <Text style={styles.displayText}>{currentEquation}</Text>
        </View>
      </ScrollView>
      <View style={styles.displayAnsContainer}>
        <Text style={styles.greyedText}>{answerValue}</Text>
      </View>
      <View style={styles.rightDelContainer}>
        <TouchableOpacity onPress={handleDelPress}>
          <FontAwesome6 name="delete-left" size={30} color="white" />
        </TouchableOpacity>
      </View>
      {Object.keys(buttons).map((viewKey, index) => (
        <View key={index} style={styles.row}>
          {buttons[viewKey].map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, ...buttonStyles[viewKey][label]]}
              onPress={() => buttonPressed(label)}>
              <Text
                style={[
                  styles.buttonText,
                  buttonStyles[viewKey][label].includes(styles.button) && label === '0'
                    ? styles.buttonTextZero
                    : styles.buttonTextWhite,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </SafeAreaView>
  );
}

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  scrollViewContent: {
    minHeight: windowHeight / 2 / 2.5, // Minimum height before scrolling is enabled
    flex: 1,
  },
  displayEqnContainer: {
    justifyContent: 'flex-start', // Align content to start from top
    alignItems: 'flex-end', // Align content to end (right side)
    marginRight: 20,
    paddingHorizontal: 10,
    // backgroundColor: "blue",
  },
  displayAnsContainer: {
    flex: 2.5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 20,
    // backgroundColor: "blue",
  },
  rightDelContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 30,
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
    height: windowHeight / 2 / 5,
    borderRadius: 40,
  },
  buttonRow1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A9A9A9',
    marginHorizontal: 8,
    height: windowHeight / 2 / 5,
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
    flex: 2.2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  buttonTextZero: {
    textAlign: 'left',
    color: '#fff',
    paddingLeft: 40,
  },
});
