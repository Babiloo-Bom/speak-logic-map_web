import L from 'leaflet';
import "leaflet.motion/dist/leaflet.motion.js";
import 'leaflet.path.drag';
import {addSelectedItem} from './HandleSelectItem';
import {
    markerCountryFnIcon,
    markerDistancePointIcon,
    markerFnIcon,
    markerHouseIcon,
    markerMapElementIcon,
    markerNavigationSignIcon,
    markerPersonIcon,
    markerPersonWaveIcon,
    markerPrincipleLineIcon,
    markerRelateIcon
} from './MarkerIcons';
import styles from '../_MapContents.module.scss';
import {
    annotationPalletPopup,
    distancePopup,
    fnCountryPopup,
    fnProblemPopup,
    functionPopup,
    givenSetPopup,
    mapElementPopup, personMobilityPopup,
    personPopup,
    routePopup,
    stopFnPopup,
    tempFnPopup, textPalletPopup
} from '../Popups/Popups';
import {
    groupFnLayoutPopupHTML,
    housePopupHTML,
    welcomeSignPopupHTML
} from '../Popups/PopupHTMLs'

import {
    arcRouteInit,
    clickArc,
    clickArrow,
    clickLine,
    dragEndHandler,
    dragHandlerLine,
    dragStartHandler,
    staticArcRouteInit
} from './HandleRouteAndDistance';
import {unitDistance} from "@/components/Map/MapContents/Variables/Variables";

export const checkMarkerExist = (map, index, type, lat, lng) => {
    let existArr = [];
    map.eachLayer(layer => {
        if (layer.options.target?.status === 'add'
            && layer.options.target?.type === type
            && Number(layer.options.target?.index) === Number(index)
            && layer._latlng?.lat === lat
            && layer._latlng?.lng === lng
        ) {
            existArr.push(true)
        } else {
            existArr.push(false)
        }
    });

    return existArr.includes(true);
}

export const addMarkerPerson = (map, lat, lng, index, isLocked, setModal, setModalType, setPersonToListMapElementSelected,
                                resetNumberPersonMobility, updateMapLayerById, removeMapLayerById) => {
    let marker = L.marker([lat, lng], {
        target: {
            type: 'person',
            index: index,
            status: 'add',
        },
        draggable: !isLocked,
        icon: markerPersonIcon(`${styles['icon-mobility']} ${styles['person']}`, `Person ${index}`, null)
    })
        .on('contextmenu', e => personPopup(map, marker, setModal, setModalType, isLocked, e,
            setPersonToListMapElementSelected, resetNumberPersonMobility, updateMapLayerById, removeMapLayerById))
        .on('click', e => addSelectedItem(e, map, isLocked))
        .addTo(map);
    marker.on('dragend', function (event) {
        let latLng = event.target._latlng;
        updateMapLayerById(latLng.lat, latLng.lng, 'person', `Person ${index}`, false)
    })
}


export const addMarkerFn = (container, lat, lng, index, isLocked, setModal, setModalType, name, customIndex, customClass,
                            setShapeOfMarkerFn, addMarkerProblemToList, setShapeOfMarkerPl, removeMapLayerById, updateStatusDisplayMapLayerByNameAndType,
                            updateStatusDisplayListMarkerFunctionByName, setMapLayer, updateNameItemMapLayerByNameAndType,
                            updateNameItemListMarkerFunctionByName, updateMapLayerById, shape) => {
    let marker = L.marker([lat, lng], {
        target: {
            type: 'function',
            shape: shape,
            index: index,
            status: 'add',
        },
        icon: markerFnIcon(
            `${shape === 'ellipse' ? styles['ellipse-fn'] : shape === 'circle' ? styles['circle-fn'] : styles['rectangle-fn']} 
            ${styles['fn--black']} ${customClass}`,
            `${name && customIndex ? `${name} ${customIndex[0]}` : (name ? `${name}` : `Function ${index}`)}`
        ),
        draggable: !isLocked,
    })
        .on('contextmenu', e => functionPopup(container, setModal, setModalType, isLocked, e, setShapeOfMarkerFn,
            addMarkerProblemToList, setShapeOfMarkerPl, removeMapLayerById, updateStatusDisplayMapLayerByNameAndType,
            updateStatusDisplayListMarkerFunctionByName, setMapLayer, updateNameItemMapLayerByNameAndType,
            updateNameItemListMarkerFunctionByName
        ))
        .on('click', e => addSelectedItem(e, container, isLocked))
        // .on('dblclick', e => toggleBoundaryFn(e))
        .addTo(container);

    marker.on('dragend', function (event) {
        let latLng = event.target._latlng;
        updateMapLayerById(latLng.lat, latLng.lng, 'function', `Function ${index}`, false)
    })
}

