// components/shared/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    children: React.ReactNode;
  }
  
  export const Button = ({ 
    variant = 'primary', 
    children, 
    className = '',
    ...props 
  }: ButtonProps) => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors';
    
    const variants = {
      primary: 'bg-purple-600 text-white hover:bg-purple-700',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      ghost: 'text-gray-600 hover:bg-gray-100'
    };
  
    return (
      <button 
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };