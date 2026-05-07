import React, { memo } from "react";

const Button = memo(function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...rest
}) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
});

export default Button;
