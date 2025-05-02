import { ReactNode } from 'react';
import classNames from 'classnames';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  elevation?: 'low' | 'medium' | 'high';
}

const Card = ({ 
  children, 
  className = '', 
  onClick, 
  interactive = false, 
  elevation = 'medium'
}: CardProps) => {
  const baseClasses = 'card transition-all duration-300';
  
  const elevationClasses = {
    low: 'shadow-sm',
    medium: 'shadow',
    high: 'shadow-lg',
  };
  
  const interactiveClasses = interactive 
    ? 'cursor-pointer transform hover:-translate-y-1 active:translate-y-0' 
    : '';
  
  const classes = classNames(
    baseClasses,
    elevationClasses[elevation],
    interactiveClasses,
    className
  );
  
  return (
    <div 
      className={classes}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

const CardHeader = ({
  children,
  className = '',
}: CardHeaderProps) => (
  <div className={classNames('p-6 pb-3', className)}>
    {children}
  </div>
);

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

const CardContent = ({
  children,
  className = '',
}: CardContentProps) => (
  <div className={classNames('p-6 pt-3', className)}>
    {children}
  </div>
);

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

const CardTitle = ({
  children,
  className = '',
}: CardTitleProps) => (
  <h3 className={classNames('text-lg font-semibold', className)}>
    {children}
  </h3>
);

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

const CardDescription = ({
  children,
  className = '',
}: CardDescriptionProps) => (
  <p className={classNames('text-sm text-gray-600', className)}>
    {children}
  </p>
);

export {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
};

export default Card;
