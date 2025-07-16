import { makeAutoObservable, values } from "mobx";
import L from "leaflet";
import { CountryName } from "@/pages/api/countries";

export class GlobalStore {
  code: string = "";
  dfLocationCoordinates: number[] = [36.56068927909548, -91.15411382855584];
  searchCode: string = "";
  searchMode: "countries" | "cities" | "states" = "countries";
  map: boolean = true;
  mapLayer: any[] = [];
  showDistance: boolean = false;
  grid: boolean = true;
  mainLand: boolean = false;
  simulation: boolean = false;
  position: "top" | "down" | "left" | "right" = "left";
  sunMoon: "sun" | "moon" | "" = "";
  addIcon: string = "";
  click: boolean = true;
  lock: boolean = false;
  isViewOn: boolean = false;
  houseView: "house-world" | "house-countries" | "" = "";
  roomView: "room-countries" | "" = "";
  floorPlanView: "floorplan-countries" | "" = "";
  boatView: "boat-world" | "boat-countries" | "" = "";
  rectangularView: "rect-country" | "rect-world" | "" = "";
  mapView: "map-world" | "map-countries" | "" = "map-world";
  tableView: "table-world" | "table-countries" | "" = "";
  moreView: "more-world" | "more-countries" | "" = "";
  moreName:
    | "world-as-function"
    | "population-view"
    | "population-view-with-country"
    | "world-problem-view"
    | "problem-view-with-country"
    | "population-view-principle-line"
    | "" = "";
  countryName: "location" | "l" | "house-distance" | "" = "";
  roomName: "room" | "r" | "" = "";
  fpRoomName: "room" | "r" | "" = "";
  rectName: "rect-map" | "rect-name" | "rect-house" | "rect-house-no-border" | "" = "";
  rectViewSetting: "rect-non-linear" | "rect-linear" | "" = "";
  rectDistanceType: "rect-distance" | "rect-shot-distance" | "" = "";
  boatName: "boat" | "b" | "" = "";
  boundaryMessage: "problem" | "natural" | "" = "";
  palletOption: "pointer" | "text" | "line" | "rectangle" | "circle" | "image" | "pallet1" | "pallet2" | "pallet3" | "pallet4" | "" = "";
  itemAnnotationStyle: any;
  listLinePallet: any[] = [];
  listRectPolygonPallet: any[] = [];
  listCirclePolygonPallet: any[] = [];
  clear: boolean = false;
  blankMap: boolean = false;
  showDialogSettingDistance: boolean = false;
  showDialogEditTextStyle: boolean = false;
  showDialogEditShapeStyle: boolean = false;
  inAreaSelection: boolean = false;
  showHouseDistance: "house-view-shot" | "house-view-distance" | "" = "";
  showRoomDistance: boolean = false;
  showFloorPlanDistance: "plan-view-shot" | "plan-view-distance" | "" = "";
  showBoatWave: boolean = false;
  showGivenSet: boolean = false;
  countryQuantity: number = 0;
  listCountryInRect: CountryName[] = [];
  showModalInsertCountry: boolean = false;
  showModalInsertNumberFunctionMoreView: boolean = false;
  showModalInsertNumberPersonMoreView: boolean = false;
  showModalInsertNumberProblemMoreView: boolean = false;
  showModalInsertNumberPerson: boolean = false;
  listMarkerFunction: any[] = [{ key: "plus", value: "plus", shape: "" }];
  listMarkerPopulation: any[] = [{ key: "plus", value: "plus", shape: "" }];
  listMarkerProblem: any[] = [{ key: "plus", value: "plus", shape: "" }];
  positionOfScroll: any[] = [];
  positionOfHorizontalLine: any[] = [];
  listPrincipleLine: any[] = [];
  statusDragPrincipleLine: boolean = false;
  numberPersonInHorizontalLine = 0;
  numberFunctionMoreView = 0;
  numberPersonMoreView = 0;
  numberProblemMoreView = 0;
  chooseGivenSet = false;
  dataScroll: any = null;
  positionOfTextPallet: any[] = [];
  listPositionOfTextPallet: any[] = [];
  positionOfImagePallet: any[] = [];
  listPositionOfImagePallet: any[] = [];
  positionOfPallet1: any[] = [];
  positionOfPallet2: any[] = [];
  positionOfPallet3: any[] = [];
  positionOfPallet4: any[] = [];
  listPositionOfPallet1: any[] = [];
  listPositionOfPallet2: any[] = [];
  listPositionOfPallet3: any[] = [];
  listPositionOfPallet4: any[] = [];
  valueOfImage: string = "";
  mapElementSelected = "";
  mapEquationSelectedPrev = "";
  listMapElementSelected: any[] = [];
  mapElementRelate = "";
  listMapElementRelate: any[] = [];
  positionOfMapElementSelected: any[] = [];
  typeMobility: "path" | "no-path" | "" = "path";
  numberPersonMobility: any = 0;
  numberEquationMobility: any = 0;
  positionOfPreviewPerson: any = [];
  showErrorInsertFunction: boolean = false;
  showErrorInsertEquation: boolean = false;
  showErrorInsertPerson: boolean = false;
  showErrorInsertRelationship: boolean = false;
  statusMovePallet: boolean = false;
  statusDisplayItem: number = 0;
  styleText: any = {};

