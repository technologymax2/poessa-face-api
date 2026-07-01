import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import API from "../services/api";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isAuth, setIsAuth] = useState(!!token);

  useEffect(() => {
    // በሁሉም የኤፒአይ ጥሪዎች ላይ የ 401 (Unauthorized) ስህተት ከተፈጠረ 
    // ተጠቃሚውን በራስ-ሰር Logout ለማድረግ ኢንተርሴፕተር እንጨምራለን
    const interceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuth(false);
          navigate("/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    // ኮምፖነንቱ ሲጠፋ (Unmount ሲሆን) ኢንተርሴፕተሩን እናጸዳዋለን
    return () => {
      API.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // ቶክን ከሌለ በቀጥታ ወደ ሎጊን ገጽ ይመራል
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // ቶክን ካለ የተጠበቁትን ገጾች ያሳያል
  return <Outlet />;
};

export default PrivateRoute;