export const addMarkerFnEllipse = (container, lat, lng, index, isLocked, setModal, setModalType, name, customIndex, customClass,
                                   setShapeOfMarkerFn, addMarkerProblemToList, setShapeOfMarkerPl, shape) => {
    const fnMarker = L.marker([lat, lng], {
        target: {
            type: 'function',
            shape: 'ellipse',
            index: index,
            status: 'add',
        },
        icon: markerFnIcon(
            `${styles['ellipse-fn']} ${styles['fn--black']} ${customClass}`,
            `${name && customIndex ? `${name} ${customIndex[0]}` : (name ? `${name}` : `Function ${index}`)}`
        ),
        draggable: !isLocked,
    })
        .on('contextmenu', e => functionPopup(container, setModal, setModalType, isLocked, e, setShapeOfMarkerFn,
            addMarkerProblemToList, setShapeOfMarkerPl))
        .on('click', e => addSelectedItem(e, container, isLocked))
        // .on('dblclick', e => toggleBoundaryFn(e))
        .addTo(container);

    return fnMarker;
}

export const addMarkerCountryFn = (map, lat, lng, name, countryName, isLocked, width = 200, height = 100, fontSize = 16, setModal, setModalType) => {
    L.marker([lat, lng], {
        target: {
            type: 'country-function',
            shape: 'ellipse',
            status: 'add',
        },
        icon: markerCountryFnIcon(
            `${styles['ellipse-fn']} ${styles['country-fn']} ${styles['fn--black']}`,
            countryName,
            name,
            width,
            height,
            fontSize,
        ),
        draggable: !isLocked,
    })
        .on('contextmenu', e => fnCountryPopup(map, e, setModal, setModalType))
        .addTo(map);
}

export const addMarkerCountryGroupFn = (map, lat, lng, name, countryName, group, isLocked, width = 200, height = 100, fontSize = 16, setModal, setModalType) => {
    L.marker([lat, lng], {
        draggable: !isLocked,
        target: {
            type: 'country-function',
        },
        group: {
            group: [...group],
            status: "add",
        },
        icon: markerCountryFnIcon(
            `${styles["ellipse-fn"]} ${styles["group-fn-border"]} ${styles['country-fn']}`,
            name,
            countryName,
            width,
            height,
            fontSize,
        ),
    })
        .addTo(map)
        .bindPopup(
            (e) => groupFnLayoutPopupHTML(e.options.group.group),
            {
                className: `${styles["group-ellipse"]}`,
                offset: L.point(30, -12),
                autoClose: false,
                closeOnClick: false,
            }
        )
        .on("contextmenu", (e) => fnCountryPopup(map, e, setModal, setModalType))
        .on("popupclose", (e) => e.target?._icon?.classList.add(`${styles["group-fn-border"]}`))
        .on("popupopen", (e) => e.target?._icon?.classList.remove(`${styles["group-fn-border"]}`))
        .openPopup();
}

export const addMarkerWelcomeSign = (map, lat, lng, isLocked) => {
    L.marker([lat, lng], {
        target: {status: 'add', type: 'welcome'},
        icon: markerNavigationSignIcon(),
        draggable: !isLocked,
    })
        .on('contextmenu', e => {
            const welcomePopup = L.popup()
                .setLatLng([lat, lng])
                .setContent(welcomeSignPopupHTML())
                .addTo(map);

            window.deleteWelcome = () => {
                map.removeLayer(e.target);
                map.removeLayer(welcomePopup);
            }
        })
        .addTo(map)
}

