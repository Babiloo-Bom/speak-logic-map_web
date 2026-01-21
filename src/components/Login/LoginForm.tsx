import { useUserStore } from "@/providers/RootStoreProvider";
import { useRouter } from "next/router";
import React, { useState } from "react";
import styles from "./_Login.module.scss";
import Image from "next/image";
import { observer } from "mobx-react-lite";

const LoginForm: React.FC = (): JSX.Element => {
  const userStore = useUserStore();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const Router = useRouter();

  return (
    <div id="form-1" className={styles["container"]}>
      <div className={styles["title"]}>Laboon Map</div>
      <button type="button" className={styles["socail-button"]}>
        <span className={styles["socail-icon"]}>
          <Image className={styles["socail-icon"]} alt="google" src="/Group_43.svg" height={30} width={30} />
        </span>
        Login with Google
      </button>
      <button
        type="button"
        style={{
          backgroundColor: " #3284F4",
          color: "#fff",
          marginBottom: "30px",
        }}
        className={styles["socail-button"]}
      >
        <span className={styles["socail-icon"]}>
          <Image alt="facebook" src="/Group_42.svg" height={30} width={30} />
        </span>
        Login with Facebook
      </button>
      <div className={styles["separations"]}>
        <span className={styles["separation"]}></span>
        <span className={styles["separations-text"]}>or</span>
        <span className={styles["separation"]}></span>
      </div>
      <label className={styles["label"]} htmlFor="email">
        Username:
      </label>
      <div className="form__name">
        <input
          id="email"
          className={styles["input"]}
          placeholder="Enter user name"
          type="email"
          name="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <span className="form-message"></span>
      </div>

      <label className={styles["label"]} htmlFor="password">
        Password:
      </label>
      <div className="form__name">
        <input
          name="password"
          id="password"
          type="password"
          className={styles["input"]}
          placeholder="Enter password"
          onKeyUp={(e) => {
            if (e.key === "Enter" && username === "worldmap@example.com" && password === "laboon") {
              userStore.setUser(username, password);
              Router.push("/");
            }
          }}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="form-message"></span>
      </div>
      <div className={styles["login-button-wrapper"]}>
        <h4 className={styles["error-login"]}>Private only, not security & not save your information.</h4>
        <button
          onClick={() => {
            if (username === "worldmap" && password === "laboon") {
              userStore.setUser(username, password);
              Router.push("/");
            }
          }}
          id="submit"
          type="button"
          className={styles["login-button"]}
        >
          {/* <LoadingIcon className={styles["login-icon"]} />
          <WarningIcon className={styles["login-icon"]} /> */}
          Login
        </button>
      </div>
      <div className={styles["suggestion"]}>
        <a className={styles["link"]}>Register</a> or <a className={styles["link"]}>Forgot your password</a>
      </div>
    </div>
  );
};

export default observer(LoginForm);
