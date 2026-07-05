
import { useLocation } from "react-router-dom";

const Liveness = () => {
  const { state } = useLocation();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Liveness Detection
      </h1>

      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};

export default Liveness;