  equationModalOpen: boolean = false;
  equationDropPosition: { lat: number, lng: number } | null = null;
  equationToAdd: { name: string, noBorder: boolean, id: number } | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setEquationModalOpen = (open: boolean) => {
    this.equationModalOpen = open;
  };

  setEquationDropPosition = (position: { lat: number, lng: number } | null) => {
    this.equationDropPosition = position;
  };

  setEquationToAdd = (eq: { name: string, noBorder: boolean, id: number } | null) => {
    this.equationToAdd = eq;
  };

  resetEquationToAdd = () => {
    this.equationToAdd = null;
  };

  setStyleText = (font: string, size: number, color: string, style: string, textAlign: string, textDecoration: string, fontWeight: string) => {
    this.styleText = {
      fontFamily: font,
      fontSize: size,
      fontColor: color,
      fontStyle: style,
      textAlign: textAlign,
    };
  };

  setStyleShape = (background: string, borderSize: number, borderColor: string) => {
    this.styleText = {
      background: background,
      borderSize: borderSize,
      borderColor: borderColor,
    };
  };

  toggleStatusMovePallet = () => {
    this.statusMovePallet = !this.statusMovePallet;
  };

  setShowErrorInsertFunction = (value: boolean) => {
    this.showErrorInsertFunction = value;
  };
  setShowErrorInsertEquation = (value: boolean) => {
    this.showErrorInsertEquation = value;
  };
  setShowErrorInsertPerson = (value: boolean) => {
    this.showErrorInsertPerson = value;
  };

  setShowErrorInsertRelationship = (value: boolean) => {
    this.showErrorInsertRelationship = value;
  };

  setDataScroll = (value: any) => {
    this.dataScroll = value;
  };
  resetDataScroll = () => {
    this.dataScroll = null;
  };

  setPositionOfScroll = (lat: number, lng: number) => {
    this.positionOfScroll = [lat, lng];
  };

  setPositionOfHorizontalLine = (lat: number, lng: number) => {
    this.positionOfHorizontalLine = [lat, lng];
  };

  resetPositionOfHorizontalLine = () => {
    this.positionOfHorizontalLine = [];
    this.numberPersonInHorizontalLine = 0;
    this.chooseGivenSet = false;
  };
  setNumberPersonInHorizontalLine = (value: number) => {
    this.numberPersonInHorizontalLine = value;
  };

  setNumberFunctionMoreView = (value: number) => {
    this.numberFunctionMoreView = value;
  };

  setNumberPersonMoreView = (value: number) => {
    this.numberPersonMoreView = value;
  };
  setNumberProblemMoreView = (value: number) => {
    this.numberProblemMoreView = value;
  };

  setPositionOfTextPallet = (lat: number, lng: number) => {
    this.positionOfTextPallet = [lat, lng];
    let id = this.listPositionOfTextPallet.length + 1;
    this.listPositionOfTextPallet.push({
      id: id,
      position: this.positionOfTextPallet,
      status: false,
      style: {
        fontFamily: "arial",
        fontSize: 13,
        fontColor: "black",
        fontStyle: [],
        textAlign: "left",
      },
    });
  };

  setStatusTextPallet = (id: any, status: boolean) => {
    for (let i = 0; i < this.listPositionOfTextPallet.length; i++) {
      if (this.listPositionOfTextPallet[i].id === id) {
        this.listPositionOfTextPallet[i].status = status;
      }
    }
  };

  setValueTextPallet = (id: any, text: string) => {
    for (let i = 0; i < this.listPositionOfTextPallet.length; i++) {
      if (this.listPositionOfTextPallet[i].id === id) {
        this.listPositionOfTextPallet[i].valueText = text;
      }
    }
  };

  updatePositionTextPalletById = (id: any, lat: any, lng: any) => {
    for (let i = 0; i < this.listPositionOfTextPallet.length; i++) {
      if (this.listPositionOfTextPallet[i].id == id) {
        this.listPositionOfTextPallet[i].position = [lat, lng];
      }
    }
  };

  updateStyleTextPalletById = (id: any, style: any) => {
    for (let i = 0; i < this.listPositionOfTextPallet.length; i++) {
      if (this.listPositionOfTextPallet[i].id == id) {
        this.listPositionOfTextPallet[i].style = style;
      }
    }
  };

  getTextPalletById = (id: any) => {
    return this.listPositionOfTextPallet.filter((item) => item.id === id)[0];
  };

  setPositionOfImagePallet = (lat: number, lng: number, id: any, bound: any) => {
    this.positionOfImagePallet = [lat, lng];
    this.listPositionOfImagePallet.push({
      id: id,
      position: this.positionOfImagePallet,
      bound: bound,
      status: false,
    });
  };

  setStatusImagePallet = (id: any, status: boolean) => {
    for (let i = 0; i < this.listPositionOfImagePallet.length; i++) {
      if (this.listPositionOfImagePallet[i].id === id) {
        this.listPositionOfImagePallet[i].status = status;
      }
    }
  };

  updateValueImagePalletById = (id: any, value: any) => {
    for (let i = 0; i < this.listPositionOfImagePallet.length; i++) {
      if (this.listPositionOfImagePallet[i].id == id) {
        this.listPositionOfImagePallet[i].valueImage = value;
      }
    }
  };

