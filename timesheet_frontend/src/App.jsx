import { Routes, Route } from "react-router-dom";
import Login from "./container/Login";
import Timesheet from "./container/Timesheet";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/timesheet" element={<Timesheet />} />
    </Routes>
  );
}

export default App;