import React, { createContext, useState } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ });
  const [companyInfo,setCompanyInfo] = useState({})

  return (
    <UserContext.Provider value={{ user, setUser,companyInfo,setCompanyInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
