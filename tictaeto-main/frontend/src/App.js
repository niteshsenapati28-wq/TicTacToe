import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TicTacToe } from "@/components/TicTacToe";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TicTacToe />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
