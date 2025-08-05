import styles from '../_MapContents.module.scss';
import L, {map, popup} from 'leaflet';
import '@elfalem/leaflet-curve';
import 'leaflet-textpath';
import 'leaflet-arrowheads';
import 'leaflet-polylinedecorator';

import {
    markerFnIcon,
    markerFnCircleIcon,
    markerPersonIcon,
    markerCustomImgIcon,
    markerCustomAudioIcon,
    markerCustomVideoIcon,
    markerCountryFnIcon,
    markerRoomIcon,
    markerGivenSetIcon,
    markerPersonWaveIcon,
    markerGivenSetPersonWaveIcon,
    markerPersonWaveIconMobility
} from '../Markers/MarkerIcons';

import {handleName, markerFnIndex, markerProblemIndex, selectedList} from '../Variables/Variables';

import {
    fnPopupHTML,
    personPopupHTML,
    groupPopupHTML,
    problemPopupHTML,
    groupFnLayoutPopupHTML,
    routePopupHTML,
    distancePopupHTML,
    countryFnPopupHTML,
    stopFnPopupHTML,
    tempFnPopupHTML,
    mainsetPopupHTML,
    roomPopupHTML,
    worldPopupHTML,
    wrappingPopupHTML,
    imgBoundPopupHTML,
    audioBoundPopupHTML,
    videoBoundPopupHTML,
    mapElementPopupHTML,
    rectIconPopupHTML,
    givenSetPopupHTML,
    boatPopupHTML,
    floorPopupHTML,
    personMobilityPopupHTML,
    annotationPalletPopupHTML,
    imagePalletPopupHTML,
    textPalletPopupHTML
} from './PopupHTMLs';

import {removeTempList, setupGroup, setupMainSet, showDistance} from '../Markers/HandleSelectItem';

import {resetAllColor} from '../Markers/HandleRouteAndDistance';
import {addSoluOrProbFn, addStopFn, addTemporaryFn} from '../Markers/AddMarkers';

// A function that execute whenever user right click on function marker
// Includes all custom window global functions

// Clear all visible popups on map
export const clearAllPopups = (map) => {
    map.eachLayer(layer => {
        if (layer instanceof L.Popup) {
            map.removeLayer(layer)
        }
    });
}

const clearWorldPopup = (map) => {
    map.eachLayer(layer => {
        if (layer instanceof L.Popup && layer.options.type === 'world_popup') {
            map.removeLayer(layer);
        }
    })
}

// Stop all features before changing function (boundary, flashing,...)
const stopFnRunningFeatures = (e) => {
    if (e.target.options.boundary) {
        e.target.options.boundary = false;
        e.target._icon.classList.remove(styles["boundary"]);
    }

    if (e.target.options.isFlashing) {
        e.target.options.isFlashing = false;
        for (let i = 0; i < 6; i++) {
            e.target._icon.classList.remove(styles[`simulation-animate${i}`]);
        }
    }
}

// ---------------------------------------------------------------------------------------------------------
// Popup shown when right-click on world map
export const worldPopup = (map, e, isMap, toggleHouseView, setMapElementRelate, setListMapElementSelected) => {
    clearAllPopups(map);
    const popupWorld = L.popup();
    popupWorld.options.type = 'world_popup';

    if (isMap) {
        popupWorld
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(worldPopupHTML())
            .addTo(map);

        const world = document.querySelector('.world');
        world.onclick = () => {
            toggleHouseView('house-world');
            map.closePopup();
        }

        const country = document.querySelector('.country');
        country.onclick = () => {
            toggleHouseView("house-countries");
            map.closePopup();
        }
    }

    window.handleSelectMapElement = (value) => {
        setListMapElementSelected(value);
        map.removeLayer(popupWorld);
    }
}

// Popup shown when right-click on boat view
export const boatPopup = (map, e, isMap, toggleBoatView, setMapElementRelate, setMapElementSelected) => {
    clearAllPopups(map);

    const popupHouse = L.popup();
    popupHouse.options.type = 'boat_popup';

    if (isMap) {
        popupHouse
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(boatPopupHTML())
            .addTo(map);

        const world = document.querySelector('.world');
        world.onclick = () => {
            toggleBoatView('boat-world');
            map.closePopup();
        }

        const country = document.querySelector('.country');
        country.onclick = () => {
            toggleBoatView("boat-countries");
            map.closePopup();
        }
    }

    window.handleSelectMapElement = (value) => {
        map.on('click')
        setMapElementSelected(value);
        map.removeLayer(popupHouse);
    }
}