export const addHouseMarker = (map, lat, lng, isLocked) => {
    L.marker([lat, lng], {
        target: {status: 'add', type: 'house'},
        icon: markerHouseIcon(),
        draggable: !isLocked,
    })
        .on('contextmenu', e => {
            const housePopup = L.popup()
                .setLatLng([lat, lng])
                .setContent(housePopupHTML())
                .addTo(map);

            window.deleteHouse = () => {
                map.removeLayer(e.target);
                map.removeLayer(housePopup);
            }
        })
        .addTo(map)
}

export const addSoluOrProbFn = (map, lat, lng, isLocked, index, name, setModal, setModalType, setShapeOfMarkerPl, addMarkerFnToList, setMapLayer,
                                updateStatusDisplayListMarkerProblemByName, updateStatusDisplayMapLayerByNameAndType,
                                updateMapLayerById, shape) => {
    const formattedName = String(name).toLowerCase();
    const first = formattedName[0].toUpperCase();
    const remain = formattedName.slice(1, formattedName.length);

    let marker = L.marker([lat, lng], {
        draggable: !isLocked,
        type: {index: index, title: 'problem', status: 'add'},
        target: {
            type: 'problem',
            index: index,
            status: 'add',
            shape: shape
        },
        icon: markerFnIcon(
            `${shape === 'ellipse' ? styles['ellipse-fn'] : shape === 'circle' ? styles['circle-fn-1'] : styles['rectangle-fn']} 
            ${formattedName === 'solution' ? styles['fn--green'] : styles['fn--red']}`,
            `${name ? `${first}${remain} ${index}` : `Function ${index}`}`
        ),
    })
        .addTo(map)
        .on('contextmenu', e => fnProblemPopup(map, e, setModal, setModalType, setShapeOfMarkerPl, addMarkerFnToList, setMapLayer,
            updateStatusDisplayListMarkerProblemByName, updateStatusDisplayMapLayerByNameAndType))
        .on('dblclick', e => {
            if (e.target.options.type.title === 'problem') {
                e.target.options.type.title = 'solution';
                e.target._icon.textContent = `Solution ${e.target.options.type.index}`;
                e.target._icon.classList.remove(styles['fn--red']);
                e.target._icon.classList.add(styles['fn--green']);
            } else {
                e.target.options.type.title = "problem";
                e.target._icon.textContent = `Problem ${e.target.options.type.index}`;
                e.target._icon.classList.remove(styles["fn--green"]);
                e.target._icon.classList.add(styles["fn--red"]);
            }
        });

    marker.on('dragend', function (event) {
        let latLng = event.target._latlng;
        updateMapLayerById(latLng.lat, latLng.lng, 'problem', `Problem ${index}`, false)
    })
}

export const addStopFn = (map, lat, lng, isLocked, index) => {
    L.marker([lat, lng], {
        draggable: !isLocked,
        type: {index: index, title: 'stop', status: 'add'},
        icon: markerFnIcon(
            `${styles['rectangle-fn']} ${styles['fn--black']}`,
            `<div class="${styles['stop-icon']}">STOP</div>`
        ),
    })
        .addTo(map)
        .on('contextmenu', e => stopFnPopup(map, e));
}

export const addTemporaryFn = (map, lat, lng, isLocked, index, name) => {
    L.marker([lat, lng], {
        draggable: !isLocked,
        type: {index: index, title: 'temporary', status: 'add'},
        icon: markerFnIcon(
            `${styles['rectangle-fn']} ${styles['fn--black']}`,
            `
        ${name}
        <div class="${styles['temp-icon']}">T</div>
      `
        ),
    })
        .addTo(map)
        .on('contextmenu', e => tempFnPopup(map, e));
}

export const addDistancePoint = (map, lat, lng, isLocked, type) => {
    const point = L.marker([lat, lng], {
        icon: markerDistancePointIcon(),
        draggable: !isLocked,
        options: {
            type: type ? type : 'distance',
        }
    })
        .on('dragstart', (e) => dragStartHandler(map, e))
        .on('drag', (e) => dragHandlerLine(map, e))
        .on('dragend', (e) => dragEndHandler(map))
        .addTo(map)

    return point;
}

