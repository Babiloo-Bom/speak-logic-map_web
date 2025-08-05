/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw';
import "leaflet-image-transform/dist/L.ImageOverlay.Transform.min";
import "@elfalem/leaflet-curve";
import "leaflet-textpath";
import "leaflet-arrowheads";
import {observer} from "mobx-react-lite";
import {useMap, useMapEvents} from "react-leaflet";
import {useGlobalStore, useSimulationSettingStore} from '@/providers/RootStoreProvider';
import "@bopen/leaflet-area-selection/dist/index.css";
import {DrawAreaSelection} from "@bopen/leaflet-area-selection";
import * as turf from '@turf/turf';

import styles from '../_MapContents.module.scss';

import {
    boatPopup,
    imagePalletPopup,
    worldPopup,
    wrappingPopup
} from '../Popups/Popups'

import {
    markerPersonIndex, markerGivenSet,
    selectedList,
    markerProblemIndex,
    markerHouseIndex, markerCountryFnIndex,
    markerFnIndex, markerPrincipleLineIndex, markerTextPalletIndex
} from '../Variables/Variables';

import {
    addMarkerPerson,
    addMarkerFn,
    addHouseMarker,
    addRoute,
    addDistance,
    addMarkerMapElement,
    addMarkerFnEllipse,
    addRelateMarker,
    addMarkerGivenSet,
    addMarkerWelcomeSign,
    addPersonInMobility,
    addInputImagePallet,
    checkMarkerExist,
    addSoluOrProbFn
} from './AddMarkers'
import {countryModePopupHTML} from "@/components/Map/MapContents/Popups/PopupHTMLs";
import {checkBoundContainMarker, computeDistanceBetweenTwoPoint} from "@/components/Map/MapContents/CommonUtil";


// Toggle boundary of selected item
export const toggleBoundaryFn = (e) => {
    e.originalEvent.stopPropagation();
    e.originalEvent.preventDefault();

    if (!e.target.options.boundary) {
        e.target._icon.classList.add(styles["boundary"]);
        e.target.options.boundary = true;
    } else {
        e.target._icon.classList.remove(styles["boundary"]);
        e.target.options.boundary = false;
    }
}

let areaSelection;

// Add selected item to group by use CTRL + left click

