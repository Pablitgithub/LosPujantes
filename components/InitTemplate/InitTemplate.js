import React from "react";
import styles from "./styles.module.css";
import Card from "../Card/Card";

const InitTemplate = ({ children }) => {
  return (
    <div className={styles.container}>
      <Card>{children}</Card>
    </div>
  );
};

export default InitTemplate;
