import { useEffect, useRef, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react';

const variantClasses = {
  primary: 'bg-emerald-500 text-black hover:bg-emerald-400 font-bold',
  secondary: 'bg-white/10 text-white hover:bg-white/20 font-semibold',
  custom: 'font-bold', // colours come from className, e.g. a team's button
};

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: keyof typeof variantClasses;
  children: ReactNode;
}

// Taps this soon after a button appears are ignored, so a double tap can't also press the button on the next screen
export const ARM_DELAY_MS = 500;

// Big enough to hit easily on a phone
export function Button({ variant = 'primary', children, className = '', type = 'button', onClick, ...props }: ButtonProps) {
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (Date.now() - shownAt.current < ARM_DELAY_MS) {
      e.preventDefault(); // also stops a submit button submitting its form
      return;
    }
    onClick?.(e);
  };

  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-5 py-3 text-lg rounded-xl cursor-pointer transition active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-40 disabled:pointer-events-none';
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} type={type} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
