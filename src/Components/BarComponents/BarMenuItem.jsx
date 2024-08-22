import React from "react";

const BarMenuItem = ({ item }) => {
  return <button className="bg-secondary-dark-bg rounded-lg">{item.title}</button>;
};

export default BarMenuItem;
