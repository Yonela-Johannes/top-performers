import { Route, Routes } from "react-router-dom";
import Country from "@/pages/Country";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/:slug" element={<Country />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