export const addRoute = (map, lat, lng, isLocked) => {
    const lng2 = lng + 10;
    const distancePoint = addDistancePoint(map, lat, lng, isLocked);
    const distancePoint2 = addDistancePoint(map, lat, lng2, isLocked);

    const polyline_1 = new L.Polyline(
        [[lat, lng2], [lat, lng]],
        {color: 'transparent', status: 'add'}
    )
        .arrowheads({size: '5%', color: 'black', type: 'arrow', status: 'add'})
        .addTo(map);

    const polyline = new L.Polyline(
        [[lat, lng], [lat, lng2]],
        {kind: 'inter-route', type: 'line', color: 'black', status: 'add'}
    )
        .setText("Inter-route", {center: true, offset: -3})
        .arrowheads({color: 'black', type: 'arrow', size: '5%', status: 'add'})
        .on('contextmenu', (e) => routePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickLine(map, e, distancePoint, distancePoint2, 'Inter-route')
        )
        .addTo(map);

    distancePoint.parentLine = polyline;
    distancePoint2.parentLine = polyline;
    distancePoint.parentLine_1 = polyline_1;
    distancePoint2.parentLine_1 = polyline_1;

    const {latlng1, latlng2, midpointLatLng, pathOptions} = arcRouteInit(lat, lng);
    pathOptions.kind = 'inter-route';

    const curvedPath = L.curve(
        ['M', latlng1, 'Q', midpointLatLng, latlng2],
        pathOptions
    )
        .addTo(map)
        .on('contextmenu', (e) => routePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickArc(map, e, distancePoint, distancePoint2, 'Arc-route'))


    curvedPath.setText = polyline.setText;
    distancePoint.parentArc = curvedPath;
    distancePoint2.parentArc = curvedPath;
    distancePoint.on('click', (e) => clickArrow(map, distancePoint));
    distancePoint2.on('click', (e) => clickArrow(map, distancePoint2));
}

export const addDistance = (map, lat, lng, isLocked) => {
    const lng2 = lng + 10;
    const distancePoint = addDistancePoint(map, lat, lng, isLocked);
    const distancePoint2 = addDistancePoint(map, lat, lng2, isLocked);

    const polyline_1 = new L.Polyline(
        [[lat, lng2], [lat, lng]],
        {color: 'transparent', status: 'add'}
    )
        .arrowheads({size: '5%', color: 'black', type: 'arrow', status: 'add'})
        .addTo(map);

    const polyline = new L.Polyline(
        [[lat, lng], [lat, lng2]],
        {kind: 'distance', type: 'line', color: 'black', status: 'add'}
    )
        .setText("Distance", {center: true, offset: -3})
        .arrowheads({color: 'black', type: 'arrow', size: '5%', status: 'add'})
        .on('contextmenu', (e) => distancePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickLine(map, e, distancePoint, distancePoint2, 'Distance')
        )
        .addTo(map);

    distancePoint.parentLine = polyline;
    distancePoint2.parentLine = polyline;
    distancePoint.parentLine_1 = polyline_1;
    distancePoint2.parentLine_1 = polyline_1;

    const {latlng1, latlng2, midpointLatLng, pathOptions} = arcRouteInit(lat, lng);
    pathOptions.kind = 'distance';

    const curvedPath = L.curve(
        ['M', latlng1, 'Q', midpointLatLng, latlng2],
        pathOptions
    )
        .addTo(map)
        .on('contextmenu', (e) => distancePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickArc(map, e, distancePoint, distancePoint2, 'Distance'))


    curvedPath.setText = polyline.setText;
    distancePoint.parentArc = curvedPath;
    distancePoint2.parentArc = curvedPath;
    distancePoint.on('click', (e) => clickArrow(map, distancePoint));
    distancePoint2.on('click', (e) => clickArrow(map, distancePoint2));
}

const colors = ['darkred', 'darkgreen', 'darkblue', 'purple', 'black', 'darkorange', 'darkviolet', 'darkcyan', 'darkturquoise']