const Markers = ({setModal, setModalType}) => {
    const globalStore = useGlobalStore();
    const simulationSettingStore = useSimulationSettingStore();
    const map = useMap()

    map.doubleClickZoom.disable();

    // Active Simulation - Flash color of function marker
    useEffect(() => {
        if (globalStore.simulation) {
            let listLayer = [];
            let listNameFunction = [];
            const root = document.documentElement;
            root?.style.setProperty("--time-animation", simulationSettingStore.transitionTime ? simulationSettingStore.transitionTime / 1000 + 's' : '10s')
            map.eachLayer(layer => {
                if (layer.options.target?.type === 'function' || layer.options.target?.type === 'problem') {
                    if (!listNameFunction.includes(layer.options?.icon?.options?.html)) {
                        listNameFunction.push(layer.options?.icon?.options?.html);
                        listLayer.push(layer);
                    }
                } else if (layer.options.target?.type === 'person' || layer.options.target?.type === 'welcome'
                    || layer.options.target?.type === 'house' || layer.options.target?.type === 'relate'
                    || layer.options?.options?.type === 'arrow' || layer.options.target?.type === 'person-mobility'
                    || layer.options?.options?.type === 'person-principle-line' || layer.options?.options?.type === 'vertical-principle-line'
                    || layer.options?.type?.type === 'the-given-set' || layer.options?.type === 'person-mobility'
                    || layer.options?.target?.type === 'relationship' || layer.options?.type === 'map-element' || layer.options?.options?.type === 'distance'
                    || layer.options.target?.type === 'boat' || layer.options.target?.type === 'room') {
                } else {
                    // console.log('layer', layer)
                    setTimeout(() => {
                        layer._icon?.classList.add(styles[`hidden`]);
                    }, simulationSettingStore.discardTime)
                }
            });
            if (listLayer.length > 0) {
                if (simulationSettingStore.effectedFunction === 'Random') {
                    shuffleArray(listLayer);
                    animate(listLayer)
                } else {
                    let smallFunction = listNameFunction.sort()[0];
                    let smallFunctionLayer = listLayer.filter(item => item.options.icon.options.html === smallFunction)[0];
                    getListLayerSortedDistance(listLayer, smallFunctionLayer);
                    animate(listLayer)
                }
            }
        } else {
            map.eachLayer(layer => {
                if (layer.options.target?.type === 'function' || layer.options.target?.type === 'problem') {
                    layer._icon.classList.remove(styles[`simulation-animate0`]);
                    layer._icon.classList.remove(styles[`simulation-animate1`]);
                    layer._icon.classList.remove(styles[`simulation-animate-boundary`]);
                    layer._icon.classList.remove(styles["boundary"]);
                }
            });
        }
    }, [globalStore.simulation]);

    const animate = (listLayer) => {
        listLayer.forEach((layer, index) => {
            setTimeout(() => {
                if (simulationSettingStore.boundary === 'Yes') {
                    layer._icon.classList.add(styles["boundary"]);
                } else {
                    layer._icon.classList.remove(styles["boundary"]);
                }
                let name = layer.options?.icon?.options?.html;
                if (name.includes('Natural')) {
                    layer._icon.classList.add(styles[`simulation-animate1`]);
                    layer._icon.classList.remove(styles["boundary"]);
                } else if (name.includes('Non-natural')) {
                    layer._icon.classList.remove(styles["boundary"]);
                    layer._icon.classList.add(styles[`simulation-animate-boundary`]);
                } else {
                    layer._icon.classList.add(styles[`simulation-animate0`]);
                }
            }, simulationSettingStore.transitionTime * index)
        })
    }

    const shuffleArray = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    // useEffect(() => {
    //     globalStore.setMapLayer(map);
    // }, [map])

    // Toggle Lock - Unlock Markers
    useEffect(() => {
        if (globalStore.lock) {
            map.eachLayer((layer) => {
                layer._icon && layer.dragging.disable();
            })
        } else {
            map.eachLayer((layer) => {
                layer._icon && layer.dragging.enable();
                layer._icon?.src && layer.dragging.disable();
                layer.options?.infor && layer.dragging.disable();
            })
        }
    }, [globalStore.lock])

    useEffect(() => {
        if (globalStore.equationDropPosition && globalStore.equationToAdd) {
            addMarkerMapElement(
                map,
                globalStore.equationDropPosition.lat,
                globalStore.equationDropPosition.lng,
                globalStore.lock,
                globalStore.equationToAdd,
                globalStore.setListMapElementRelate,
                globalStore.setPositionOfMapElementSelected
            );
            globalStore.setEquationDropPosition(null);
            globalStore.resetEquationToAdd();
        }
    }, [globalStore.equationDropPosition, globalStore.equationToAdd]);

    let drawnItemsLine = new L.FeatureGroup();
    const drawControlLine = new L.Control.Draw({
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#f06eaa', // Line color
                },
            }, rectangle: false, // Enable drawing rectangles
            marker: false, circle: false, polygon: false, circlemarker: false
        }, edit: {
            featureGroup: drawnItemsLine, // Create a feature group to store drawn rectangles
            remove: true, edit: false
        },
    });

    let drawnItemsRect = new L.FeatureGroup();
    const drawControlRect = new L.Control.Draw({
        draw: {
            rectangle: true, // Enable drawing rectangles
            polyline: false, marker: false, circle: false, polygon: false, circlemarker: false
        }, edit: {
            featureGroup: drawnItemsRect, // Create a feature group to store drawn rectangles
            remove: true, edit: false
        },
    });

    let drawnItemsCircle = new L.FeatureGroup();
    const drawControlCircle = new L.Control.Draw({
        draw: {
            rectangle: false, // Enable drawing rectangles
            marker: false, polyline: false, circle: true, polygon: false, circlemarker: false
        }, edit: {
            featureGroup: drawnItemsCircle, // Create a feature group to store drawn rectangles
            remove: true, edit: false
        },
    });

    // Clear all map element
    useEffect(() => {
        if (globalStore.clear) {
            map.removeLayer(drawnItemsRect);
            map.removeControl(drawControlRect);
            map.removeLayer(drawnItemsCircle);
            map.removeControl(drawControlCircle);
            map.removeLayer(drawnItemsLine);
            map.removeControl(drawControlLine);

            globalStore.resetListMarkerFunction();
            globalStore.resetListMarkerPopulation();
            globalStore.resetListMarkerProblem();
            globalStore.resetListPrincipleLine();
            globalStore.resetListMapElementSelected();
            globalStore.resetListMapElementRelate();
            globalStore.resetMapLayer();
            globalStore.setChooseGivenSet(false);
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            globalStore.resetListRectPolygonPallet();
            globalStore.resetListCirclePolygonPallet();
            globalStore.resetListLinePallet();
            globalStore.resetPositionOfAllPallet();
            globalStore.resetListPositionOfAllPallet();

            map.eachLayer(layer => {
                if (layer.options.target?.status === 'add' || layer.options.status === 'add' ||
                    layer.options.type === 'vertical-line-the-given-set' || layer.options.type === 'more-view-main-set' ||
                    layer.options.type === 'distance' || layer.options.type === 'map-element-relate' || layer.options.group?.status === 'add' ||
                    layer.options.type?.status === 'add' || layer.options?.attribution === 'imageTransform' ||
                    layer.options.patterns?.length > 0 || layer.options.target?.type === 'dot' ||
                    (layer.options.type === 'arrow' && layer.options.status === 'add')) {
                    map.removeLayer(layer);
                    markerFnIndex[0] = 1;
                    markerPersonIndex[0] = 1;
                    markerProblemIndex[0] = 1;
                    markerHouseIndex[0] = 1;
                    markerCountryFnIndex[0] = 1;
                    markerPrincipleLineIndex[0] = 0;
                    globalStore.valueOfImage = '';
                }
            });
            map.eachLayer(layer => {
                if ((layer.options.type === 'arrow' && layer.options.status === 'add')
                    || layer.options.type === 'vertical-line-the-given-set' || layer.options.type === 'more-view-main-set') {
                    map.removeLayer(layer);
                }
            })
            globalStore.toggleClear();
        }
    }, [globalStore.clear]);

    // Get all function by wrapping in area (to add into a group)
    useEffect(() => {
        // if (globalStore.map) {
        const getButton = document.getElementById("pointer-event");
        const textEvent = document.getElementById("text-event");
        const lineEvent = document.getElementById("line-event");
        const rectEvent = document.getElementById("rectangle-event");
        const ellipseEvent = document.getElementById("ellipse-event");
        const imageEvent = document.getElementById("image-event");
        const pallet1Event = document.getElementById("pallet1-event");
        const pallet2Event = document.getElementById("pallet2-event");
        const pallet3Event = document.getElementById("pallet3-event");
        const pallet4Event = document.getElementById("pallet4-event");
        let restrictPopup = 0;
        areaSelection = new DrawAreaSelection({
            onPolygonReady: (polygon) => {
                if (polygon && polygon._latlngs) {
                    const arr = polygon._latlngs[0].map((e) => Object.values(e));

                    map.eachLayer(layer => {
                        if (layer._latlng) {
                            if (turf.booleanPointInPolygon(turf.point(Object.values(layer._latlng)), turf.polygon([[...arr, arr[0]]]))) {
                                if (layer.options.index || layer.options.target || layer.options.options?.shape || layer.options.group?.type === 'mainset') {
                                    selectedList.push(layer);
                                    layer._icon.classList.add('selected-icon');
                                    if (layer.options.group?.type === 'mainset') {
                                        restrictPopup = 1;
                                    }
                                }
                            }
                        }
                    });
                    if (selectedList.length > 0) {
                        wrappingPopup(map, arr[2][0], arr[2][1], globalStore.lock, selectedList, restrictPopup);
                    }
                    areaSelection.deactivate();
                    globalStore.changeActiveAreaSelection(false);
                }
            },
        });

        const showScanSelection = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine)
            globalStore.togglePalletOption('pointer')
            if (!globalStore.inAreaSelection && globalStore.palletOption === 'pointer') {
                globalStore.changeActiveAreaSelection(true);
                restrictPopup = 0;
                map.addControl(areaSelection);
                areaSelection.activate();
            } else {
                areaSelection?.deactivate();
                globalStore.changeActiveAreaSelection(false);
            }
        }

        const insertTextToMap = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine)
            globalStore.togglePalletOption('text')
        }

        const insertImageToMap = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine)
            globalStore.togglePalletOption('image')
        }

        const insertPalletLine1ToMap = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine)
            globalStore.togglePalletOption('pallet1')
        }

        const insertPalletLine2ToMap = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine)
            globalStore.togglePalletOption('pallet2')
        }

        const insertPalletLine3ToMap = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine)
            globalStore.togglePalletOption('pallet3')
        }

        const insertPalletLine4ToMap = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine)
            globalStore.togglePalletOption('pallet4')
        }

        const drawLine = () => {
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            if (globalStore.palletOption === 'pointer') {
                areaSelection?.deactivate();
            }
            globalStore.togglePalletOption('line');

            if (globalStore.palletOption === 'line') {
                map.addLayer(drawnItemsLine);
                map.addControl(drawControlLine);

                map.on(L.Draw.Event.CREATED, (event) => {
                    const layer = event.layer;
                    if (globalStore.palletOption === 'line') {
                        globalStore.setListLinePallet(layer._latlngs);
                    }
                    globalStore.togglePalletOption('');
                    map.removeControl(drawControlLine);
                });
            } else {
                refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine);
            }
        }

        const drawRectangle = () => {
            refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine);
            if (globalStore.palletOption === 'pointer') {
                areaSelection?.deactivate();
            }
            globalStore.togglePalletOption('rectangle');

            if (globalStore.palletOption === 'rectangle') {
                drawnItemsRect.options = {
                    status: 'add',
                    type: 'draw-item-rect'
                }
                map.addLayer(drawnItemsRect);
                map.addControl(drawControlRect);

                map.on(L.Draw.Event.CREATED, (event) => {
                    const layer = event.layer;
                    // drawnItemsRect.addLayer(layer);
                    globalStore.setListRectPolygonPallet(layer._bounds, layer._latlngs, layer.toGeoJSON());
                    globalStore.togglePalletOption('');
                    map.removeControl(drawControlRect);
                });
            } else {
                refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            }
        }

        const drawCircle = () => {
            refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
            refreshLayerAndControlLine(map, drawnItemsLine, drawControlLine);
            if (globalStore.palletOption === 'pointer') {
                areaSelection?.deactivate();
            }
            globalStore.togglePalletOption('circle');
            if (globalStore.palletOption === 'circle') {
                drawnItemsCircle.options = {
                    status: 'add',
                    type: 'draw-item-circle'
                }
                map.addLayer(drawnItemsCircle);
                map.addControl(drawControlCircle);

                map.on(L.Draw.Event.CREATED, (event) => {
                    const layer = event.layer;
                    globalStore.setListCirclePolygonPallet(layer._latlng, layer._mRadius, layer.toGeoJSON());
                    globalStore.togglePalletOption('');
                    map.removeControl(drawControlCircle);
                });
            } else {
                refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
            }
        }

        getButton?.addEventListener("click", showScanSelection);
        textEvent?.addEventListener("click", insertTextToMap);
        lineEvent?.addEventListener("click", drawLine);
        rectEvent?.addEventListener("click", drawRectangle);
        ellipseEvent?.addEventListener("click", drawCircle);
        imageEvent?.addEventListener("click", insertImageToMap);
        pallet1Event?.addEventListener("click", insertPalletLine1ToMap);
        pallet2Event?.addEventListener("click", insertPalletLine2ToMap);
        pallet3Event?.addEventListener("click", insertPalletLine3ToMap);
        pallet4Event?.addEventListener("click", insertPalletLine4ToMap);

        return () => {
            getButton?.removeEventListener("click", showScanSelection);
            textEvent?.removeEventListener("click", insertTextToMap);
            lineEvent?.removeEventListener("click", drawLine);
            rectEvent?.removeEventListener("click", drawRectangle);
            ellipseEvent?.removeEventListener("click", drawCircle);
            imageEvent?.removeEventListener("click", insertImageToMap);
            pallet1Event?.removeEventListener("click", insertPalletLine1ToMap);
            pallet2Event?.removeEventListener("click", insertPalletLine2ToMap);
            pallet3Event?.removeEventListener("click", insertPalletLine3ToMap);
            pallet4Event?.removeEventListener("click", insertPalletLine4ToMap);
        };
        // }
    }, [globalStore.map]);

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const earthRadius = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    const getListLayerSortedDistance = (listLayer, smallFunctionLayer) => {
        const referenceLat = smallFunctionLayer?._latlng.lat; // Latitude of "Function 1"
        const referenceLng = smallFunctionLayer?._latlng.lng;

        listLayer.sort((a, b) => {
            const distanceA = calculateDistance(referenceLat, referenceLng, a?._latlng.lat, a?._latlng.lng);
            const distanceB = calculateDistance(referenceLat, referenceLng, b?._latlng.lat, b?._latlng.lng);
            return distanceA - distanceB; // Sort in ascending order of distance
        });
    }

    const refreshLayerAndControlLine = (map, drawnItems, drawControl) => {
        // map.removeLayer(drawnItemsRect);
        map.removeControl(drawControl)
    }

    const refreshLayerAndControlRect = (map, drawnItems, drawControl) => {
        map.removeLayer(drawnItems);
        map.removeControl(drawControl)
    }

    const refreshLayerAndControlCircle = (map, drawnItems, drawControl) => {
        map.removeLayer(drawnItems);
        map.removeControl(drawControl)
    }

    // Remove all temp item when clicking on map
    useEffect(() => {
        const onClick = (event) => {
            if (window.handleRemoveTempList && (!event.ctrlKey || !event.metaKey) && event.target.classList && !event.target.classList.contains(styles['rectangle-fn'])) {
                window.handleRemoveTempList();
            }
        };

        document.addEventListener('click', onClick);

        return () => {
            document.removeEventListener('click', onClick);
        }
    }, [])

    // Add markers to map by drag event
    useEffect(() => {
        if (!globalStore.click) {
            const mapContainer = document.querySelector('.leaflet-container');
            mapContainer.ondragover = (e) => e.preventDefault();

            mapContainer.ondrop = (e) => {
                const latlng = map.containerPointToLatLng(L.point(e.layerX, e.layerY));

                if (globalStore.addIcon === 'person') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else {
                        let index = markerPersonIndex[0];
                        globalStore.setMapLayer(latlng.lat, latlng.lng, 'Person ' + index, 'person')
                        globalStore.addMarkerPopulationToList(index)
                        markerPersonIndex[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'function') {
                    if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        let index = markerFnIndex[0];
                        globalStore.addMarkerFnToList(index)
                        globalStore.setMapLayer(latlng.lat, latlng.lng, 'Function ' + index, 'function', 'rectangle');
                        markerFnIndex[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'house') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        let index = markerHouseIndex[0];
                        addHouseMarker(map, latlng.lat, latlng.lng, globalStore.lock);
                        globalStore.setMapLayer(latlng.lat, latlng.lng, index, 'house');
                        markerFnIndex[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'welcome-sign') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addMarkerWelcomeSign(map, latlng.lat, latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'inter-route') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addRoute(map, latlng.lat, latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'distance') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addDistance(map, latlng.lat, latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'scroll-feature') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.setPositionOfScroll(latlng.lat, latlng.lng);
                        globalStore.resetDataScroll();
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'horizontal-line') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.toggleModalInsertNumberPerson();
                        globalStore.setListPrincipleLine([latlng.lat, latlng.lng], null);
                        markerPrincipleLineIndex[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'relate') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addRelateMarker(map, latlng.lat, latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'main-set') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.setChooseGivenSet(true);
                        let index = markerGivenSet[0];

                        globalStore.setMapLayer(latlng.lat, latlng.lng, index + '', 'the-given-set')
                        addMarkerGivenSet(map, latlng.lat, latlng.lng, index, globalStore.lock, 'Main Set', globalStore.setChooseGivenSet,
                            globalStore.setPositionOfHorizontalLine, globalStore.resetPositionOfHorizontalLine);
                        markerGivenSet[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'mobility') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.setTypeMobility('path');
                        addPersonInMobility(map, latlng.lat, latlng.lng, globalStore.lock, globalStore.numberPersonMobility, globalStore.setNumberPersonMobility, globalStore.setPositionOfPreviewPerson, globalStore.positionOfPreviewPerson, globalStore.typeMobility);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'equation') {
                    globalStore.setEquationDropPosition(latlng);
                    globalStore.setEquationModalOpen(true);
                    globalStore.addIconHandle('');
                }
            }
            if (globalStore.mapView !== '' && globalStore.addIcon === '') {
                removeLayerFnAndPl();
                globalStore.mapLayer.forEach(fn => {
                    if (fn.type === 'function' && fn.isShow && fn.name !== "" && !checkMarkerExist(map, fn.name.replace("Function ", ""), 'function', fn.lat, fn.lng)) {
                        addMarkerFn(map, fn.lat, fn.lng, fn.name.slice(-1), globalStore.lock, setModal, setModalType,
                            fn.name, null, null, globalStore.setShapeOfMarkerFn, globalStore.addMarkerProblemToList,
                            globalStore.setShapeOfMarkerPl, globalStore.removeMapLayerById, globalStore.updateStatusDisplayMapLayerByNameAndType,
                            globalStore.updateStatusDisplayListMarkerFunctionByName, globalStore.setMapLayer, globalStore.updateNameItemMapLayerByNameAndType,
                            globalStore.updateNameItemListMarkerFunctionByName, globalStore.updateMapLayerById, fn.shape);
                    } else if (fn.type === 'person' && fn.isShow && fn.name !== "" && !fn.mobility) {
                        let index = fn.name.replace("Person ", "");
                        if (!checkMarkerExist(map, index, 'person', fn.lat, fn.lng)) {
                            addMarkerPerson(map, fn.lat, fn.lng, index, globalStore.lock, setModal,
                                setModalType, globalStore.setPersonToListMapElementSelected, globalStore.resetNumberPersonMobility,
                                globalStore.updateMapLayerById, globalStore.removeMapLayerById);
                        }
                    } else if (fn.type === 'problem' && fn.isShow && fn.name !== "" && globalStore.moreName === '') {
                        let index = fn.name.replace("Problem ", "");
                        if (!checkMarkerExist(map, index, 'problem', fn.lat, fn.lng)) {
                            addSoluOrProbFn(map, fn.lat, fn.lng, globalStore.lock, index, 'Problem', setModal, setModalType,
                                globalStore.setShapeOfMarkerPl, globalStore.addMarkerFnToList, globalStore.setMapLayer,
                                globalStore.updateStatusDisplayListMarkerProblemByName, globalStore.updateStatusDisplayMapLayerByNameAndType,
                                globalStore.updateMapLayerById, fn.shape);
                        }
                    }
                })
            }
        } else {
            if (globalStore.addIcon === 'main-set') {
                if (globalStore.moreName === 'world-as-function') {
                    globalStore.setShowErrorInsertPerson(true);
                } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                    globalStore.setShowErrorInsertFunction(true);
                } else {
                    if (globalStore.positionOfHorizontalLine.length > 0) {
                        globalStore.setChooseGivenSet(true)
                    }
                }
            } else {
                removeLayerFnAndPl();
                globalStore.mapLayer.forEach(fn => {
                    if (fn.type === 'function'
                        && fn.isShow
                        && fn.name !== ""
                        && !checkMarkerExist(map, fn.name.replace("Function ", ""), 'function', fn.lat, fn.lng)
                        && globalStore.moreName === ''
                    ) {
                        if (globalStore.tableView !== '') {
                            if (globalStore.addIcon !== '') {
                                addMarkerFnEllipse(map, fn.lat, fn.lng, fn.name.replace("Function ", ""), globalStore.lock, setModal,
                                    setModalType, null, null, null, globalStore.setShapeOfMarkerFn,
                                    globalStore.addMarkerProblemToList, globalStore.setShapeOfMarkerPl, globalStore.removeMapLayerById);
                            } else {

                            }
                        } else {
                            addMarkerFn(map, fn.lat, fn.lng, fn.name.slice(-1), globalStore.lock, setModal, setModalType,
                                fn.name, null, null, globalStore.setShapeOfMarkerFn, globalStore.addMarkerProblemToList,
                                globalStore.setShapeOfMarkerPl, globalStore.removeMapLayerById, globalStore.updateStatusDisplayMapLayerByNameAndType,
                                globalStore.updateStatusDisplayListMarkerFunctionByName, globalStore.setMapLayer, globalStore.updateNameItemMapLayerByNameAndType,
                                globalStore.updateNameItemListMarkerFunctionByName, globalStore.updateMapLayerById, fn.shape);
                        }
                    } else if (fn.type === 'person' && fn.isShow && fn.name !== "" && !fn.mobility && globalStore.moreName === '') {
                        let index = fn.name.replace("Person ", "");
                        if (!checkMarkerExist(map, index, 'person', fn.lat, fn.lng)) {
                            addMarkerPerson(map, fn.lat, fn.lng, index, globalStore.lock, setModal,
                                setModalType, globalStore.setPersonToListMapElementSelected, globalStore.resetNumberPersonMobility,
                                globalStore.updateMapLayerById, globalStore.removeMapLayerById);
                        }
                    } else if (fn.type === 'problem' && fn.isShow && fn.name !== "" && globalStore.moreName === '') {
                        let index = fn.name.replace("Problem ", "");
                        if (!checkMarkerExist(map, index, 'problem', fn.lat, fn.lng)) {
                            addSoluOrProbFn(map, fn.lat, fn.lng, globalStore.lock, index, 'Problem', setModal, setModalType,
                                globalStore.setShapeOfMarkerPl, globalStore.addMarkerFnToList, globalStore.setMapLayer,
                                globalStore.updateStatusDisplayListMarkerProblemByName, globalStore.updateStatusDisplayMapLayerByNameAndType,
                                globalStore.updateMapLayerById, fn.shape);
                        }
                    }
                })
            }
        }
    }, [globalStore.click, globalStore.addIcon, globalStore.mapView, globalStore.tableView, globalStore.rectangularView,
        globalStore.positionOfHorizontalLine, globalStore.mapLayer, globalStore.statusDisplayItem]);

    const removeLayerFnAndPl = () => {
        map.eachLayer(layer => {
            if (layer.options.target?.type === 'function' || layer.options.target?.type === 'problem') {
                map.removeLayer(layer);
            }
        });
    }

    useEffect(() => {
        refreshLayerAndControlRect(map, drawnItemsRect, drawControlRect);
        refreshLayerAndControlCircle(map, drawnItemsCircle, drawControlCircle);
    }, [globalStore.listRectPolygonPallet.length, globalStore.listCirclePolygonPallet.length])

    const checkEventClickInBound = (lat, lng, list) => {
        for (let i = 0; i < list.length; i++) {
            if (checkBoundContainMarker(list[i].bound, lat, lng)) {
                return true;
            }
        }
        return false;
    }

    const checkEventClickInPallet1 = (lat, lng, list) => {
        for (let i = 0; i < list.length; i++) {
            let position = list[i].position;
            let latLng1 = position[0];
            let latLng2 = position[1];
            let bound1 = L.polyline([[latLng1[0], latLng2[1]], latLng1]).getBounds();
            let bound2 = L.polyline([[latLng1[0], latLng2[1]], latLng2]).getBounds();
            if (checkBoundContainMarker(bound1, lat, lng) && checkBoundContainMarker(bound2, lat, lng)) {
                return true;
            }
        }
        return false;
    }

    const checkEventClickInPolyline = (lat, lng, list) => {
        for (let i = 0; i < list.length; i++) {
            let latLng = list[i].latlng || list[i].position;
            let bound = L.polyline(latLng).getBounds();
            if (checkBoundContainMarker(bound, lat, lng)) {
                return true;
            }
        }
        return false;
    }

    const checkMarkerInCircle = (radius, lat, lng, currentLat, currentLng) => {
        const distance = computeDistanceBetweenTwoPoint(lat, lng, currentLat, currentLng);
        return distance < radius;
    }

    const checkEventClickInCircle = (currentLat, currentLng) => {
        for (let i = 0; i < globalStore.listCirclePolygonPallet.length; i++) {
            if (checkMarkerInCircle(globalStore.listCirclePolygonPallet[i].radius, globalStore.listCirclePolygonPallet[i].bound.lat,
                globalStore.listCirclePolygonPallet[i].bound.lng, currentLat, currentLng)) {
                return true;
            }
        }
        return false;
    }


    useMapEvents({

        // Open right-click menu on map
        contextmenu(e) {
            if (globalStore.map && !globalStore.boatView && !globalStore.roomView && !globalStore.floorPlanView
                && !checkEventClickInBound(e.latlng.lat, e.latlng.lng, globalStore.listRectPolygonPallet)
                && !checkEventClickInBound(e.latlng.lat, e.latlng.lng, globalStore.listPositionOfImagePallet)
                && !checkEventClickInCircle(e.latlng.lat, e.latlng.lng)
                && !checkEventClickInPolyline(e.latlng.lat, e.latlng.lng, globalStore.listLinePallet)
                && !checkEventClickInPolyline(e.latlng.lat, e.latlng.lng, globalStore.listPositionOfPallet1)
                && !checkEventClickInPolyline(e.latlng.lat, e.latlng.lng, globalStore.listPositionOfPallet2)
                && !checkEventClickInPolyline(e.latlng.lat, e.latlng.lng, globalStore.listPositionOfPallet3)
                && !checkEventClickInPolyline(e.latlng.lat, e.latlng.lng, globalStore.listPositionOfPallet4)
            ) {
                worldPopup(map, e, globalStore.map, globalStore.toggleHouseView, globalStore.setListMapElementRelate, globalStore.setListMapElementSelected);
            } else if (globalStore.boatView) {
                boatPopup(map, e, globalStore.map, globalStore.toggleBoatView, globalStore.setListMapElementRelate, globalStore.setListMapElementSelected);
            }
        },

        // Add markers to map by click event
        click(e) {
            console.log(`${e.latlng.lat} ${e.latlng.lng}`);

            if (globalStore.click) {
                // Add Person Marker
                if (globalStore.addIcon === 'person') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else {
                        markerPersonIndex[0] = globalStore.listMarkerPopulation.map(item => item.key).filter(x => x !== 'dot' && x !== 'plus').length + 1;
                        globalStore.setMapLayer(e.latlng.lat, e.latlng.lng, 'Person ' + markerPersonIndex[0], 'person')
                        globalStore.addMarkerPopulationToList(markerPersonIndex[0])
                        markerPersonIndex[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'function') {
                    if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        markerFnIndex[0] = globalStore.listMarkerFunction.map(item => item.key).filter(x => x !== 'dot' && x !== 'plus').length + 1;
                        globalStore.addMarkerFnToList(markerFnIndex[0])
                        globalStore.setMapLayer(e.latlng.lat, e.latlng.lng, 'Function ' + markerFnIndex[0], 'function');
                        markerFnIndex[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'house') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addHouseMarker(map, e.latlng.lat, e.latlng.lng, globalStore.lock)
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'welcome-sign') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addMarkerWelcomeSign(map, e.latlng.lat, e.latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'inter-route') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addRoute(map, e.latlng.lat, e.latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'distance') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        addDistance(map, e.latlng.lat, e.latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'relate') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.resetPositionScroll();
                        addRelateMarker(map, e.latlng.lat, e.latlng.lng, globalStore.lock);
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'mobility') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.resetPositionScroll();
                        // if (globalStore.numberPersonMobility < 2) {
                        globalStore.setTypeMobility('path');
                        addPersonInMobility(map, e.latlng.lat, e.latlng.lng, globalStore.lock, globalStore.numberPersonMobility, globalStore.setNumberPersonMobility, globalStore.setPositionOfPreviewPerson, globalStore.positionOfPreviewPerson, globalStore.typeMobility);
                        // } else {
                        //     globalStore.resetNumberPersonMobility();
                        // }
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'scroll-feature') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.setPositionOfScroll(e.latlng.lat, e.latlng.lng);
                        globalStore.resetDataScroll();
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'horizontal-line') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.toggleModalInsertNumberPerson();
                        globalStore.setListPrincipleLine([e.latlng.lat, e.latlng.lng], null);
                        markerPrincipleLineIndex[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'main-set') {
                    if (globalStore.moreName === 'world-as-function') {
                        globalStore.setShowErrorInsertPerson(true);
                    } else if (globalStore.moreName === 'population-view' || globalStore.moreName === 'population-view-with-country' || globalStore.moreName === 'population-view-principle-line') {
                        globalStore.setShowErrorInsertFunction(true);
                    } else {
                        globalStore.setChooseGivenSet(true);
                        let index = markerGivenSet[0];
                        globalStore.setMapLayer(e.latlng.lat, e.latlng.lng, index + '', 'the-given-set')
                        addMarkerGivenSet(map, e.latlng.lat, e.latlng.lng, index, globalStore.lock, 'Main Set', globalStore.setChooseGivenSet,
                            globalStore.setPositionOfHorizontalLine, globalStore.resetPositionOfHorizontalLine);
                        markerGivenSet[0]++;
                    }
                    globalStore.addIconHandle('');
                } else if (globalStore.addIcon === 'equation') {
                    globalStore.setEquationDropPosition(e.latlng);
                    globalStore.setEquationModalOpen(true);
                    globalStore.addIconHandle('');
                }
            }

            if (globalStore.palletOption === 'text') {
                markerTextPalletIndex[0]++
                globalStore.setPositionOfTextPallet(e.latlng.lat, e.latlng.lng)
                globalStore.togglePalletOption('');
            } else if (globalStore.palletOption === 'image') {
                let id = globalStore.listPositionOfImagePallet.length + 1;
                let zoom = map.getZoom();
                console.log('zoom')
                let bound = L.latLngBounds([[e.latlng.lat, e.latlng.lng], [e.latlng.lat - 40/zoom, e.latlng.lng + 100/zoom]])
                globalStore.setPositionOfImagePallet(e.latlng.lat, e.latlng.lng, id, bound);
                addInputImagePallet(map, e.latlng.lat, e.latlng.lng, id, globalStore.lock, globalStore.togglePalletOption,
                    globalStore.updateValueImagePalletById, globalStore.setValueOfImage);
            } else if (globalStore.palletOption === 'pallet1') {
                globalStore.resetPositionOfPallet2();
                globalStore.resetPositionOfPallet3();
                globalStore.resetPositionOfPallet4();
                globalStore.setPositionOfPallet(e.latlng.lat, e.latlng.lng, globalStore.positionOfPallet1, globalStore.listPositionOfPallet1);
                if (globalStore.positionOfPallet1.length === 2) {
                    globalStore.resetPositionOfPallet1();
                    globalStore.togglePalletOption('');
                }
            } else if (globalStore.palletOption === 'pallet2') {
                globalStore.resetPositionOfPallet1();
                globalStore.resetPositionOfPallet3();
                globalStore.resetPositionOfPallet4();
                globalStore.setPositionOfPallet(e.latlng.lat, e.latlng.lng, globalStore.positionOfPallet2, globalStore.listPositionOfPallet2);
                if (globalStore.positionOfPallet2.length === 2) {
                    globalStore.resetPositionOfPallet2();
                    globalStore.togglePalletOption('');
                }
            } else if (globalStore.palletOption === 'pallet3') {
                globalStore.resetPositionOfPallet1();
                globalStore.resetPositionOfPallet2();
                globalStore.resetPositionOfPallet4();
                globalStore.setPositionOfPallet(e.latlng.lat, e.latlng.lng, globalStore.positionOfPallet3, globalStore.listPositionOfPallet3);
                if (globalStore.positionOfPallet3.length === 2) {
                    globalStore.resetPositionOfPallet3();
                    globalStore.togglePalletOption('');
                }
            } else if (globalStore.palletOption === 'pallet4') {
                globalStore.resetPositionOfPallet1();
                globalStore.resetPositionOfPallet2();
                globalStore.resetPositionOfPallet3();
                globalStore.setPositionOfPallet(e.latlng.lat, e.latlng.lng, globalStore.positionOfPallet4, globalStore.listPositionOfPallet4);
                if (globalStore.positionOfPallet4.length === 2) {
                    globalStore.resetPositionOfPallet4();
                    globalStore.togglePalletOption('');
                }
            }

            if (globalStore.listMapElementSelected.length > 0
                && globalStore.listMapElementSelected.filter(item => !item.status).length === 1) {
                for (let i = 0; i < globalStore.listMapElementSelected.length; i++) {
                    const mapElement = globalStore.listMapElementSelected[i];
                    if (!mapElement.status) {
                        globalStore.changePositionOfMapElementSelected(e.latlng.lat, e.latlng.lng, mapElement.id);
                        addMarkerMapElement(map, e.latlng.lat, e.latlng.lng, globalStore.lock, mapElement,
                            globalStore.setListMapElementRelate, globalStore.setPositionOfMapElementSelected);
                        globalStore.changeStatusOfMapElementSelected(true, mapElement.id);
                    }
                }
            }

        }
    })

    return null;
}

export default observer(Markers)
