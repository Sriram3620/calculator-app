import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  ImageBackground,
  View,
  Text,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

const gradientColors = ["#1037e5", "#B38DFD", "#9456FE", "#6305fc"];

const image = require("./assets/background.jpg");

export default function App() {
  // Initialize the Tic-Tac-Toe board as a 3x3 matrix
  const [board, setBoard] = useState<string[][]>([
    ["◯", "◯", "◯"],
    ["X", "◯", "X"],
    ["◯", "X", "X"],
  ]);

  // Track the current player (X or ◯)
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "◯">("X");

  // Track if the game is over
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Track window dimensions
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  // add an onchange listener to the Dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions(Dimensions.get("window"));
    };

    Dimensions.addEventListener("change", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Animated border styles
  const animatedValue = useRef(new Animated.Value(0)).current;

  // useEffect to start and loop the animation using Animated API
  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: gradientColors,
  });

  // Function to handle a move on the board
  const handleMove = (row: number, col: number) => {
    // If the game is over, do nothing
    if (gameOver) return;

    // Make a copy of the current board
    let newBoard = [...board];

    // Check if the selected cell is empty
    if (newBoard[row][col] === "") {
      // Update the value at the selected position with the current player's mark
      newBoard[row][col] = currentPlayer;

      // Check for winning condition
      if (checkWinner(newBoard, row, col, currentPlayer)) {
        alert(`Player ${currentPlayer} wins!`);
        setGameOver(true); // Mark the game as over
        return;
      }

      // Check for draw condition
      if (checkDraw(newBoard)) {
        alert("It's a draw!");
        setGameOver(true); // Mark the game as over
        return;
      }

      // Alternate between X and O for the next move
      setCurrentPlayer(currentPlayer === "X" ? "◯" : "X");

      // Update the state with the new board
      setBoard(newBoard);
    }
  };
  // Function to check for winning condition
  const checkWinner = (board: string[][], row: number, col: number, currentPlayer: string) => {
    // Check for horizontal line
    if (
      board[row][0] === currentPlayer &&
      board[row][1] === currentPlayer &&
      board[row][2] === currentPlayer
    ) {
      return true;
    }
    // Check for vertical line
    if (
      board[0][col] === currentPlayer &&
      board[1][col] === currentPlayer &&
      board[2][col] === currentPlayer
    ) {
      return true;
    }
    // Check for diagonal line (top-left to bottom-right)
    if (
      (board[0][0] === currentPlayer &&
        board[1][1] === currentPlayer &&
        board[2][2] === currentPlayer) ||
      // Check for diagonal line (top-right to bottom-left)
      (board[0][2] === currentPlayer &&
        board[1][1] === currentPlayer &&
        board[2][0] === currentPlayer)
    ) {
      return true;
    }
    return false;
  };

  // Function to check for draw condition
  const checkDraw = (board: string[][]) => {
    for (let row of board) {
      for (let cell of row) {
        if (cell === "") {
          return false; // Grid is not full
        }
      }
    }
    return true; // Grid is full
  };

  // Function to reset the board
  const resetBoard = () => {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]);
    setCurrentPlayer("X"); // Reset the current player to X
    setGameOver(false); // Mark the game as not over
  };

  // Render the board
  const renderBoard = () => {
    // Calculate the maximum height for the board
    const maxBoardHeight = dimensions.height * 0.6;

    // Calculate a dynamic margin based on screen width
    const marginWidth = dimensions.width * 0.2; // 20% of screen width as margin

    // Dynamically subtract the margin from the width of the screen
    const windowWidth = dimensions.width - marginWidth;

    // Calculate cell size based on the minimum of width and height
    const cellSize = Math.min(windowWidth, maxBoardHeight) / 3;

    return board.map((row, rowIndex) => (
      <SafeAreaView key={rowIndex} style={[styles.row, { height: cellSize }]}>
        {row.map((cell, colIndex) => {
          let borderStyle = {};
          if (rowIndex === 1 && colIndex === 1) {
            borderStyle = styles.boxFullBorder;
          } else if (
            (rowIndex === 0 && colIndex === 1) ||
            (rowIndex === 2 && colIndex === 1)
          ) {
            borderStyle = styles.boxLeftRightBorder;
          } else if (rowIndex === 1 && (colIndex === 0 || colIndex === 2)) {
            borderStyle = styles.boxTopBottomBorder;
          }
          return (
            <TouchableOpacity
              key={colIndex}
              style={[
                styles.col,
                borderStyle,
                { width: cellSize, height: cellSize },
              ]}
              onPress={() => handleMove(rowIndex, colIndex)}
              disabled={cell !== "" || gameOver}
            >
              <Text
                style={[
                  { fontSize: cellSize * 0.5 }, // Adjust font size based on cell size
                  cell === "X" ? styles.blueGlow : styles.redGlow,
                ]}
              >
                {cell}
              </Text>
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>
    ));
  };

  // get the smallest size between the screen width and height
  // prevent scaling issue when user only expands 1 dimension
  const adjustedSizing = Math.min(dimensions.width, dimensions.height);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        <Animated.View
          style={[
            styles.innerContainer,
            {
              borderColor,
              borderRadius: adjustedSizing * 0.05,
              borderWidth: adjustedSizing * 0.006,
              padding: adjustedSizing * 0.04,
            },
          ]}
        >
          {renderBoard()}
          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                paddingVertical: adjustedSizing * 0.02,
                paddingHorizontal: adjustedSizing * 0.05,
                marginTop: adjustedSizing * 0.04,
              },
            ]}
            onPress={resetBoard}
          >
            <Text
              style={[
                styles.resetButtonText,
                { fontSize: adjustedSizing * 0.05 },
              ]}
            >
              Reset
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.smallText,
              {
                marginTop: adjustedSizing * 0.02,
                fontSize: adjustedSizing * 0.03,
              },
            ]}
          >
            Tap <Text style={styles.boldText}>reset</Text> to play
          </Text>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000d0",
  },
  row: {
    flexDirection: "row",
  },
  col: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  boxFullBorder: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  boxTopBottomBorder: {
    borderTopColor: "#fff",
    borderTopWidth: 2,
    borderBottomColor: "#fff",
    borderBottomWidth: 2,
  },
  boxLeftRightBorder: {
    borderRightColor: "#fff",
    borderRightWidth: 2,
    borderLeftColor: "#fff",
    borderLeftWidth: 2,
  },
  redGlow: {
    color: "#ea5b5b",
    textShadowColor: "#b22222",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  blueGlow: {
    color: "#45bbd8",
    textShadowColor: "#00f",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  resetButton: {
    backgroundColor: "#6305fc",
  },
  resetButtonText: {
    color: "#ccc",
  },
  smallText: {
    color: "#ccc",
  },
  boldText: {
    color: "#6999fc",
    fontWeight: "bold",
  },
});
 