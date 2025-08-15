import React from "react";
import { AuthContext } from "./AuthContextBase";

const useAuth = () => React.useContext(AuthContext);

export default useAuth;
