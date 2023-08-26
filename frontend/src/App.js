import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:5001";

function App() {
  const [machineState, setMachineState] = useState("WAIT_FOR_MONEY");
  const [moneyInserted, setMoneyInserted] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = socketIOClient(ENDPOINT);

    setSocket(socketInstance);

    socketInstance.on("stateUpdated", (updatedState) => {
      setMachineState(updatedState);

      if (updatedState === "WAIT_FOR_MONEY") {
        setMoneyInserted(0);
      } else if (
        updatedState === "SUFFICIENT_FUNDS" ||
        updatedState === "DISPENSE_DRINK"
      ) {
        setMoneyInserted((prev) => prev + 1);
      } else if (updatedState === "DISPENSE_CHANGE") {
        setMoneyInserted((prev) => prev - 1);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleInsertMoney = () => {
    socket.emit("insert_money");
  };

  const handleBuyDrink = () => {
    socket.emit("buy_drink");
  };

  return (
    <div className="App">
      <h1>Vending Machine</h1>
      <p>Current State: {machineState}</p>
      <p>Money Inserted: ${moneyInserted}</p>
      <hr />
      <h2>Actions</h2>
      <button onClick={handleInsertMoney}>Insert Money</button>
      <button onClick={handleBuyDrink}>Buy Drink</button>
    </div>
  );
}

export default App;