// ---------------------------------------------------------------------------------------------------------
// Popup shown when right-click on function marker
export const functionPopup = (map, setModal, setModalType, isLocked, e, setShapeOfMarkerFn, addMarkerProblemToList,
                              setShapeOfMarkerPl, removeMapLayerById, updateStatusDisplayMapLayerByNameAndType,
                              updateStatusDisplayListMarkerFunctionByName, setMapLayer, updateNameItemMapLayerByNameAndType,
                              updateNameItemListMarkerFunctionByName) => {
    clearAllPopups(map);

    let type = false;

    let error = e.target.options.solution;
    if (!error) {
        error = e.target.options.problem;
    }
    let isFlashing = e.target.options.isFlashing;
    let hasBoundary = e.target.options.boundary;
    const name = e.target._icon.innerText;

    if (
        name.startsWith("Natural") || name.startsWith("Non-natural") ||
        name.startsWith("Existing") || name.startsWith("Added")
    ) {
        type = true;
    }

    const popup = L.popup([e.latlng.lat, e.latlng.lng], {
        content: fnPopupHTML(name, type, error, hasBoundary, isFlashing),
        offset: L.point(0, e.latlng.lat < 20 ? 0 : 440)
    });

    popup.addTo(map)

    window.openRenameModal = () => {
        setModalType('rename');
        setModal(true);
    };

    if (error) {
        window.problem = error;
    }

    window.handleToggleFlasingFn = () => {
        const random = Math.round(Math.random() * 10) % 6;
        if (!e.target.options.isFlashing) {
            e.target._icon.classList.add(styles[`simulation-animate1`]);
            e.target.options.isFlashing = true;
        } else {
            e.target.options.isFlashing = false;
            for (let i = 0; i < 6; i++) {
                e.target._icon.classList.remove(styles[`simulation-animate1`]);
            }
        }
        map.removeLayer(popup);
    }

    window.handleToggleBoundaryFn = () => {
        if (!e.target.options.boundary) {
            if (e.target.options.problem) {
                setModalType('boundary-problem');
                setModal(true);
            } else if (name.startsWith("Natural") || name.startsWith('h\nn\n(t)')) {
                setModalType('boundary-natural');
                setModal(true);
            } else {
                e.target._icon.classList.add(styles["boundary"]);
                e.target.options.boundary = true;
            }

        } else {
            e.target._icon.classList.remove(styles["boundary"]);
            e.target.options.boundary = false;
        }
        map.removeLayer(popup);
    }

    window.edittingItem = (
        color, name, index,
        currentColor = e.target._icon.classList[2],
        currentName = e.target._icon.innerText
    ) => {

        index = [e.target.options?.target?.index];
        let shape = e.target.options?.target?.shape

        // if (name === 'Function') {
        //     index = markerFnIndex;
        // }

        if (!name || color) {
            e.target.options.solution && delete e.target.options.solution;
            e.target.options.problem && delete e.target.options.problem;
        }

        if (color === 'green' && !type) {
            e.target.options.solution = 'solution';
        } else if (color === 'red') {
            e.target.options.problem = 'problem';
            if (currentName.includes('Natural')) {
                color = 'orange'
            } else if (currentName.includes('Non-natural')) {
                color = 'red'
            }
        }
        map.removeLayer(popup);

        if (name === 'Problem') {
            if (Number(index[0]) <= markerProblemIndex[0] - 1) {
                addMarkerProblemToList(index[0], shape);
                setMapLayer(e.latlng.lat, e.latlng.lng, 'Problem ' + index[0], 'problem', shape)
                markerProblemIndex[0] = index[0];
            } else {
                addMarkerProblemToList(markerProblemIndex[0], shape);
                setMapLayer(e.latlng.lat, e.latlng.lng, 'Problem ' + markerProblemIndex[0], 'problem', shape)
                markerProblemIndex[0]++;
            }
            updateStatusDisplayListMarkerFunctionByName(currentName, false);
            updateStatusDisplayMapLayerByNameAndType(currentName, 'function', false);
        } else {
            updateNameItemListMarkerFunctionByName(currentName, name + ' ' + index[0]);
            updateNameItemMapLayerByNameAndType(currentName, 'function', name + ' ' + index[0]);

            if (!currentName.startsWith(name)) {
                stopFnRunningFeatures(e);

                if (e.target._icon.classList.contains(styles['circle-fn'])) {
                    e.target.setIcon(
                        markerFnCircleIcon(
                            `${styles['circle-fn']} ${color ? styles['fn--' + color] : currentColor}`,
                            handleName(name, index, currentName)
                        )
                    );
                } else if (e.target._icon.classList.contains(styles['rectangle-fn'])) {
                    e.target.setIcon(
                        markerFnIcon(
                            `${styles['rectangle-fn']} ${color ? styles['fn--' + color] : currentColor}`,
                            handleName(name, index, currentName)
                        )
                    );
                } else if (e.target._icon.classList.contains(styles['ellipse-fn'])) {
                    e.target.setIcon(
                        markerFnIcon(
                            `${styles['ellipse-fn']} ${color ? styles['fn--' + color] : currentColor}`,
                            handleName(name, index, currentName)
                        )
                    )
                }
            }
        }
    };

    window.fnAddImg = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        if (e.target._popup) {
            e.target.closePopup();
        }

        e.target.bindPopup(
            (e) => imgBoundPopupHTML(objectUrl, undefined, 'Function'),
            {
                offset: L.point(0, 60),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.fnAddAudio = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        if (e.target._popup) {
            e.target.closePopup();
        }

        e.target.bindPopup(
            (e) => audioBoundPopupHTML(objectUrl),
            {
                offset: L.point(0, 120),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.fnAddVideo = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        if (e.target._popup) {
            e.target.closePopup();
        }

        e.target.bindPopup(
            (e) => videoBoundPopupHTML(objectUrl),
            {
                offset: L.point(0, 240),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.replaceFnWithImg = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomImgIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        stopFnRunningFeatures(e);

        map.removeLayer(popup);
    }

    window.replaceFnWithAudio = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomAudioIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        stopFnRunningFeatures(e);

        map.removeLayer(popup);
    }

    window.replaceFnWithVideo = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        stopFnRunningFeatures(e);

        e.target.setIcon(
            markerCustomVideoIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        map.removeLayer(popup);
    }

    window.changeShape = (shape) => {
        let name = e.target.options.icon.options?.html;

        if (shape === 'circle') {
            setShapeOfMarkerFn(name, 'circle');
            e.target.setIcon(
                markerFnCircleIcon(
                    `${styles['circle-fn']} ${e.target._icon.classList[2]}`,
                    name
                )
            );
        } else if (shape === 'rectangle') {
            setShapeOfMarkerFn(name, 'rectangle')
            e.target.setIcon(
                markerFnIcon(
                    `${styles['rectangle-fn']} ${e.target._icon.classList[2]}`,
                    name
                )
            );
        } else if (shape === 'ellipse') {
            setShapeOfMarkerFn(name, 'ellipse')
            e.target.setIcon(
                markerFnIcon(
                    `${styles['ellipse-fn']} ${e.target._icon.classList[2]}`,
                    name
                )
            );
        }
        e.target.options.target.shape = shape;

        stopFnRunningFeatures(e);

        map.removeLayer(popup);
    }

    // // Group all selected function
    // window.makeGroup = () => {
    //   L.marker([e.latlng.lat, e.latlng.lng], {
    //     draggable: !isLocked,
    //     group: {
    //       group: [...functionSelected.sort()],
    //       index: groupFnIndex[0],
    //     },
    //     icon: markerFnIcon(
    //       `${styles['rectangle-fn']} ${styles['fn--black']}`,
    //       `Group function ${groupFnIndex[0]}`
    //     ),
    //   })
    //     .addTo(map)
    //     .bindPopup(e => groupFnLayoutPopupHTML(e.options.group.group), {
    //       className: styles['group-rectangle'],
    //       offset: L.point(30, -12),
    //       autoClose: false,
    //       closeOnClick: false,
    //     })
    //     .on('contextmenu', e => groupPopup(map, e))
    //     .openPopup();

    //   groupFnIndex[0]++;

    //   map.eachLayer(layer => {
    //     if (layer.options.index) {
    //       functionSelected.forEach(element => {
    //         if (element === layer.options.index) {
    //           layer.remove();
    //         }
    //       });
    //     }
    //   });
    //   functionSelected.splice(0, functionSelected.length);
    // }

    // Replace problem / solution
    window.handleAddProblem = (name) => {
        stopFnRunningFeatures(e);
        addMarkerProblemToList(markerProblemIndex[0], 'rectangle');
        addSoluOrProbFn(map, e.latlng.lat, e.latlng.lng, isLocked, markerProblemIndex[0], name, setModal, setModalType, setShapeOfMarkerPl, 'rectangle')
        markerProblemIndex[0]++;
        map.removeLayer(e.target);
        map.removeLayer(popup);
    };

    window.deleteItem = () => {
        map.removeLayer(e.target);
        map.removeLayer(popup);
        removeMapLayerById('function', 'Function ' + e.target.options.target.index);
    }

    window.changeToStopFunction = () => {
        stopFnRunningFeatures(e);
        addStopFn(map, e.latlng.lat, e.latlng.lng, isLocked, e.target.options.target.index);
        map.removeLayer(e.target);
        map.removeLayer(popup);
    }

    window.changeToTemporaryFunction = () => {
        stopFnRunningFeatures(e);
        addTemporaryFn(map, e.latlng.lat, e.latlng.lng, isLocked, e.target.options.target.index, e.target._icon.innerText);
        map.removeLayer(e.target);
        map.removeLayer(popup);
    }
}

// ---------------------------------------------------------------------------------------------------------
// Popup shown when right-click on person marker
export const personPopup = (map, marker, setModal, setModalType, isLocked, e, setPersonToListMapElementSelected,
                            resetNumberPersonMobility, updateMapLayerById, removeMapLayerById) => {
    clearAllPopups(map);
    const popup = L.popup([e.latlng.lat, e.latlng.lng], {
        content: personPopupHTML(),
        offset: L.point(130, e.latlng.lat < 20 ? -10 : 200)
    });
    popup.addTo(map);

    window.openRenameModal = () => {
        setModal(true);
        setModalType('rename');
    };

    window.setProfile = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerPersonIcon(styles['person'], e.target._icon.textContent, objectUrl)
        );

        map.removeLayer(popup);
    }

    window.edittingItem = (color, name) => {
        const img = e.target._icon.firstChild.currentSrc;
        e.target.setIcon(markerPersonIcon(styles['person'], name, img));
    }

    let path = null;
    let index = marker.options?.target?.index;

    // let path =
    window.showMoveWithPath = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);
            updateMapLayerById(clickedLatLng.lat, clickedLatLng.lng, 'person', 'Person ' + index, true);

            removeItemArrow(map, index);

            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'black',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: true,
                    showMarker: false,
                    icon: markerPersonWaveIcon(`${styles['icon-mobility']}`, 'Person ' + index, null)
                }
            )
                .arrowheads({size: '7px', color: 'black', type: 'arrow', status: 'add', index: 'arrow' + index})
                .addTo(map);

            setTimeout(() => {
                let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                    target: {
                        type: 'person',
                        index: index,
                        status: 'add',
                    },
                    icon: markerPersonWaveIcon(`${styles['icon-mobility']}`, 'Person ' + index, null)
                }).on('contextmenu', e => personPopup(map, newMarker, setModal, setModalType, isLocked, e,
                    setPersonToListMapElementSelected, resetNumberPersonMobility, updateMapLayerById, removeMapLayerById))
                    .addTo(map);
            }, 3000);

            map.off('click');
        });
    }

    window.showMoveWithoutPath = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);
            updateMapLayerById(clickedLatLng.lat, clickedLatLng.lng, 'person', 'Person ' + index, true);

            let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                target: {
                    type: 'person',
                    index: index,
                    status: 'add',
                }
            });
            removeItemArrow(map, index);


            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'transparent',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: false,
                    showMarker: true,
                    icon: markerPersonWaveIcon(`${styles['icon-mobility']}`, 'Person ' + index, null)
                }
            )
                // .arrowheads({size: '5%', color: 'transparent', type: 'arrow', status: 'add', index: 'arrow' + index})
                .on('contextmenu', e => personPopup(map, newMarker, setModal, setModalType, isLocked, e,
                    setPersonToListMapElementSelected, resetNumberPersonMobility, updateMapLayerById, removeMapLayerById))
                .addTo(map);
            map.off('click');
            updateMapLayerById(clickedLatLng.lat, clickedLatLng.lng, 'person', 'Person ' + index, true);
        });
    }

    window.showMoveWithPathGivenSet = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);

            setTimeout(() => {
                let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                    target: {
                        type: 'person',
                        index: index,
                        status: 'add',
                    },
                    icon: markerGivenSetPersonWaveIcon(`${styles['icon-mobility']}`, 'Person ' + index)
                }).on('contextmenu', e => personPopup(map, newMarker, setModal, setModalType, isLocked, e,
                    setPersonToListMapElementSelected, resetNumberPersonMobility, updateMapLayerById, removeMapLayerById))
                    .addTo(map);
            }, 3000);
            removeItemArrow(map, index);

            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'black',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: true,
                    showMarker: false,
                    icon: markerGivenSetPersonWaveIcon(`${styles['icon-mobility']}`, 'Person ' + index)
                }
            )
                .arrowheads({size: '7px', color: 'black', type: 'arrow', status: 'add', index: 'arrow' + index})
                .addTo(map);
            map.off('click');
            updateMapLayerById(clickedLatLng.lat, clickedLatLng.lng, 'person', 'Person ' + index, true);
        });
    }

    window.showMoveWithoutPathGivenSet = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);
            removeItemArrow(map, index);
            let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                target: {
                    type: 'person',
                    index: index,
                    status: 'add',
                }
            });

            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'transparent',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: false,
                    showMarker: true,
                    icon: markerGivenSetPersonWaveIcon(`${styles['icon-mobility']}`, 'Person ' + index)
                }
            )
                // .arrowheads({size: '5%', color: 'transparent', type: 'arrow', status: 'add', index: 'arrow' + index})
                .on('contextmenu', e => personPopup(map, newMarker, setModal, setModalType, isLocked, e,
                    setPersonToListMapElementSelected, resetNumberPersonMobility, updateMapLayerById, removeMapLayerById))
                .addTo(map);
            map.off('click');
            updateMapLayerById(clickedLatLng.lat, clickedLatLng.lng, 'person', 'Person ' + index, true);
        });
    }

    window.addRelatePerson = (value) => {
        setPersonToListMapElementSelected('Person', e.latlng.lat, e.latlng.lng, value);
        map.removeLayer(popup);
        map.eachLayer((layer) => {
            if (layer.options.target?.type === "person" && layer.options.target?.index === index) {
                layer?.dragging.disable();
            }
        });
        // map.off('click');
    }

    window.deleteItem = () => {
        map.removeLayer(e.target);
        map.removeLayer(popup);
        if (path) {
            map.removeLayer(path);
        }
        removeItemArrow(map, index);
        removeMapLayerById('person', 'Person ' + index);
    }
}

