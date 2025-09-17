import React from "react";
import MainBanner from "../Components/MainBanner";
import Categories from "../Components/Categories";
import BestSeller from "../Components/BestSeller";
import BoottomBanner from "../Components/BoottomBanner";
import NewsLetter from "../Components/NewsLetter";

const Home = () => {
  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <BestSeller />
      <BoottomBanner />
      <NewsLetter />
    </div>
  );
};

export default Home;
