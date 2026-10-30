import { Route, Routes } from "react-router-dom";
import Country from "@/pages/Country";
import Developer from "@/pages/Developer";
import Developers from "@/pages/Developers";
import Explore from "@/pages/Explore";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    {/* Static segments must be declared before the country slug route. */}
    <Route path="/explore" element={<Explore />} />
    <Route path="/developers" element={<Developers />} />
    <Route path="/developer/:username" element={<Developer />} />
    <Route path="/:slug" element={<Country />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
