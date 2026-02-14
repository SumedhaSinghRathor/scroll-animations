import { Link } from "react-router-dom";

function Main() {
  return (
    <div>
      <ol>
        <li>
          <Link to="/teams">Teams</Link>
        </li>
        <li>
          <Link to="/split-into-three">Split Into Three</Link>
        </li>
        <li>
          <Link to="/posters">Posters</Link>
        </li>
        <li>
          <Link to="/fractal-glass">Fractal Glass</Link>
        </li>
        <li>
          <Link to="/shuffle">Shuffle</Link>
        </li>
      </ol>
    </div>
  );
}

export default Main;