  removeImagePalletById = (id: any) => {
    this.listPositionOfImagePallet = this.listPositionOfImagePallet.filter((item) => item.id != id);
  };

  removeTextPalletById = (id: any) => {
    this.listPositionOfTextPallet = this.listPositionOfTextPallet.filter((item) => item.id != id);
  };

  setPositionOfPallet = (lat: number, lng: number, positionOfPallet: any[], listPositionOfPallet: any[]) => {
    positionOfPallet.push([lat, lng]);
    if (positionOfPallet.length === 2) {
      listPositionOfPallet.push({
        id: listPositionOfPallet.length + 1,
        position: positionOfPallet,
      });
    }
  };

  resetPositionOfPallet1 = () => {
    this.positionOfPallet1 = [];
  };

  resetPositionOfPallet2 = () => {
    this.positionOfPallet2 = [];
  };

  resetPositionOfPallet3 = () => {
    this.positionOfPallet3 = [];
  };

  resetPositionOfPallet4 = () => {
    this.positionOfPallet4 = [];
  };

  resetPositionOfAllPallet = () => {
    this.positionOfPallet1 = [];
    this.positionOfPallet2 = [];
    this.positionOfPallet3 = [];
    this.positionOfPallet4 = [];
    this.positionOfImagePallet = [];
    this.positionOfTextPallet = [];
  };

  resetListPositionOfAllPallet = () => {
    this.listPositionOfPallet1 = [];
    this.listPositionOfPallet2 = [];
    this.listPositionOfPallet3 = [];
    this.listPositionOfPallet4 = [];
    this.listPositionOfImagePallet = [];
    this.listPositionOfTextPallet = [];
  };
  setValueOfImage = (value: string) => {
    this.valueOfImage = value;
  };

  resetPositionScroll = () => {
    this.positionOfScroll = [];
  };

  setCountryQuantity = (quantity: number) => {
    this.countryQuantity = quantity;
  };

  changeCode = (code: string): void => {
    this.code = code;
    this.searchCode = "";
    this.searchMode = "countries";
    if (code !== "") {
      localStorage.setItem("dfCountryCode", `${code}`);
    }
  };

  changeDefaultCoordinates = (coordinates: number[]) => {
    this.dfLocationCoordinates = coordinates;
    if (coordinates.length > 0) {
      localStorage.setItem("dfLocationCoordinates", `${coordinates[0]},${coordinates[1]}`);
    }
  };

  changeSearchCode = (code: string): void => {
    this.searchCode = code;
  };

  changeSearchMode = (mode: "countries" | "cities" | "states"): void => {
    this.searchMode = mode;
  };

  changeSearchData = (code: string, mode: "countries" | "cities" | "states"): void => {
    this.searchCode = code;
    this.searchMode = mode;
  };

  changeActiveAreaSelection = (value: boolean): void => {
    this.inAreaSelection = value;
  };

  toggleGrid = (): void => {
    this.grid = !this.grid;
  };

  toggleMap = (): void => {
    this.map = !this.map;
    this.addIcon = "";
    this.changeStatusOfAllMapElementRelated();

    // this.searchCode = "";
    // this.searchMode = 'countries';
  };

  toggleMainLand = (bool: boolean): void => {
    if (!this.map) {
      this.mainLand = bool;
    }
  };

  changeBoundaryMessage = (message: "problem" | "natural" | "") => {
    this.boundaryMessage = message;
  };

  changePosition = (position: "top" | "down" | "left" | "right"): void => {
    this.position = position;
  };

  addIconHandle = (value: string): void => {
    if (value === this.addIcon) {
      this.addIcon = "";
    } else {
      this.addIcon = value;
    }
  };

  toggleClick = (): void => {
    this.click = !this.click;
    this.addIcon = "";
  };

  toggleLock = (): void => {
    this.lock = !this.lock;
  };

  toggleView = (value: boolean): void => {
    this.isViewOn = value;
  };

  toggleHouseView = (value: "house-world" | "house-countries" | ""): void => {
    if (value === this.houseView) {
      this.houseView = "";
      this.mapView = "map-world";
    } else {
      this.houseView = value;
      this.mapView = "";
    }
  };

  toggleCountryName = (value: "location" | "l" | "house-distance" | ""): void => {
    this.countryName = value;
  };

  toggleSimulation = (): void => {
    this.simulation = !this.simulation;
  };

  toggleShowDistance = (): void => {
    this.showDistance = !this.showDistance;
  };

  toggleClear = (): void => {
    this.clear = !this.clear;
    this.resetDataScroll();
  };

  toggleBlankMap = (): void => {
    this.blankMap = !this.blankMap;
  };

  toggleShowDialogSettingDistance = (): void => {
    this.showDialogSettingDistance = !this.showDialogSettingDistance;
  };

  toggleShowDialogEditTextStyle = (): void => {
    this.showDialogEditTextStyle = !this.showDialogEditTextStyle;
  };

  toggleShowDialogEditShapeStyle = (): void => {
    this.showDialogEditShapeStyle = !this.showDialogEditShapeStyle;
  };

  setSunMoon = (value: "sun" | "moon" | ""): void => {
    this.sunMoon = value;
  };

