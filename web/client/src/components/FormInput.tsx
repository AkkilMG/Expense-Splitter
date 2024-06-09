import React from "react";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import Button from "./Button";

type InputTypeType = "text" | "email" | "password" | "number";

type FormType = {
  children?: any;
  label?: string;
  placeholder?: string;
  type?: InputTypeType;
  value?: string | number;
  error?: string;
  name?: string;
  showLeadingIcon?: boolean;
  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
};
const FormInput = ({
  children,
  label,
  type,
  placeholder,
  onChange,
  value,
  error,
  name,
  showLeadingIcon = false,
  ...props
}: FormType) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className="flex flex-col w-full my-2 max-w-80">
      <label htmlFor={type} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative w-full">
        {showLeadingIcon && (
          <div className="absolute left-0 flex items-center pl-3 mt-1 pointer-events-none inset-y-1">
            <span className="text-gray-500">$</span>
          </div>
        )}
        <input
          type={showPassword ? "text" : type}
          id={type}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          name={name}
          className={`w-full px-2 py-2 md:px-3 mt-1 rounded border border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200  focus:ring-offset-0 
        ${
          error
            ? "border-red-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200  focus:ring-offset-0"
            : " border-zinc-400"
        }
            ${showLeadingIcon ? "md:pl-7" : ""}
            `}
          {...props}
        />
        {type === "password" && !error && (
          <span className="absolute inset-y-2 right-1 text-zinc-500 ">
            <Button type="icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </Button>
          </span>
        )}
        {error && (
          <span className="absolute p-2 text-lg text-red-600 inset-y-2 right-1">
            <FiAlertCircle />
          </span>
        )}
      </div>
      {error && (
        <p className="flex items-center mt-1 text-red-600">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormInput;
