import {
  DistanceIcon,
  FunctionIcon,
  FunctionPerformanceIcon,
  HouseIcon,
  LeftArrowIcon,
  MainsetIcon,
  MobilityIcon,
  PersonIcon,
  PhilosophyIcon,
  PrincipleLineIcon,
  RelatedIcon,
  RightArrowIcon,
  EquationIcon,
  VectorIcon,
  WelcomeSignIcon,
} from "@/components/Icons/Icons";
import { useGlobalStore } from "@/providers/RootStoreProvider";
import { ItemInterface } from "@/utils/util_interfaces";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import MainItems from "./ToolItems/MainItems";
import SwitchOptions from "./ToolItems/SwitchOptions";
import styles from "./_RearTools.module.scss";

const RearTools: React.FC = (): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const globalStore = useGlobalStore();

  let isSelectedMoreViewFunction = globalStore.moreName === "world-as-function";
  let isSelectedMoreViewPerson =
    globalStore.moreName === "population-view" ||
    globalStore.moreName === "population-view-with-country" ||
    globalStore.moreName === "population-view-principle-line";
  let ability = isSelectedMoreViewPerson || isSelectedMoreViewFunction;

  const ItemList: ItemInterface[] = [
    { value: "function", Icon: FunctionIcon, name: "Function", ability: true },
    { value: "person", Icon: PersonIcon, name: "Person", ability: true },
    { value: "main-set", Icon: MainsetIcon, name: "The Given Set", ability: true },
    { value: "house", Icon: HouseIcon, name: "House", ability: true },
    { value: "inter-route", Icon: VectorIcon, name: "Inter-route", ability: true },
    { value: "distance", Icon: DistanceIcon, name: "Distance", ability: true },
    { value: "philosophy", Icon: PhilosophyIcon, name: "Philosophy", ability: false },
    { value: "welcome-sign", Icon: WelcomeSignIcon, name: "Welcome", ability: true },
    { value: "scroll-feature", Icon: FunctionPerformanceIcon, name: "Function Performance", ability: true },
    { value: "horizontal-line", Icon: PrincipleLineIcon, name: "Principle Line", ability: true },
    { value: "relate", Icon: RelatedIcon, name: "Relate", ability: true },
    { value: "mobility", Icon: MobilityIcon, name: "Mobility", ability: true },
    { value: "equation", Icon: EquationIcon, name: "Equation", ability: true },
  ];

  return (
    <div className={`${styles["rear-tools-wrap"]} ${isExpanded ? styles["expanded"] : styles["minimal"]}`}>
      <div className={`${styles["rear-tools-content"]}`}>
        <div className={`${styles["optional-tools"]}`}>
          <div className={`${styles["expand-tools"]}`}>{isExpanded && <SwitchOptions isExpanded={isExpanded} />}</div>
          <button type="button" className={`${styles["expand-btn"]}`} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <LeftArrowIcon /> : <RightArrowIcon />}
          </button>
        </div>
        <div className={`${styles["main-tools"]}`}>
          {ItemList.map((item, index) => (
            <MainItems key={index} isExpanded={isExpanded} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default observer(RearTools);
