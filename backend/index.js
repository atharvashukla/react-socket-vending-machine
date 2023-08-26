class VendingMachineState {
  constructor() {
    this.state = "WAIT_FOR_MONEY";
    this.money_inserted = 0;
  }

  transition(event) {
    switch (this.state) {
      case "WAIT_FOR_MONEY":
        if (event === "insert_money") {
          this.money_inserted += 1;
          if (this.money_inserted >= 1) {
            this.state = "SUFFICIENT_FUNDS";
          }
        }
        break;

      case "SUFFICIENT_FUNDS":
        if (event === "buy_drink") {
          this.state = "DISPENSE_DRINK";
        }
        break;

      case "DISPENSE_DRINK":
        if (this.money_inserted > 1) {
          this.state = "DISPENSE_CHANGE";
        } else {
          this.state = "WAIT_FOR_MONEY";
          this.money_inserted = 0;
        }
        break;

      case "DISPENSE_CHANGE":
        this.money_inserted -= 1;
        this.state = "WAIT_FOR_MONEY";
        break;
    }
  }

  getState() {
    return this.state;
  }
}

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const vendingMachine = new VendingMachineState();

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("stateUpdated", vendingMachine.getState());

  // Listen for events from the client
  socket.on("insert_money", () => {
    vendingMachine.transition("insert_money");
    io.emit("stateUpdated", vendingMachine.getState());
  });

  socket.on("buy_drink", () => {
    vendingMachine.transition("buy_drink");
    io.emit("stateUpdated", vendingMachine.getState());
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 5001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