export const personMobilityPopup = (map, marker, setModal, setModalType, isLocked, e) => {
    clearAllPopups(map);
    const popup = L.popup([e.latlng.lat, e.latlng.lng], {
        content: personMobilityPopupHTML(),
        offset: L.point(120, 80)
    });
    popup.addTo(map);

    let path = null;
    let index = marker.options?.target?.index;

    window.showMoveWithPath = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);
            removeItemArrow(map, index);

            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'black',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: true,
                    showMarker: false,
                    icon: markerPersonWaveIcon(`${styles['icon-mobility']}`, 'Person', null)
                }
            )
                .arrowheads({size: '7px', color: 'black', type: 'arrow', status: 'add', index: 'arrow' + index})
                .addTo(map);

            setTimeout(() => {
                let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                    target: {
                        type: 'person',
                        index: index,
                        status: 'add',
                    },
                    icon: markerPersonWaveIcon(`${styles['icon-mobility']}`, 'Person', null)

                }).on('contextmenu', e => personMobilityPopup(map, newMarker, setModal, setModalType, isLocked, e))
                    .addTo(map);
            }, 3000);

            map.off('click');
        });
    }

    window.showMoveWithoutPath = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);

            let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                target: {
                    type: 'person',
                    index: index,
                    status: 'add',
                }
            });
            removeItemArrow(map, index);


            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'transparent',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: false,
                    showMarker: true,
                    icon: markerPersonWaveIcon(`${styles['icon-mobility']}`, 'Person', null)
                }
            )
                .on('contextmenu', e => personMobilityPopup(map, newMarker, setModal, setModalType, isLocked, e))
                .addTo(map);
            map.off('click');
        });
    }

    window.showMoveWithPathGivenSet = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);

            setTimeout(() => {
                let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                    target: {
                        type: 'person',
                        index: index,
                        status: 'add',
                    },
                    icon: markerGivenSetPersonWaveIcon(`${styles['icon-mobility']}`, 'Person')
                }).on('contextmenu', e => personMobilityPopup(map, newMarker, setModal, setModalType, isLocked, e))
                    .addTo(map);
            }, 3000);
            removeItemArrow(map, index);

            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'black',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: true,
                    showMarker: false,
                    icon: markerGivenSetPersonWaveIcon(`${styles['icon-mobility']}`, 'Person')
                }
            )
                .arrowheads({size: '7px', color: 'black', type: 'arrow', status: 'add', index: 'arrow' + index})
                .addTo(map);
            map.off('click');
        });
    }

    window.showMoveWithoutPathGivenSet = () => {
        map.removeLayer(popup);
        map.on('click', function (eventClick) {
            let clickedLatLng = eventClick.latlng;
            let currentLatLng = marker.getLatLng();

            map.removeLayer(e.target);
            removeItemArrow(map, index);
            let newMarker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
                target: {
                    type: 'person',
                    index: index,
                    status: 'add',
                }
            });

            path = L.motion.polyline(
                [currentLatLng, clickedLatLng],
                {
                    color: 'transparent',
                    status: 'add'
                },
                {
                    auto: true,
                    duration: 3000
                },
                {
                    removeOnEnd: false,
                    showMarker: true,
                    icon: markerGivenSetPersonWaveIcon(`${styles['icon-mobility']}`, 'Person')
                }
            )
                .on('contextmenu', e => personMobilityPopup(map, newMarker, setModal, setModalType, isLocked, e))
                .addTo(map);
            map.off('click');
        });
    }

    window.deleteItem = () => {
        map.removeLayer(e.target);
        map.removeLayer(popup);
        if (path) {
            map.removeLayer(path);
        }
        removeItemArrow(map, index);
    }
}

