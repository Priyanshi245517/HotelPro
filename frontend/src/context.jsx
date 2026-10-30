import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
const Auth = createContext(null);
export function AuthProvider({children}) {
  const [user,setUser] = useState(null), [loading,setLoading] = useState(true);
  useEffect(()=>{ if(localStorage.getItem("hotelpro_token")) api.get("/auth/me").then(r=>setUser(r.data.user)).catch(()=>{localStorage.removeItem("hotelpro_token");}).finally(()=>setLoading(false)); else setLoading(false); },[]);
  const login = async (email,password) => { const {data}=await api.post("/auth/login",{email,password}); localStorage.setItem("hotelpro_token",data.token); setUser(data.user); };
  const register = async (payload) => { const {data}=await api.post("/auth/register",payload); localStorage.setItem("hotelpro_token",data.token); setUser(data.user); };
  const logout = () => { localStorage.removeItem("hotelpro_token"); setUser(null); };
  return <Auth.Provider value={{user,loading,login,register,logout}}>{children}</Auth.Provider>;
}
export const useAuth=()=>useContext(Auth);
