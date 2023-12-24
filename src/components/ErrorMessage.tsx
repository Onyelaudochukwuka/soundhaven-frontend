interface ErrorMessageProps {
  message?: string; // Making the message optional
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) {
    return null; // Don't render anything if there's no message
  }

  return (
    <div className="text-red-500">
      {message}
    </div>
  );
};

export default ErrorMessage;
