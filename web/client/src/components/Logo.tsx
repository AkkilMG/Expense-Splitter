import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/">
      <span className="sr-only">Cash.it</span>
      <p className="text-2xl font-bold">
        Cash<span className="text-blue-600">.it</span>
      </p>
    </Link>
  );
};

export default Logo;