  toggleRoomView = (value: "room-countries" | ""): void => {
    if (value === this.roomView) {
      this.roomView = "";
      this.mapView = "map-world";
    } else {
      this.roomView = value;
      this.mapView = "";
    }
  };

  toggleRoomName = (value: "room" | "r" | ""): void => {
    this.roomName = value;
  };

  toggleHouseDistance = (value: "house-view-shot" | "house-view-distance" | ""): void => {
    if (value === this.showHouseDistance) {
      this.showHouseDistance = "";
    } else {
      this.showHouseDistance = value;
    }
  };

  toggleRoomDistance = (): void => {
    this.showRoomDistance = !this.showRoomDistance;
  };

  toggleFloorDistance = (value: "plan-view-shot" | "plan-view-distance" | "") => {
    if (value === this.showFloorPlanDistance) {
      this.showFloorPlanDistance = "";
    } else {
      this.showFloorPlanDistance = value;
    }
  };
  clearFloorDistance = () => {
    this.showFloorPlanDistance = "";
  };

  toggleFloorPlanView = (value: "floorplan-countries" | ""): void => {
    if (value === this.floorPlanView) {
      this.floorPlanView = "";
      this.mapView = "map-world";
    } else {
      this.floorPlanView = value;
      this.mapView = "";
    }
  };

  toggleFPRoomName = (value: "room" | "r" | ""): void => {
    this.fpRoomName = value;
  };

  toggleBoatView = (value: "boat-world" | "boat-countries" | ""): void => {
    if (value === this.boatView) {
      this.boatView = "";
      this.mapView = "map-world";
    } else {
      this.boatView = value;
      this.mapView = "";
    }
  };

  toggleBoatName = (value: "boat" | "b" | ""): void => {
    this.boatName = value;
  };

  toggleBoatWave = (): void => {
    this.showBoatWave = !this.showBoatWave;
  };
  toggleShowGivenSet = (): void => {
    this.showGivenSet = !this.showGivenSet;
  };

  toggleRectangularView = (value: "rect-country" | "rect-world" | ""): void => {
    if (value === this.rectangularView) {
      this.rectangularView = "";
      this.mapView = "map-world";
    } else {
      this.rectangularView = value;
      this.mapView = "";
    }
  };

  toggleRectName = (value: "rect-map" | "rect-name" | "rect-house" | "rect-house-no-border" | ""): void => {
    // if (value === this.rectName) {
    //     this.rectName = '';
    // } else {
    this.rectName = value;
    // }
  };

  toggleRectViewSetting = (value: "rect-non-linear" | "rect-linear" | ""): void => {
    // if (value === this.rectViewSetting) {
    //     this.rectViewSetting = '';
    // } else {
    this.rectViewSetting = value;
    // }
  };

  toggleRectDistanceType = (value: "rect-distance" | "rect-shot-distance" | ""): void => {
    if (value === this.rectDistanceType) {
      this.rectDistanceType = "";
    } else {
      this.rectDistanceType = value;
    }
  };

  toggleMapView = (value: "map-world" | "map-countries" | ""): void => {
    this.mapElementRelate = "";
    this.mapElementSelected = "";
    this.positionOfMapElementSelected = [];
    this.numberPersonMobility = 0;
    if (value === this.mapView) {
      this.mapView = "";
    } else {
      this.mapView = value;
      // this.mapElementSelected = '';
      // this.mapElementRelate = '';
    }
    this.togglePalletOption("");
  };

  toggleTableView = (value: "table-world" | "table-countries" | ""): void => {
    if (value === this.tableView) {
      this.tableView = "";
      this.mapView = "map-world";
    } else {
      this.tableView = value;
      this.mapView = "";
    }
  };

  toggleMoreView = (value: "more-world" | "more-countries" | ""): void => {
    if (value === this.tableView) {
      this.moreView = "";
      this.mapView = "map-world";
    } else {
      this.moreView = value;
      this.mapView = "";
    }
  };

  toggleMoreName = (value: any): void => {
    if (value === this.moreName) {
      this.moreName = "";
      this.mapView = "map-world";
    } else {
      this.moreName = value;
    }
  };

  togglePalletOption = (value: "pointer" | "text" | "line" | "rectangle" | "circle" | "image" | "pallet1" | "pallet2" | "pallet3" | "pallet4" | ""): void => {
    if (value === this.palletOption) {
      this.palletOption = "";
    } else {
      this.palletOption = value;
    }
  };

  setListLinePallet = (bound: any[]): void => {
    let id = this.listLinePallet.length + 1;
    this.listLinePallet.push({
      id: id,
      type: "line-pallet",
      latlng: bound,
      status: false,
    });
  };

  getLinePalletById = (id: any) => {
    return this.listLinePallet.filter((item) => item.id === id)[0];
  };

  setStatusLinePallet = (id: any, status: boolean) => {
    for (let i = 0; i < this.listLinePallet.length; i++) {
      if (this.listLinePallet[i].id === id) {
        this.listLinePallet[i].status = status;
      }
    }
  };

  updateLatlngLinePallet = (id: any, latlng: any) => {
    for (let i = 0; i < this.listLinePallet.length; i++) {
      if (this.listLinePallet[i].id === id) {
        this.listLinePallet[i].latlng = latlng;
      }
    }
  };

