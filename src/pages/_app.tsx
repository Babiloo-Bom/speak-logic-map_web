import Layout from "@/components/Layout/Layout";
import { RootStoreProvider } from "@/providers/RootStoreProvider";
import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import RouteGuard from "@/components/Auth/RouteGuard";

declare global {
  interface Window {
    eFunction: number[];
    aFunction: number[];
    natural: number[];
    nonNatural: number[];
    addedFunction: number[];
    existingFunction: number[];
    UnT: number[];
    HnT: number[];
    problem: string;
    MathJax: any;
    openRenameModal: () => void;
    edittingItem: () => void;
    handleRemoveTempList: () => void;
    getSelectedList: (_event: any) => void;
    setProfile: (event: any) => void;
    fnAddImg: (event: any) => void;
    fnAddAudio: (event: any) => void;
    fnAddVideo: (event: any) => void;
    replaceFnWithImg: (event: any) => void;
    replaceFnWithAudio: (event: any) => void;
    replaceFnWithVideo: (event: any) => void;
    changeShape: (shape: any) => void;
    // makeGroup: () => void;
    handleAddProblem: (name: any) => void;
    changeShapeProblem: (shape: any) => void;
    deleteItem: () => void;
    changeShapeOption: (shape: any) => void;
    deleteGroup: () => void;
    changeRoute: () => void;
    deleteInterRoute: () => void;
    changeDistance: () => void;
    deleteDistanceLine: () => void;
    closePopupScan: () => void;
    deleteHouse: () => void;
    deleteProblem: () => void;
    handlePopulateFn: (object: any, input: any) => void;
    openPopulateModal: () => void;
    makeGroupFromCountry: (type: any) => void;
    handleAddFunction: (event: any, name: any, index: any) => void;
    handleToggleBoundaryFn: () => void;
    handleToggleFlasingFn: () => void;
    renamePerson: () => void;
    handleShowSingleFunction: () => void;
    handleShowGroupFunction: () => void;
    openChangeSizeCountryModal: () => void;
    openRenameCountryModal: () => void;
    changeNameCountryFn: (firstName: any, secondName: any) => void;
    changeSizeCountryFn: (width: any, height: any) => void;
    changeShapeCountryFn: (shape: any) => void;
    deleteCountryFn: () => void;
    changeToStopFunction: () => void;
    changeToTemporaryFunction: () => void;
    deleteStopFn: () => void;
    deleteTempFn: () => void;
    changeShapeStopFn: (shape: any) => void;
    changeShapeTempFn: (shape: any) => void;
    handleShowDistance: () => void;
    addToMainSet: (_event: any) => void;
    deleteMainSet: () => void;
    roomAddImg: (event: any) => void;
    roomAddAudio: (event: any) => void;
    roomAddVideo: (event: any) => void;
    replaceRoomWithImg: (event: any) => void;
    replaceRoomWithAudio: (event: any) => void;
    replaceRoomWithVideo: (event: any) => void;
    defaultRoom: () => void;
    replaceGroupWithImg: (event: any) => void;
    replaceGroupWithAudio: (event: any) => void;
    replaceGroupWithVideo: (event: any) => void;
    openModalInsertCountryToRect: (event: any) => void;
    // showBlankMap: (event: any) => void;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RootStoreProvider>
      <RouteGuard>
        <Layout>
          <div id="app-modal" />
          <Component {...pageProps} />
        </Layout>
      </RouteGuard>
    </RootStoreProvider>
  );
}
