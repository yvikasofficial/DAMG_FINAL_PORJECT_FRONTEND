import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