// Distance marker for 'Show Distance' option
export const addStaticDistance = (map, lat1, lng1, lat2, lng2, isLocked, type) => {
    const distancePoint = addDistancePoint(map, lat1, lng1, isLocked, type);
    const distancePoint2 = addDistancePoint(map, lat2, lng2, isLocked, type);

    const polyline_1 = new L.Polyline(
        [[lat2, lng2], [lat1, lng1]],
        {color: 'transparent', status: 'add'}
    )
        .arrowheads({size: '5px', color: 'black', type: 'arrow', status: 'add'})
        .addTo(map);

    let orientation = (distancePoint.getLatLng().lng < distancePoint2.getLatLng().lng) ? 0 : 180;

    const polyline = new L.Polyline(
        [[lat1, lng1], [lat2, lng2]],
        {kind: 'distance', type: 'line', color: 'black', status: 'add'}
    )

        .arrowheads({color: 'black', type: 'arrow', size: '5px', status: 'add'})
        .on('contextmenu', (e) => distancePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickLine(map, e, distancePoint, distancePoint2, 'Distance')
        )
        .addTo(map);

    const latLng = polyline.getLatLngs();
    const distance = map.distance(
        L.latLng(latLng[0].lat, latLng[0].lng),
        L.latLng(latLng[1].lat, latLng[1].lng)
    );

    polyline.setText((unitDistance[0] === 'mile' ? `${(distance * 0.001 * 0.6214).toFixed()} ${unitDistance[0]}` : `${(distance * 0.001).toFixed()} ${unitDistance[0]}`), {
        center: true,
        offset: -3,
        orientation: orientation,
        attributes: {fill: colors[Math.round(Math.random() * 10) % colors.length]}
    })

    distancePoint.parentLine = polyline;
    distancePoint2.parentLine = polyline;
    distancePoint.parentLine_1 = polyline_1;
    distancePoint2.parentLine_1 = polyline_1;

    const {latlng1, latlng2, midpointLatLng, pathOptions} = staticArcRouteInit(lat1, lng1, lat2, lng2);
    pathOptions.kind = 'distance';

    const curvedPath = L.curve(
        ['M', latlng1, 'Q', midpointLatLng, latlng2],
        pathOptions
    )
        .addTo(map)
        .on('contextmenu', (e) => distancePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickArc(map, e, distancePoint, distancePoint2, 'Distance'))


    curvedPath.setText = polyline.setText;
    distancePoint.parentArc = curvedPath;
    distancePoint2.parentArc = curvedPath;
    distancePoint.on('click', (e) => clickArrow(map, distancePoint));
    distancePoint2.on('click', (e) => clickArrow(map, distancePoint2));
}
//Show distance only d
export const addShotDistance = (map, lat1, lng1, lat2, lng2, isLocked, type) => {
    const distancePoint = addDistancePoint(map, lat1, lng1, isLocked, type);
    const distancePoint2 = addDistancePoint(map, lat2, lng2, isLocked, type);

    const polyline_1 = new L.Polyline(
        [[lat2, lng2], [lat1, lng1]],
        {color: 'transparent', status: 'add'}
    )
        .arrowheads({size: '5px', color: 'black', type: 'arrow', status: 'add'})
        .addTo(map);

    let orientation = (distancePoint.getLatLng().lng < distancePoint2.getLatLng().lng) ? 0 : 180;

    const polyline = new L.Polyline(
        [[lat1, lng1], [lat2, lng2]],
        {kind: 'distance', type: 'line', color: 'black', status: 'add'}
    )

        .arrowheads({color: 'black', type: 'arrow', size: '5px', status: 'add'})
        .on('contextmenu', (e) => distancePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickLine(map, e, distancePoint, distancePoint2, 'Distance')
        )
        .addTo(map);

    const latLng = polyline.getLatLngs();
    const distance = map.distance(
        L.latLng(latLng[0].lat, latLng[0].lng),
        L.latLng(latLng[1].lat, latLng[1].lng)
    );

    polyline.setText(`d`, {center: true, offset: -3, orientation: orientation, attributes: {fill: 'black'}})

    distancePoint.parentLine = polyline;
    distancePoint2.parentLine = polyline;
    distancePoint.parentLine_1 = polyline_1;
    distancePoint2.parentLine_1 = polyline_1;

    const {latlng1, latlng2, midpointLatLng, pathOptions} = staticArcRouteInit(lat1, lng1, lat2, lng2);
    pathOptions.kind = 'distance';

    const curvedPath = L.curve(
        ['M', latlng1, 'Q', midpointLatLng, latlng2],
        pathOptions
    )
        .addTo(map)
        .on('contextmenu', (e) => distancePopup(map, distancePoint, distancePoint2, e))
        .on('click', (e) => clickArc(map, e, distancePoint, distancePoint2, 'Distance'))


    curvedPath.setText = polyline.setText;
    distancePoint.parentArc = curvedPath;
    distancePoint2.parentArc = curvedPath;
    distancePoint.on('click', (e) => clickArrow(map, distancePoint));
    distancePoint2.on('click', (e) => clickArrow(map, distancePoint2));
}