const removeItemArrow = (map, index) => {
    map.eachLayer(layer => {
        if (layer.options.type === 'arrow' && layer.options.index === 'arrow' + index && layer.options.status === 'add') {
            map.removeLayer(layer);
        }
    })
}

// ---------------------------------------------------------------------------------------------------------
// Popup shown when right-click on problem/solution marker
export const fnProblemPopup = (map, e, setModal, setModalType, setShapeOfMarkerPl, addMarkerFnToList, setMapLayer,
                               updateStatusDisplayListMarkerProblemByName, updateStatusDisplayMapLayerByNameAndType) => {
    clearAllPopups(map);

    let hasBoundary = e.target.options.boundary;
    const name = e.target._icon.innerText;
    const popup = L.popup()
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(problemPopupHTML(hasBoundary))
        .addTo(map)

    window.deleteItem = () => {
        map.removeLayer(e.target);
        map.removeLayer(popup);
    }

    window.handleToggleBoundaryFn = () => {
        if (!e.target.options.boundary) {
            if (name.startsWith('Problem')) {
                setModalType('boundary-problem');
                setModal(true);
            } else {
                e.target._icon.classList.add(styles["boundary"]);
                e.target.options.boundary = true;
            }

        } else {
            e.target._icon.classList.remove(styles["boundary"]);
            e.target.options.boundary = false;
        }
        map.removeLayer(popup);
    }

    window.changeShapeProblem = (shape) => {
        let name = e.target.options.icon.options?.html;
        e.target.options.target.shape = shape;
        if (shape === "circle") {
            setShapeOfMarkerPl(name, shape);
            e.target._icon.classList.add(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["rectangle-fn"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
        } else if (shape === "rectangle") {
            setShapeOfMarkerPl(name, shape);
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.add(styles["rectangle-fn"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
        } else if (shape === "ellipse") {
            setShapeOfMarkerPl(name, shape);
            e.target._icon.classList.add(styles["ellipse-fn"]);
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["rectangle-fn"]);
        }
        map.removeLayer(popup);
    }

    window.replaceProblemToFn = () => {
        let index = [e.target.options?.type?.index];
        let shape = e.target.options?.target?.shape;
        let currentName = e.target._icon.innerText;
        let name = 'Function';
        if (Number(index[0]) <= markerFnIndex[0] - 1) {
            addMarkerFnToList(index[0]);
            setMapLayer(e.latlng.lat, e.latlng.lng, 'Function ' + index[0], 'function', shape)
            markerFnIndex[0] = index[0];
        } else {
            addMarkerFnToList(markerFnIndex[0]);
            setMapLayer(e.latlng.lat, e.latlng.lng, 'Function ' + markerFnIndex[0], 'function', shape)
            markerFnIndex[0]++;
        }
        updateStatusDisplayListMarkerProblemByName(currentName, false);
        updateStatusDisplayMapLayerByNameAndType(currentName, 'problem', false);

        if (e.target._icon.classList.contains(styles['circle-fn'])) {
            e.target.setIcon(
                markerFnCircleIcon(
                    `${styles['circle-fn']} ${styles['fn--black']}`,
                    handleName(name, index, currentName)
                )
            );
        } else if (e.target._icon.classList.contains(styles['rectangle-fn'])) {
            e.target.setIcon(
                markerFnIcon(
                    `${styles['rectangle-fn']} ${styles['fn--black']}`,
                    handleName(name, index, currentName)
                )
            );
        } else if (e.target._icon.classList.contains(styles['ellipse-fn'])) {
            e.target.setIcon(
                markerFnIcon(
                    `${styles['ellipse-fn']} ${styles['fn--black']}`,
                    handleName(name, index, currentName)
                )
            )
        }

        map.removeLayer(popup);
    }
}

export const wrappingPopup = (map, lat, lng, isLocked, selectedList, restrictPopup) => {
    clearAllPopups(map);
    console.log('selectedList', selectedList)
    const popupScan = L.popup()
        .setLatLng([lat, lng])
        .setContent(wrappingPopupHTML(restrictPopup))
        .addTo(map);

    // Cancel selection
    window.handleRemoveTempList = () => {
        removeTempList(selectedList);
        map.removeLayer(popupScan);
    }

    // Show distance between selected items
    window.handleShowDistance = () => {
        showDistance(selectedList, map, isLocked);
        map.removeLayer(popupScan);
    }

    // Add one person and one function to a main set
    window.addToMainSet = (_event) => {
        _event.stopPropagation();
        _event.preventDefault();
        setupMainSet(selectedList, map, lat, lng, isLocked);
        map.removeLayer(popupScan);
    }

    // Group all selected items
    window.getSelectedList = (_event) => {
        _event.stopPropagation();
        _event.preventDefault();
        setupGroup(selectedList, map, lat, lng, isLocked);
        map.removeLayer(popupScan);
    };

    window.closePopupScan = () => {
        map.removeLayer(popupScan);
    }
}

// ---------------------------------------------------------------------------------------------------------
// Popup shown when right-click on group marker
export const groupPopup = (map, e) => {
    clearAllPopups(map);
    const popup = L.popup();

    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(groupPopupHTML())
        .addTo(map);

    window.changeShapeOption = (shape) => {
        if (shape === "rectangle") {
            e.target.getPopup()._container.classList.remove(styles["group-ellipse"]);
            e.target.getPopup()._container.classList.remove(styles["group-circle"]);
            e.target.getPopup()._container.classList.add(styles["group-rectangle"]);
            e.target._icon.classList.remove(styles["circle-fn-group"]);
            e.target._icon.classList.remove(styles["ellipse-fn-group"]);
            e.target._icon.classList.add(styles["rectangle-fn-group"]);
        } else if (shape === "ellipse") {
            e.target.getPopup()._container.classList.remove(styles["group-rectangle"]);
            e.target.getPopup()._container.classList.remove(styles["group-circle"]);
            e.target.getPopup()._container.classList.add(styles["group-ellipse"]);
            e.target._icon.classList.remove(styles["circle-fn-group"]);
            e.target._icon.classList.remove(styles["rectangle-fn-group"]);
            e.target._icon.classList.add(styles["ellipse-fn-group"]);
        } else if (shape === "circle") {
            e.target.getPopup()._container.classList.remove(styles["group-ellipse"]);
            e.target.getPopup()._container.classList.remove(styles["group-rectangle"]);
            e.target.getPopup()._container.classList.add(styles["group-circle"]);
            e.target._icon.classList.remove(styles["rectangle-fn-group"]);
            e.target._icon.classList.remove(styles["ellipse-fn-group"]);
            e.target._icon.classList.add(styles["circle-fn-group"]);
        }

        map.removeLayer(popup);
    };

    window.replaceGroupWithImg = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomImgIcon(`${styles['rectangle-fn']} ${styles['group-fn-border']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        map.removeLayer(popup);
    }

    window.replaceGroupWithAudio = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomAudioIcon(`${styles['rectangle-fn']} ${styles['group-fn-border']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        map.removeLayer(popup);
    }

    window.replaceGroupWithVideo = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomVideoIcon(`${styles['rectangle-fn']} ${styles['group-fn-border']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        map.removeLayer(popup);
    }

    window.deleteGroup = () => {
        map.removeLayer(e.target);
        map.removeLayer(popup);
    }
}

// ---------------------------------------------------------------------------------------------------------
// Popup shown when right-click on mainset marker
// export const mainsetPopup = (map, e, toggleModalInsertNumberPerson, setPositionOfHorizontalLine) => {
//     clearAllPopups(map);
//
//     const popup = L.popup();
//
//     popup
//         .setLatLng([e.latlng.lat, e.latlng.lng])
//         .setContent(mainsetPopupHTML())
//         .addTo(map);
//
//     window.deleteMainSet = () => {
//         map.removeLayer(e.target);
//         map.removeLayer(popup);
//     }
//
//     window.insertHorizontalLine = () => {
//         toggleModalInsertNumberPerson();
//         setPositionOfHorizontalLine(e.latlng.lat, e.latlng.lng);
//     }
// }

export const routePopup = (map, distancePoint, distancePoint2, e) => {

    const popup = L.popup();
    // World popup will appear and override route popup
    // need to wait 10ms to get rid of world popup
    setTimeout(() => {
        clearAllPopups(map);
        popup
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(routePopupHTML())
            .addTo(map);
    }, 10);


    window.deleteInterRoute = () => {
        map.removeLayer(distancePoint.parentLine);
        map.removeLayer(distancePoint.parentLine_1);
        map.removeLayer(distancePoint.parentArc);

        if (distancePoint.parentArcArrow) {
            map.removeLayer(distancePoint.parentArcArrow);
        }
        if (distancePoint.parentArcArrow_1) {
            map.removeLayer(distancePoint.parentArcArrow_1);
        }

        map.removeLayer(distancePoint);
        map.removeLayer(distancePoint2);
        map.removeLayer(popup);
    }

    window.changeRoute = () => {
        let direct = (distancePoint.getLatLng().lng < distancePoint2.getLatLng().lng) ? true : false;

        if (
            distancePoint.parentArc.options.color === 'blue' ||
            distancePoint.parentArc.options.color === 'black'
        ) {
            map.eachLayer((layer) => {
                resetAllColor(layer);
            });

            distancePoint.parentLine.setStyle({color: 'blue'});
            distancePoint.parentArc.setStyle({color: "transparent"});
            distancePoint.parentArcArrow.remove();
            distancePoint.parentArcArrow_1.remove();
            distancePoint.parentArc.setText(null);
            distancePoint.parentLine.setText('Inter-route', {
                center: true,
                offset: -3,
                orientation: !direct ? 180 : 0,
            });

            map.removeLayer(distancePoint.parentLine);
            map.removeLayer(distancePoint.parentLine_1);

            distancePoint.parentLine_1.arrowheads({
                color: 'black',
                type: 'arrow',
                size: '5%',
                status: 'add'
            }).addTo(map);
            distancePoint.parentLine.arrowheads({
                color: 'black',
                type: 'arrow',
                size: '5%',
                status: 'add'
            }).addTo(map);

        } else {
            const point = distancePoint.parentArc.trace([0.1, 0.9]);

            const arcArrow = L.polyline(
                [
                    [point[0].lat, point[0].lng],
                    [distancePoint.getLatLng().lat, distancePoint.getLatLng().lng]
                ],
                {color: 'transparent'}
            ).arrowheads({color: 'black', status: 'add', type: 'arrow'}).addTo(map);

            const arcArrow_1 = L.polyline(
                [
                    [point[1].lat, point[1].lng],
                    [distancePoint2.getLatLng().lat, distancePoint2.getLatLng().lng]
                ],
                {color: 'transparent'}
            ).arrowheads({color: 'black', status: 'add', type: 'arrow'}).addTo(map);

            distancePoint.parentArcArrow = arcArrow;
            distancePoint.parentArcArrow_1 = arcArrow_1;
            distancePoint2.parentArcArrow = arcArrow;
            distancePoint2.parentArcArrow_1 = arcArrow_1;

            map.eachLayer((layer) => {
                resetAllColor(layer);
            });

            distancePoint.parentArc.setStyle({color: 'blue'});
            distancePoint.parentLine.setStyle({color: 'transparent'});
            distancePoint.parentLine.setText(null);
            distancePoint.parentLine_1.deleteArrowheads();
            distancePoint.parentLine.deleteArrowheads();
            distancePoint.parentArc.setText("Arc-route", {
                center: true,
                offset: -3,
                orientation: !direct ? 180 : 0,
            })
        }
        map.removeLayer(popup);
    }
}

export const distancePopup = (map, distancePoint, distancePoint2, e) => {
    const popup = L.popup()

    // Looking for explainaion ? Read at routePopup func.
    setTimeout(() => {
        clearAllPopups(map);
        popup
            .setLatLng([e.latlng.lat, e.latlng.lng])
            .setContent(distancePopupHTML())
            .addTo(map);
    }, 10);


    window.deleteDistanceLine = () => {
        map.removeLayer(distancePoint.parentLine);
        map.removeLayer(distancePoint.parentLine_1);
        map.removeLayer(distancePoint.parentArc);
        if (distancePoint.parentArcArrow) {
            map.removeLayer(distancePoint.parentArcArrow);
        }
        if (distancePoint.parentArcArrow_1) {
            map.removeLayer(distancePoint.parentArcArrow_1);
        }
        map.removeLayer(distancePoint);
        map.removeLayer(distancePoint2);
        map.removeLayer(popup);
    };

    window.changeDistance = () => {
        let direct = false;
        let name = distancePoint.parentLine._text;
        if (!name) {
            name = distancePoint.parentArc._text;
        }
        if (distancePoint.getLatLng().lng < distancePoint2.getLatLng().lng) {
            direct = true;
        } else {
            direct = false;
        }

        if (
            distancePoint.parentArc.options.color === 'blue' ||
            distancePoint.parentArc.options.color === 'black'
        ) {
            map.eachLayer(layer => {
                resetAllColor(layer);
            });
            distancePoint.parentLine.setStyle({
                color: "blue",
            });

            distancePoint.parentArc.setStyle({color: "transparent"});
            distancePoint.parentArcArrow.remove();
            distancePoint.parentArcArrow_1.remove();
            distancePoint.parentArc.setText(null);
            distancePoint.parentLine.setText(name, {
                center: true,
                offset: -3,
                orientation: !direct ? 180 : 0,
            });

            map.removeLayer(distancePoint.parentLine);
            map.removeLayer(distancePoint.parentLine_1);

            distancePoint.parentLine_1.arrowheads({
                color: 'black',
                type: 'arrow',
                size: '5%',
            }).addTo(map);
            distancePoint.parentLine.arrowheads({
                color: 'black',
                type: 'arrow',
                size: '5%',
            }).addTo(map);
        } else {
            const point = distancePoint.parentArc.trace([0.1, 0.9]);

            const arcArrow = L.polyline(
                [
                    [point[0].lat, point[0].lng],
                    [distancePoint.getLatLng().lat, distancePoint.getLatLng().lng],
                ],
                {color: 'transparent'}
            ).arrowheads({color: 'black', status: 'add', type: 'arrow'}).addTo(map);

            const arcArrow_1 = L.polyline(
                [
                    [point[1].lat, point[1].lng],
                    [distancePoint2.getLatLng().lat, distancePoint2.getLatLng().lng],
                ],
                {color: 'transparent'}
            ).arrowheads({color: 'black', status: 'add', type: 'arrow'}).addTo(map);

            distancePoint.parentArcArrow = arcArrow;
            distancePoint.parentArcArrow_1 = arcArrow_1;
            distancePoint2.parentArcArrow = arcArrow;
            distancePoint2.parentArcArrow_1 = arcArrow_1;

            map.eachLayer(layer => {
                if (layer.options.type === "distance") {
                    layer.parentLine.options.color === "blue" &&
                    layer.parentLine.setStyle({color: "black"});
                    layer.parentArc.options.color === "blue" &&
                    layer.parentArc.setStyle({color: "black"});
                }
            });

            distancePoint.parentArc.setStyle({color: 'blue'});
            distancePoint.parentLine.setStyle({color: 'transparent'});

            distancePoint.parentLine_1.deleteArrowheads();
            distancePoint.parentLine.deleteArrowheads();

            map.invalidateSize();

            distancePoint.parentLine.setText(null);
            distancePoint.parentArc.setText(name, {
                center: true,
                offset: -3,
                orientation: !direct ? 180 : 0,
            });
        }

        map.removeLayer(popup);
    }
}

export const fnCountryPopup = (map, e, setModal, setModalType) => {
    clearAllPopups(map);
    // console.log(e.target)
    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(countryFnPopupHTML())
        .addTo(map)

    window.openChangeSizeCountryModal = () => {
        let type = 'change-size-country';
        const size = e.target.options.icon.options.iconSize;
        // if (size && Array.isArray(size)) {
        //   type += `_${size[0]},${size[1]}`;
        // }
        setModal(true);
        setModalType(type);
        map.removeLayer(popup);
    }

    window.changeSizeCountryFn = (width, height) => {
        const icon = e.target.options.icon;
        icon.options.iconSize = [width, height];
        e.target.setIcon(icon);
        map.removeLayer(popup);
    }

    window.changeShapeCountryFn = (shape) => {
        if (shape === "circle") {
            e.target._icon.classList.remove(styles["rectangle-fn"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
            e.target._icon.classList.add(styles["circle-fn-1"]);
            e.target.getPopup()?._container?.classList.remove(styles["group-ellipse"]);
            e.target.getPopup()?._container?.classList.remove(styles["group-rectangle"]);
            e.target.getPopup()?._container?.classList.add(styles["group-circle"]);
        } else if (shape === "rectangle") {
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
            e.target._icon.classList.add(styles["rectangle-fn"]);
            e.target.getPopup()?._container?.classList.remove(styles["group-ellipse"]);
            e.target.getPopup()?._container?.classList.remove(styles["group-circle"]);
            e.target.getPopup()?._container?.classList.add(styles["group-rectangle"]);
        } else if (shape === "ellipse") {
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["rectangle-fn"]);
            e.target._icon.classList.add(styles["ellipse-fn"]);
            e.target.getPopup()?._container?.classList.remove(styles["group-rectangle"]);
            e.target.getPopup()?._container?.classList.remove(styles["group-circle"]);
            e.target.getPopup()?._container?.classList.add(styles["group-ellipse"]);
        }
        map.removeLayer(popup);
    }

    window.openRenameCountryModal = () => {
        let type = 'rename-country-fn'
        setModal(true);
        const rawName = e.target._icon.innerText;
        if (rawName && typeof rawName === 'string') {
            const names = rawName.split('\n');
            type += `_${names[0]},${names[names.length - 1]}`;
        }
        // console.log(type);
        setModalType(type);
        map.removeLayer(popup);
    }

    window.changeNameCountryFn = (firstName, secondName) => {
        const className = e.target.options.icon?.options?.className;
        const size = e.target.options.icon?.options?.iconSize;
        e.target.setIcon(
            markerCountryFnIcon(
                className, firstName, secondName, size[0], size[1]
            )
        );
    }

    window.deleteCountryFn = () => {
        map.setMaxZoom(16);
        map.removeLayer(e.target);
        map.removeLayer(popup);
    }

}

export const stopFnPopup = (map, e) => {
    clearAllPopups(map);

    const popup = L.popup();

    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(stopFnPopupHTML())
        .addTo(map)

    window.changeShapeStopFn = (shape) => {
        if (shape === "circle") {
            e.target._icon.classList.add(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["rectangle-fn"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
        } else if (shape === "rectangle") {
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.add(styles["rectangle-fn"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
        } else if (shape === "ellipse") {
            e.target._icon.classList.add(styles["ellipse-fn"]);
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["rectangle-fn"]);
        }
        map.removeLayer(popup);
    }

    window.deleteStopFn = () => {
        map.removeLayer(e.target);
        map.removeLayer(popup);
    }
}

export const tempFnPopup = (map, e) => {
    clearAllPopups(map);

    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(tempFnPopupHTML())
        .addTo(map)

    window.changeShapeTempFn = (shape) => {
        if (shape === "circle") {
            e.target._icon.classList.add(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["rectangle-fn"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
        } else if (shape === "rectangle") {
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.add(styles["rectangle-fn"]);
            e.target._icon.classList.remove(styles["ellipse-fn"]);
        } else if (shape === "ellipse") {
            e.target._icon.classList.add(styles["ellipse-fn"]);
            e.target._icon.classList.remove(styles["circle-fn-1"]);
            e.target._icon.classList.remove(styles["rectangle-fn"]);
        }
        map.removeLayer(popup);
    }

    window.deleteTempFn = () => {
        map.removeLayer(e.target);
        map.removeLayer(popup);
    }
}

export const floorPopup = (map, e, lat, lng) => {
    clearAllPopups(map);
    console.log(e)
    const popup = L.popup();

    popup
        .setLatLng([lat, lng])
        .setContent(floorPopupHTML())
        .addTo(map)

    window.roomAddImg = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        map.removeLayer(popup);

        e.target.bindPopup(
            (e) => imgBoundPopupHTML(objectUrl, undefined, 'Floor'),
            {
                offset: L.point(0, 60),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.roomAddAudio = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        map.removeLayer(popup);

        e.target.bindPopup(
            (e) => audioBoundPopupHTML(objectUrl),
            {
                offset: L.point(0, 120),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.roomAddVideo = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        map.removeLayer(popup);

        e.target.bindPopup(
            (e) => videoBoundPopupHTML(objectUrl),
            {
                offset: L.point(0, 240),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.replaceRoomWithImg = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomImgIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        // stopFnRunningFeatures(e);

        map.removeLayer(popup);
    }

    window.replaceRoomWithAudio = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomAudioIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        // stopFnRunningFeatures(e);

        map.removeLayer(popup);
    }

    window.replaceRoomWithVideo = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        // stopFnRunningFeatures(e);

        e.target.setIcon(
            markerCustomVideoIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        map.removeLayer(popup);
    }

    // window.defaultRoom = () => {
    //   if(e.target.options.options?.name) {
    //     e.target.setIcon(
    //       markerRoomIcon(
    //         `${styles['room-icon']}`,
    //         e.target.options.options.name,
    //       )
    //     );
    //   }
    //   map.removeLayer(popup);
    // }
}

export const roomPopup = (map, e) => {
    clearAllPopups(map);
    console.log(e)
    const popup = L.popup();

    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(roomPopupHTML())
        .addTo(map)

    window.roomAddImg = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        map.removeLayer(popup);

        e.target.bindPopup(
            (e) => imgBoundPopupHTML(objectUrl, 'Room'),
            {
                offset: L.point(0, 60),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.roomAddAudio = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        map.removeLayer(popup);

        e.target.bindPopup(
            (e) => audioBoundPopupHTML(objectUrl),
            {
                offset: L.point(0, 120),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.roomAddVideo = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        map.removeLayer(popup);

        e.target.bindPopup(
            (e) => videoBoundPopupHTML(objectUrl),
            {
                offset: L.point(0, 240),
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        )
            .openPopup();
    }

    window.replaceRoomWithImg = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomImgIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        // stopFnRunningFeatures(e);

        map.removeLayer(popup);
    }

    window.replaceRoomWithAudio = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        e.target.setIcon(
            markerCustomAudioIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        // stopFnRunningFeatures(e);

        map.removeLayer(popup);
    }

    window.replaceRoomWithVideo = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        // stopFnRunningFeatures(e);

        e.target.setIcon(
            markerCustomVideoIcon(`${styles['rectangle-fn']} ${styles['hide-text']}`, e.target._icon.outerText, objectUrl)
        );

        map.removeLayer(popup);
    }

    // window.defaultRoom = () => {
    //   if(e.target.options.options?.name) {
    //     e.target.setIcon(
    //       markerRoomIcon(
    //         `${styles['room-icon']}`,
    //         e.target.options.options.name,
    //       )
    //     );
    //   }
    //   map.removeLayer(popup);
    // }
}

// Popup shown when right-click element map marker
export const mapElementPopup = (map, e, setMapElementRelate, id) => {
    clearAllPopups(map);
    const popup = L.popup([e.latlng.lat, e.latlng.lng], {
        content: mapElementPopupHTML(),
        // offset: L.point(0, e.latlng.lat < 20 ? -10 : 200)
    });
    popup.addTo(map);

    window.handleSelectMapRelate = (value) => {
        setMapElementRelate(value, id);
        map.removeLayer(popup);
    }

    window.deleteEquation = () => {
        map.removeLayer(popup);
        map.removeLayer(e.target);
    }
}

export const givenSetPopup = (map, e, resetPositionOfHorizontalLine) => {
    clearAllPopups(map);
    const popup = L.popup([e.latlng.lat, e.latlng.lng], {
        content: givenSetPopupHTML(),
    });
    popup.addTo(map);

    let index = e.target.options?.type?.index;

    window.deleteMainSet = () => {
        resetPositionOfHorizontalLine();
        map.removeLayer(popup);
        map.removeLayer(e.target);
    }
    window.arrowDirectionBottom = () => {
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-right"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-left"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-top"]);
        document.getElementById('line-given-set-' + index).classList.add(styles["arrow-given-set-bottom"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-right"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-left"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-up"]);
        document.getElementById('arrow-given-set-' + index).classList.add(styles["arrow-down"]);
        map.removeLayer(popup);
    }
    window.arrowDirectionRight = () => {
        document.getElementById('line-given-set-' + index).classList.add(styles["arrow-given-set-right"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-left"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-top"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-bottom"]);
        document.getElementById('arrow-given-set-' + index).classList.add(styles["arrow-right"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-left"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-up"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-down"]);
        map.removeLayer(popup);

    }
    window.arrowDirectionLeft = () => {
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-right"]);
        document.getElementById('line-given-set-' + index).classList.add(styles["arrow-given-set-left"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-top"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-bottom"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-right"]);
        document.getElementById('arrow-given-set-' + index).classList.add(styles["arrow-left"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-up"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-down"]);
        map.removeLayer(popup);
    }
    window.arrowDirectionTop = () => {
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-right"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-left"]);
        document.getElementById('line-given-set-' + index).classList.add(styles["arrow-given-set-top"]);
        document.getElementById('line-given-set-' + index).classList.remove(styles["arrow-given-set-bottom"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-right"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-left"]);
        document.getElementById('arrow-given-set-' + index).classList.add(styles["arrow-up"]);
        document.getElementById('arrow-given-set-' + index).classList.remove(styles["arrow-down"]);
        map.removeLayer(popup);
    }
}


// Popup shown when right-click icon rect
export const removeRectIconPopup = (map, e, removeCountryToRect) => {
    clearAllPopups(map);
    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(rectIconPopupHTML())
        .addTo(map)

    window.deleteRectIcon = () => {
        removeCountryToRect(e.target.options.options.type)
        map.removeLayer(popup);
    }
}

export const removeVerticalPersonIconPopup = (map, e, removeVerticalIcon) => {
    clearAllPopups(map);
    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(rectIconPopupHTML())
        .addTo(map)

    window.deleteRectIcon = () => {
        removeVerticalIcon()
        map.removeLayer(popup);
    }
}

export const removeHorizontalIconPopup = (map, e, removeHorizontalIcon) => {
    clearAllPopups(map);
    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(rectIconPopupHTML())
        .addTo(map)

    window.deleteRectIcon = () => {
        removeHorizontalIcon()
        map.removeLayer(popup);
    }
}

export const imagePalletPopup = (map, e, removeImagePalletById) => {
    clearAllPopups(map);
    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(imagePalletPopupHTML)
        .addTo(map)

    let id = e.target.options.index

    window.deleteImagePallet = () => {
        map.removeLayer(popup);
        map.removeLayer(e.target);
        removeImagePalletById(id);
    }
}

export const textPalletPopup = (map, e, toggleShowDialogEditTextStyle, setItemAnnotationStyling, setValueTextPallet, removeTextPalletById) => {
    clearAllPopups(map);
    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(textPalletPopupHTML)
        .addTo(map)

    let id = e.target.options?.target?.index

    window.deleteAnnotation = () => {
        map.removeLayer(popup);
        map.removeLayer(e.target);
        removeTextPalletById(id);
    }

    window.editTextStyle = () => {
        map.removeLayer(popup);
        toggleShowDialogEditTextStyle();
        setItemAnnotationStyling(id, 'text-pallet');
        let valueText = document.getElementById(`input_text_${id}`).value;
        setValueTextPallet(id, valueText);
    }
}

export const annotationPalletPopup = (map, e, removePolygonPalletById, toggleShowDialogEditShapeStyle, setItemAnnotationStyling) => {
    clearAllPopups(map);
    const popup = L.popup();
    popup
        .setLatLng([e.latlng.lat, e.latlng.lng])
        .setContent(annotationPalletPopupHTML)
        .addTo(map);

    let id = e.target.options.index;
    let type = e.target.options.type;

    window.deleteAnnotation = () => {
        map.removeLayer(popup);
        map.removeLayer(e.target);
        map.eachLayer(layer => {
            if (layer.options.index === id && layer.options.type === type) {
                map.removeLayer(layer)
            }
        });
        removePolygonPalletById(id)
    }

    window.editStyleAnnotation = () => {
        map.removeLayer(popup);
        toggleShowDialogEditShapeStyle();
        setItemAnnotationStyling(id, type)
    }
}
