import { useEffect, useState } from 'react';
import { validateToken, getToken } from '@/services/apiService';

export default function useValidateToken() {
  console.log("useValidateToken hook executing"); // Log when the hook is executing

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const currentToken = getToken(); 
    console.log("Current token in useEffect:", currentToken); // Log the current token

    if (currentToken) {
      validateToken()
        .then(() => {
          console.log("Token is valid"); // Log if the token validation is successful
          setIsValid(true);
        })
        .catch(() => {
          console.log("Token validation failed"); // Log if the token validation fails
          setIsValid(false);
        });
    } else {
      console.log("No token found or token is empty");
    }
  }, [getToken()]);

  return isValid;
}