export const addMarkerMapElement = (map, lat, lng, isLocked, mapElement, setMapElementRelate, setPositionOfMapElementSelected) => {
    setPositionOfMapElementSelected(lat, lng);
    L.marker([lat, lng], {
        draggable: !isLocked,
        type: {
            type: 'map-element',
            shape: 'rectangle',
            status: 'add',
        },
        icon: markerMapElementIcon(
            `${styles['rectangle-fn']} ${styles['map-element']} ${mapElement.noBorder ? styles['map-element-no-border'] : ''}`,
            `${mapElement.name}`
        ),
    }).addTo(map)
        .on('contextmenu', e => mapElementPopup(map, e, setMapElementRelate, mapElement.id))
        .on('click', e => addSelectedItem(e, map, isLocked))
}

export const addMarkerGivenSet = (map, lat, lng, index, isLocked, name, setChooseGivenSet, setPositionOfHorizontalLine, resetPositionOfHorizontalLine) => {
    setPositionOfHorizontalLine(lat, lng);
    let id1 = 'line-given-set-' + index;
    let id2 = 'arrow-given-set-' + index;
    L.marker([lat, lng], {
        draggable: !isLocked,
        type: {
            type: 'the-given-set',
            shape: 'rectangle',
            status: 'add',
            index: index
        },
        icon: markerFnIcon(
            `${styles['rectangle-fn']} ${styles['given-set-color']}`,
            `
        <b style="font-size: 18px">U</b><span style="margin-top: 12px;font-size: 12px;">T</span>
        <div id="${id1}" class="${styles['arrow-given-set-bottom']}"></div><div id="${id2}" class="${styles['arrow-down']}"></div>
      `
        ),
    }).addTo(map)
        .on('contextmenu', e => givenSetPopup(map, e, resetPositionOfHorizontalLine))
        .on('click', e => addSelectedItem(e, map, isLocked))
}

export const addMarkerPrincipleLine = (map, lat, lng, isLocked) => {
    L.marker([lat, lng], {
        target: {status: 'add'},
        icon: markerPrincipleLineIcon(),
        draggable: !isLocked,
    })
        .on('contextmenu', e => {
            const welcomePopup = L.popup()
                .setLatLng([lat, lng])
                .setContent(welcomeSignPopupHTML())
                .addTo(map);

            window.deleteWelcome = () => {
                map.removeLayer(e.target);
                map.removeLayer(welcomePopup);
            }
        })
        .addTo(map)
}

