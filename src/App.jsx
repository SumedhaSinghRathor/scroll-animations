import { Route, Routes } from "react-router-dom";
import Team from "./components/Teams/Team";
import Main from "./components/Main";
import SplitIntoThree from "./components/Split Into Three/SplitIntoThree";
import Posters from "./components/Posters/Posters";
import Fractal from "./components/Fractal/Fractal";
import Shuffle from "./components/Shuffle/Shuffle";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/teams" element={<Team />} />
      <Route path="/split-into-three" element={<SplitIntoThree />} />
      <Route path="/posters" element={<Posters />} />
      <Route path="/fractal-glass" element={<Fractal />} />
      <Route path="/shuffle" element={<Shuffle />} />
    </Routes>
  );
}

export default App;
