const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

const Button = ({ variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`${variants[variant]} ${className}`.trim()}
      type="button"
      {...props}
    />
  )
}

export default Button