  resetListLinePallet = () => {
    this.listLinePallet = [];
  };
  setListRectPolygonPallet = (bound: any, latlngs: any, geoJson: any): void => {
    let id = this.listRectPolygonPallet.length + 1;
    if (this.listRectPolygonPallet.filter((item) => JSON.stringify(item.bound) === JSON.stringify(bound)).length === 0) {
      this.listRectPolygonPallet.push({
        id: id,
        type: "rect-polygon",
        bound: bound,
        latlngs: latlngs,
        geoJson: geoJson,
        status: false,
        fillColor: "#3388ff",
        color: "#3388ff",
        weight: 3,
      });
    }
  };

  setItemAnnotationStyling = (id: any, type: any) => {
    this.itemAnnotationStyle = {
      id: id,
      type: type,
    };
  };

  updateRectPolygonPalletByIdAndType = (id: any, type: any, fillColor: any, color: any, weight: any): void => {
    if (type === "rect-polygon") {
      for (let i = 0; i < this.listRectPolygonPallet.length; i++) {
        if (this.listRectPolygonPallet[i].id === id) {
          this.listRectPolygonPallet[i].fillColor = fillColor;
          this.listRectPolygonPallet[i].color = color;
          this.listRectPolygonPallet[i].weight = weight;
        }
      }
    } else if (type === "circle-polygon") {
      for (let i = 0; i < this.listCirclePolygonPallet.length; i++) {
        if (this.listCirclePolygonPallet[i].id === id) {
          this.listCirclePolygonPallet[i].fillColor = fillColor;
          this.listCirclePolygonPallet[i].color = color;
          this.listCirclePolygonPallet[i].weight = weight;
        }
      }
    } else {
      for (let i = 0; i < this.listLinePallet.length; i++) {
        if (this.listLinePallet[i].id === id) {
          this.listLinePallet[i].fillColor = fillColor;
          this.listLinePallet[i].color = color;
          this.listLinePallet[i].weight = weight;
        }
      }
    }
  };

  getRectPolygonPalletById = (id: any) => {
    return this.listRectPolygonPallet.filter((item) => item.id === id)[0];
  };

  setStatusRectPolygonPallet = (id: any, status: boolean) => {
    for (let i = 0; i < this.listRectPolygonPallet.length; i++) {
      if (this.listRectPolygonPallet[i].id === id) {
        this.listRectPolygonPallet[i].status = status;
      }
    }
  };

  updateBoundRectPolygonPallet = (id: any, bound: any, latlngs: any, geoJson: any) => {
    for (let i = 0; i < this.listRectPolygonPallet.length; i++) {
      if (this.listRectPolygonPallet[i].id === id) {
        this.listRectPolygonPallet[i].bound = bound;
        this.listRectPolygonPallet[i].latlngs = latlngs;
        this.listRectPolygonPallet[i].geoJson = geoJson;
      }
    }
  };

  removeRectPolygonPalletById = (id: any) => {
    this.listRectPolygonPallet = this.listRectPolygonPallet.filter((item) => item.id != id);
  };

  removeLinePalletById = (id: any) => {
    this.listLinePallet = this.listLinePallet.filter((item) => item.id != id);
  };
  removeLinePallet1ById = (id: any) => {
    this.listPositionOfPallet1 = this.listPositionOfPallet1.filter((item) => item.id != id);
  };
  removeLinePallet2ById = (id: any) => {
    this.listPositionOfPallet2 = this.listPositionOfPallet2.filter((item) => item.id != id);
  };
  removeLinePallet3ById = (id: any) => {
    this.listPositionOfPallet3 = this.listPositionOfPallet3.filter((item) => item.id != id);
  };
  removeLinePallet4ById = (id: any) => {
    this.listPositionOfPallet4 = this.listPositionOfPallet4.filter((item) => item.id != id);
  };

  removeCirclePolygonPalletById = (id: any) => {
    this.listCirclePolygonPallet = this.listCirclePolygonPallet.filter((item) => item.id != id);
  };

  resetListRectPolygonPallet = () => {
    this.listRectPolygonPallet = [];
  };

  resetListCirclePolygonPallet = () => {
    this.listCirclePolygonPallet = [];
  };

  setListCirclePolygonPallet = (bound: any[], radius: any, geoJson: any): void => {
    let id = this.listCirclePolygonPallet.length + 1;
    if (this.listCirclePolygonPallet.filter((item) => JSON.stringify(item.bound) === JSON.stringify(bound) && item.radius === radius).length === 0) {
      this.listCirclePolygonPallet.push({
        id: id,
        type: "circle-polygon",
        bound: bound,
        radius: radius,
        geoJson: geoJson,
        status: false,
        fillColor: "#3388ff",
        color: "#3388ff",
        weight: 3,
      });
    }
  };

  getCirclePolygonPalletById = (id: any) => {
    return this.listCirclePolygonPallet.filter((item) => item.id === id)[0];
  };

  updateBoundCirclePolygonPallet = (id: any, bound: any) => {
    for (let i = 0; i < this.listCirclePolygonPallet.length; i++) {
      if (this.listCirclePolygonPallet[i].id === id) {
        this.listCirclePolygonPallet[i].bound = bound;
      }
    }
  };

  setStatusCirclePolygonPallet = (id: any, status: boolean) => {
    for (let i = 0; i < this.listCirclePolygonPallet.length; i++) {
      if (this.listCirclePolygonPallet[i].id === id) {
        this.listCirclePolygonPallet[i].status = status;
      }
    }
  };