export const addRelateMarker = (map, lat, lng, isLocked) => {
    L.marker([lat, lng], {
        target: {status: 'add', type: 'relate'},
        icon: markerRelateIcon(),
        draggable: !isLocked,
    })
        .on('contextmenu', e => {
            const housePopup = L.popup()
                .setLatLng([lat, lng])
                .setContent(housePopupHTML())
                .addTo(map);

            window.deleteHouse = () => {
                map.removeLayer(e.target);
                map.removeLayer(housePopup);
            }
        })
        .addTo(map)
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const addPersonInMobility = (map, lat, lng, isLocked, numberPersonMobility, setNumberPersonMobility,
                                    setPositionOfPreviewPerson, positionOfPreviewPerson, typeMobility, setModal, setModalType) => {
    let marker = L.marker([lat, lng], {
        target: {status: 'add', type: 'person-mobility', index: randomIntFromInterval(0, 99)},
        icon: markerPersonWaveIcon(null, 'Person', null),
        draggable: !isLocked,
    })
        .on('contextmenu', e => personMobilityPopup(map, marker, setModal, setModalType, isLocked, e))
        .addTo(map);
    // setNumberPersonMobility();
    // if (numberPersonMobility % 2 === 0) {
    //     setPositionOfPreviewPerson(lat, lng);
    //     let marker = L.marker([lat, lng], {
    //         target: {status: 'add', type: 'person-mobility'},
    //         icon: markerPersonWaveIcon(null, 'Person', null),
    //         draggable: !isLocked,
    //     })
    //         .on('contextmenu', e => personMobilityPopup(map, marker, setModal, setModalType, isLocked, e))
    //         .addTo(map);
    // } else {
    //     map.eachLayer(layer => {
    //         if (layer.options.target?.type === 'person-mobility') {
    //             map.removeLayer(layer);
    //         }
    //     });
    //     L.motion.polyline(
    //         [
    //             positionOfPreviewPerson,
    //             [lat, lng]
    //         ],
    //         {
    //             color: typeMobility === 'path' ? 'black' : "transparent",
    //             status: 'add',
    //             type: 'person-mobility'
    //         },
    //         {
    //             auto: true,
    //             duration: 3000
    //         },
    //         {
    //             removeOnEnd: false,
    //             showMarker: true,
    //             icon: markerPersonWaveIcon(`${styles['icon-mobility']}`, 'Person', null)
    //         }
    //     )
    //         .arrowheads({
    //             size: '5%',
    //             color: typeMobility === 'path' ? 'black' : "transparent",
    //             type: 'arrow',
    //             status: 'add'
    //         })
    //         .addTo(map)
    // }
}

export const addInputTextPallet = (map, lat, lng, index, isLocked, toggleShowDialogEditTextStyle, style, setItemAnnotationStyling,
                                   setValueTextPallet, valueText, removeTextPalletById, updatePositionTextPalletById) => {
    let divIcon = L.divIcon({
        html: makeHtml(index, valueText, style.fontFamily, Number(style.fontSize), style.fontColor, style.fontStyle, style.textAlign),
        className: 'input-text-pallet',
        iconSize: [200, 50],
        iconAnchor: [0, 0]
    });
    let marker = L.marker([lat, lng], {
        icon: divIcon,
        target: {status: 'add', type: 'input-text', index: index},
        draggable: !isLocked,
    })
        .on('contextmenu', e => textPalletPopup(map, e, toggleShowDialogEditTextStyle, setItemAnnotationStyling, setValueTextPallet, removeTextPalletById))
        .addTo(map);

    document.getElementById(`input_text_${index}`).addEventListener('change', () => {
        let value = document.getElementById(`input_text_${index}`).value;
        setValueTextPallet(index, value);
    })

    marker.on('dragend', function (event) {
        let latLng = event.target._latlng;
        updatePositionTextPalletById(index, latLng.lat, latLng.lng)
    })
}

function makeHtml(id, valueText, fontFamily, fontSize, fontColor, style, textAlign) {
    let textDecoration = style.includes('underline') ? 'underline' : 'none'
    let fontStyle = style.includes('italic') ? 'italic' : 'normal'
    let fontWeight = style.includes('bold') ? 600 : 'normal'
    let styleTextarea = `border: 1px solid gray; border-radius: 5px; font-size: ${fontSize}px; font-weight: ${fontWeight};
    color: ${fontColor}; font-family: ${fontFamily}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; text-align: ${textAlign};
    min-width: 250px;min-height: 100px;`
    return '<textarea class="input-text-pallet" style="' + styleTextarea + '" ' +
        'type="text" id="input_text_' + id + '" rows="4">' + valueText + '</textarea>'
}

export const addInputImagePallet = (map, lat, lng, id, isLocked, togglePalletOption, updateValueImagePalletById, setValueOfImage) => {
    let divIcon = L.divIcon({
        html: inputImageHtml(id),
        className: 'divIcon',
        iconSize: [200, 50],
        iconAnchor: [0, 0]
    });
    L.marker([lat, lng], {
        icon: divIcon,
        index: id,
        status: 'add',
        type: 'input-image'
    }).addTo(map);
    togglePalletOption('');
    window.changeFileImage = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);

        let id = event.target.id;

        updateValueImagePalletById(id, objectUrl);
        setValueOfImage(objectUrl);
        map.eachLayer(layer => {
            if (layer.options?.type === 'input-image' && layer.options?.index.toString() === id.toString()) {
                map.removeLayer(layer);
            }
        })
    }
}

function inputImageHtml(id) {
    return '<input id="' + id + '" type="file" accept="image/png, image/jpg, image/jpeg" onChange="changeFileImage(event)" />'
}