  setTypeMobility = (value: "path" | "no-path"): void => {
    if (value === this.typeMobility) {
      this.typeMobility = "";
    } else {
      this.typeMobility = value;
    }
  };

  setNumberPersonMobility = (): void => {
    this.numberPersonMobility = this.numberPersonMobility + 1;
  };

  resetNumberPersonMobility = (): void => {
    this.numberPersonMobility = 0;
  };

  resetNumberEquationMobility = (): void => {
    this.numberEquationMobility = 0;
  };

  setPositionOfPreviewPerson = (lat: number, lng: number) => {
    this.positionOfPreviewPerson = [lat, lng];
  };

  toggleModalInsertCountry = (): void => {
    this.showModalInsertCountry = !this.showModalInsertCountry;
  };

  toggleModalNumberFunctionMoreView = (): void => {
    this.showModalInsertNumberFunctionMoreView = !this.showModalInsertNumberFunctionMoreView;
  };

  toggleModalInsertNumberProblemMoreView = (): void => {
    this.showModalInsertNumberProblemMoreView = !this.showModalInsertNumberProblemMoreView;
  };

  toggleModalNumberPersonMoreView = (): void => {
    this.showModalInsertNumberPersonMoreView = !this.showModalInsertNumberPersonMoreView;
  };
  toggleModalInsertNumberPerson = (): void => {
    this.showModalInsertNumberPerson = !this.showModalInsertNumberPerson;
  };

  setListCountryInRect = (countries: CountryName[]): void => {
    this.listCountryInRect = countries;
  };

  addCountryToRect = (country: CountryName): void => {
    if (country && country.fullName !== "") {
      this.listCountryInRect.push(country);
    }
  };

  removeCountryToRect = (country: any): void => {
    this.listCountryInRect = this.listCountryInRect.filter((item: any) => item.codeName !== country);
  };

  removeVerticalIcon = (): void => {
    this.numberPersonInHorizontalLine = this.numberPersonInHorizontalLine - 1;
  };

  setChooseGivenSet = (value: boolean): void => {
    this.chooseGivenSet = value;
  };

  removeHorizontalIcon = (): void => {
    this.positionOfHorizontalLine = [];
    this.numberPersonInHorizontalLine = 0;
  };

  addMarkerFnToList = (index: number): void => {
    if (this.listMarkerFunction.filter((item) => item.key == index).length === 0) {
      this.listMarkerFunction.push({ key: index, value: "Function " + index, shape: "rectangle", isShow: true });
    } else {
      this.updateStatusDisplayListMarkerFunctionByName("Function " + index, true);
    }
    this.listMarkerFunction = this.listMarkerFunction.sort(this.customSort);
  };

  updateNameItemListMarkerFunctionByName = (name: any, newName: any) => {
    for (let i = 0; i < this.listMarkerFunction.length; i++) {
      if (this.listMarkerFunction[i].value === name) {
        this.listMarkerFunction[i].value = newName;
      }
    }
  };
  updateStatusDisplayListMarkerFunctionByName = (name: any, status: boolean) => {
    for (let i = 0; i < this.listMarkerFunction.length; i++) {
      if (this.listMarkerFunction[i].value === name) {
        this.listMarkerFunction[i].isShow = status;
        this.statusDisplayItem++;
      }
    }
  };

  resetListMarkerFunction = (): void => {
    this.listMarkerFunction = [this.listMarkerFunction.pop()];
  };

  addMarkerFnToNearLast = (index: number): void => {
    if (this.listMarkerFunction.filter((item) => item.key == index).length === 0) {
      let newElement = { key: index, value: "Function " + index, shape: "rectangle" };
      let positionBeforeEnd =
        this.listMarkerFunction.filter((item) => item.key === "dot").length === 0 ? this.listMarkerFunction.length - 1 : this.listMarkerFunction.length - 2;
      this.listMarkerFunction.splice(positionBeforeEnd, 0, newElement);
    }
  };

  addMarkerPersonToNearLast = (index: number): void => {
    if (this.listMarkerPopulation.filter((item) => item.key == index).length === 0) {
      let newElement = { key: index, value: "Person  " + index };
      let positionBeforeEnd =
        this.listMarkerPopulation.filter((item) => item.key === "dot").length === 0
          ? this.listMarkerPopulation.length - 1
          : this.listMarkerPopulation.length - 2;
      this.listMarkerPopulation.splice(positionBeforeEnd, 0, newElement);
    }
  };

  addMarkerProblemToNearLast = (index: number): void => {
    if (this.listMarkerProblem.filter((item) => item.key == index).length === 0) {
      let newElement = { key: index, value: "Problem  " + index };
      let positionBeforeEnd =
        this.listMarkerProblem.filter((item) => item.key === "dot").length === 0 ? this.listMarkerProblem.length - 1 : this.listMarkerProblem.length - 2;
      this.listMarkerProblem.splice(positionBeforeEnd, 0, newElement);
    }
  };

  updateStatusDisplayListMarkerProblemByName = (name: any, status: boolean) => {
    for (let i = 0; i < this.listMarkerProblem.length; i++) {
      if (this.listMarkerProblem[i].value === name) {
        this.listMarkerProblem[i].isShow = status;
        this.statusDisplayItem++;
      }
    }
  };

  resetListMarkerPopulation = (): void => {
    this.listMarkerPopulation = [this.listMarkerPopulation.pop()];
  };

  resetListMarkerProblem = (): void => {
    this.listMarkerProblem = [this.listMarkerProblem.pop()];
  };

  setShapeOfMarkerFn = (name: number, shape: string): void => {
    for (let i = 0; i < this.listMarkerFunction.length; i++) {
      if (this.listMarkerFunction[i].value === name) {
        this.listMarkerFunction[i].shape = shape;
      }
    }

    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].name === name) {
        this.mapLayer[i].shape = shape;
      }
    }
  };
  setShapeOfMarkerPl = (name: number, shape: string): void => {
    for (let i = 0; i < this.listMarkerProblem.length; i++) {
      if (this.listMarkerProblem[i].value === name) {
        this.listMarkerProblem[i].shape = shape;
      }
    }
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].name === name) {
        this.mapLayer[i].shape = shape;
      }
    }
  };

  removeMarkerFnList = (index: number): void => {
    this.listMarkerFunction = this.listMarkerFunction.filter((item: any) => item.key != index);
  };

  addMarkerPopulationToList = (index: number): void => {
    if (this.listMarkerPopulation.filter((item) => item.key == index).length === 0) {
      this.listMarkerPopulation.push({ key: index, value: "Person  " + index });
    }
    this.listMarkerPopulation = this.listMarkerPopulation.sort(this.customSort);
  };
  customSort = (a: any, b: any) => {
    const keyA = a.key;
    const keyB = b.key;

    // Check if the keys are numbers
    const isANumber = typeof keyA === "number";
    const isBNumber = typeof keyB === "number";

    if (isANumber && isBNumber) {
      return keyA - keyB; // Compare as numbers
    } else if (isANumber) {
      return -1; // 'a' is a number, comes first
    } else if (isBNumber) {
      return 1; // 'b' is a number, comes first
    } else {
      // Both are non-numeric strings, compare them
      return keyA.localeCompare(keyB);
    }
  };

  removeMarkerPopulationList = (index: number): void => {
    this.listMarkerPopulation = this.listMarkerPopulation.filter((item: any) => item.key != index);
  };

  addMarkerProblemToList = (index: number, shape: string): void => {
    if (this.listMarkerProblem.filter((item) => item.key == index).length === 0) {
      this.listMarkerProblem.push({ key: index, value: "Problem " + index, shape: shape, isShow: true });
    } else {
      this.updateStatusDisplayListMarkerProblemByName("Problem " + index, true);
    }
    this.listMarkerProblem = this.listMarkerProblem.sort(this.customSort);
  };

  setMapElementSelected = (value: any): void => {
    this.mapElementSelected = value;
  };

  setMapEquationSelectedPrev = (value: any): void => {
    this.mapEquationSelectedPrev = value;
  } 

  resetListMapElementSelected = () => {
    this.listMapElementSelected = [];
  };

  checkListMapElementSelectedContainElementNotRelate = () => {
    for (let i = 0; i < this.listMapElementSelected.length; i++) {
      if (!this.listMapElementSelected[i].status) {
        this.listMapElementSelected = this.listMapElementSelected.filter((item: any) => item.id !== this.listMapElementSelected[i].id);
        return true;
      }
    }
    return false;
  };

  setListMapElementSelected = (value: any, noBorder?: boolean): void => {
    let id = this.listMapElementSelected.length;
    this.checkListMapElementSelectedContainElementNotRelate();
    this.listMapElementSelected.push({
      id: id,
      name: value,
      position: [],
      status: false,
      related: null,
      statusRelate: false,
      noBorder: noBorder,
    });
  };
  checkMapLayerRelationship = (lat: any, lng: any) => {
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].lat === lat && this.mapLayer[i].lng === lng && this.mapLayer[i].relationship) {
        return true;
      }
    }
    return false;
  };

  updateMapLayerRelationshipByLatLng = (lat: any, lng: any) => {
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].lat === lat && this.mapLayer[i].lng === lng) {
        this.mapLayer[i].relationship = true;
      }
    }
  };

  setPersonToListMapElementSelected = (value: any, lat: any, lng: any, relate: any): void => {
    if (!this.checkMapLayerRelationship(lat, lng)) {
      let id = this.listMapElementSelected.length;
      this.listMapElementSelected.push({
        id: id,
        name: value,
        position: [lat, lng],
        status: true,
        related: relate,
        statusRelate: false,
      });
      this.listMapElementRelate.push(relate);
      this.updateMapLayerRelationshipByLatLng(lat, lng);
    } else {
      this.showErrorInsertRelationship = true;
    }
  };

  setEquationToListMapElementSelected = (value: any, lat: any, lng: any, relate: any): void => {
    if (!this.checkMapLayerRelationship(lat, lng)) {
      let id = this.listMapElementSelected.length;
      this.listMapElementSelected.push({
        id: id,
        name: value,
        position: [lat, lng],
        status: true,
        related: relate,
        statusRelate: false,
      });
      this.listMapElementRelate.push(relate);
      this.updateMapLayerRelationshipByLatLng(lat, lng);
    } else {
      this.showErrorInsertRelationship = true;
    }
  };

  changePositionOfMapElementSelected = (lat: any, lng: any, id: any): void => {
    this.listMapElementSelected.map((item) => {
      if (item.id === id) {
        item.position = [lat, lng];
      }
    });
  };

  changeRelateNameOfMapElementSelected = (name: string, id: any): void => {
    this.listMapElementSelected.map((item) => {
      if (item.id === id) {
        item.relateName = name;
      }
    });
  };

  changeStatusOfMapElementSelected = (status: any, id: any): void => {
    this.listMapElementSelected.map((item) => {
      if (item.id === id) {
        item.status = status;
      }
    });
  };

  changeStatusOfMapElementRelated = (status: any, id: any): void => {
    this.listMapElementSelected.map((item) => {
      if (item.id === id) {
        item.statusRelate = status;
      }
    });
  };

  changeStatusOfAllMapElementRelated = (): void => {
    this.listMapElementSelected = this.listMapElementSelected.map((item) => {
      return {
        ...item,
        statusRelate: false,
      };
    });
  };

  setListMapElementRelate = (value: any, id: any): void => {
    this.listMapElementRelate.push(value);
    this.listMapElementSelected.map((item) => {
      if (item.id === id) {
        item.related = value;
      }
    });
  };

  resetListMapElementRelate = (): void => {
    this.listMapElementRelate = [];
  };

  setPositionOfMapElementSelected = (lat: number, lng: number) => {
    this.positionOfMapElementSelected = [lat, lng];
  };

  setMapLayer = (lat: any, lng: any, name: any, type: any, shape?: any) => {
    let id = this.mapLayer.length + 1;
    if (this.mapLayer.filter((item) => item.lat === lat && item.lng === lng && item.type === type).length === 0) {
      this.mapLayer.push({ id: id, lat: lat, lng: lng, name: name, type: type, isShow: true, shape: shape });
    } else {
      for (let i = 0; i < this.mapLayer.length; i++) {
        if (this.mapLayer[i].lat === lat && this.mapLayer[i].lng === lng && this.mapLayer[i].type === type) {
          this.mapLayer[i].isShow = true;
          this.mapLayer[i].shape = shape;
        }
      }
    }
  };

  updateNameItemMapLayerByNameAndType = (name: any, type: any, newName: any) => {
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].name === name && this.mapLayer[i].type === type) {
        this.mapLayer[i].name = newName;
      }
    }
  };

  updateStatusDisplayMapLayerByNameAndType = (name: any, type: any, status: boolean) => {
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].name === name && this.mapLayer[i].type === type) {
        this.mapLayer[i].isShow = status;
      }
    }
  };

  resetMapLayer = () => {
    this.mapLayer = [];
  };

  updateLatLngMapLayerById = (lat: any, lng: any, id: any) => {
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].id === id) {
        this.mapLayer[i].lat = lat;
        this.mapLayer[i].lng = lng;
      }
    }
  };

  updateMapLayerById = (lat: any, lng: any, type: "person" | "function", name: any, mobility: boolean) => {
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].type === type && this.mapLayer[i].name === name) {
        this.mapLayer[i].lat = lat;
        this.mapLayer[i].lng = lng;
        this.mapLayer[i].mobility = mobility;
      }
    }
  };

  updateRelationshipMapLayerById = (lat: any, lng: any, type: "person", name: any, relationship: boolean) => {
    for (let i = 0; i < this.mapLayer.length; i++) {
      if (this.mapLayer[i].type === type && this.mapLayer[i].name === name) {
        this.mapLayer[i].lat = lat;
        this.mapLayer[i].lng = lng;
        this.mapLayer[i].relationship = relationship;
      }
    }
  };

  removeMapLayerById = (type: "person" | "function", name: any) => {
    this.mapLayer = this.mapLayer.filter((item: any) => item.type !== type && item.name !== name);
  };

  toggleStatusDragPrincipleLine = () => {
    this.statusDragPrincipleLine = !this.statusDragPrincipleLine;
  };

  setListPrincipleLine = (position: any[], numberPerson: number) => {
    let id = this.listPrincipleLine.length + 1;
    this.listPrincipleLine.push({
      id: id,
      position: position,
      numberPerson: numberPerson,
      addGivenSetStatus: false,
      haveGivenSet: this.showGivenSet,
    });
  };

  updatePositionListPrincipleLineById = (position: any[], id: any) => {
    for (let i = 0; i < this.listPrincipleLine.length; i++) {
      if (this.listPrincipleLine[i].id === id) {
        this.listPrincipleLine[i].position = position;
      }
    }
  };

  setNumberPersonForPrincipleLine = (id: number, numberPerson: number) => {
    for (let i = 0; i < this.listPrincipleLine.length; i++) {
      if (this.listPrincipleLine[i].id === id) {
        this.listPrincipleLine[i].numberPerson = numberPerson;
      }
    }
  };

  setStatusGivenSetForPrincipleLine = (id: number, addGivenSetStatus: boolean) => {
    for (let i = 0; i < this.listPrincipleLine.length; i++) {
      if (this.listPrincipleLine[i].id === id) {
        this.listPrincipleLine[i].addGivenSetStatus = addGivenSetStatus;
      }
    }
  };

  resetListPrincipleLine = () => {
    this.listPrincipleLine = [];
  };
}
